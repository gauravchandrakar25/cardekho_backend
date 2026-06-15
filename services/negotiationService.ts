import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import { supabaseService } from './supabaseService';
import { Car } from '../db/carsData';
import * as dotenv from 'dotenv';

dotenv.config();

export interface PricingBreakdown {
  exShowroom: number;
  rtoRegistration: number;
  insurance: number;
  tcs: number;
  fastag: number;
  essentialKit: number;
  handlingCharges: number;
  extendedWarranty: number;
  onRoadPrice: number;
}

export interface HiddenFeeChecklist {
  name: string;
  amount: number;
  status: 'Negotiable' | 'Waivable' | 'Optional' | 'Recommended but Negotiable';
  description: string;
  tactic: string;
}

export interface NegotiationScriptPhase {
  phaseName: string;
  dealerOpening: string;
  yourResponse: string;
}

export interface NegotiationScript {
  strategy: string;
  phases: NegotiationScriptPhase[];
}

export interface NegotiationKitResult {
  carName: string;
  variant: string;
  pricing: PricingBreakdown;
  hiddenFeesChecklist: HiddenFeeChecklist[];
  negotiationScript: NegotiationScript;
}

class NegotiationService {
  private gemini: GoogleGenerativeAI | null = null;
  private anthropic: Anthropic | null = null;

  constructor() {
    const geminiKey = process.env.GEMINI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;

    if (geminiKey) {
      this.gemini = new GoogleGenerativeAI(geminiKey);
    }
    if (anthropicKey) {
      this.anthropic = new Anthropic({ apiKey: anthropicKey });
    }
  }

  /**
   * Main entry point to generate negotiation kit
   */
  public async generateKit(carName: string, variant: string): Promise<NegotiationKitResult> {
    // 1. Fetch car data
    const cars = await supabaseService.getCars();
    const car = cars.find(
      c => c.name.toLowerCase() === carName.toLowerCase() || 
           `${c.brand} ${c.name}`.toLowerCase() === carName.toLowerCase()
    );

    if (!car) {
      throw new Error(`Car "${carName}" not found in database.`);
    }

    // 2. Compute local variant pricing breakdown
    const pricing = this.calculateVariantPricing(car, variant);

    // 3. Try to generate script via AI if keys are present
    if (this.gemini) {
      try {
        console.log(`🤖 [Negotiation Kit] Querying Primary LLM for ${car.brand} ${car.name} (${variant})...`);
        return await this.generateWithPrimaryLLM(car, variant, pricing);
      } catch (err) {
        console.error('❌ Primary LLM negotiation generation failed, trying secondary model:', err);
      }
    }

    if (this.anthropic) {
      try {
        console.log(`🤖 [Negotiation Kit] Querying Secondary LLM for ${car.brand} ${car.name} (${variant})...`);
        return await this.generateWithSecondaryLLM(car, variant, pricing);
      } catch (err) {
        console.error('❌ Secondary LLM negotiation generation failed, using fallback:', err);
      }
    }

    // Heuristic Fallback
    console.log(`💾 [Negotiation Kit] Using local template fallback for ${car.brand} ${car.name}.`);
    return this.generateLocalFallback(car, variant, pricing);
  }

  /**
   * Calculates pricing itemization based on variant rules
   */
  private calculateVariantPricing(car: Car, variant: string): PricingBreakdown {
    // 1. Determine Ex-showroom price based on variant
    let exShowroom = car.price_min; // Default Base
    const diff = car.price_max - car.price_min;

    if (variant.toLowerCase().includes('top') || variant.toLowerCase().includes('luxury') || variant.toLowerCase().includes('alpha') || variant.toLowerCase().includes('xz+')) {
      exShowroom = car.price_max;
    } else if (variant.toLowerCase().includes('mid') || variant.toLowerCase().includes('delta') || variant.toLowerCase().includes('creative')) {
      exShowroom = car.price_min + diff * 0.45;
    }

    // Round to 2 decimals
    exShowroom = parseFloat(exShowroom.toFixed(2));

    // 2. Calculate breakdowns (in Lakhs)
    const rtoRegistration = parseFloat((exShowroom * 0.10).toFixed(2)); // 10% registration
    const insurance = parseFloat((exShowroom * 0.04).toFixed(2)); // 4% insurance
    const tcs = exShowroom >= 10.0 ? parseFloat((exShowroom * 0.01).toFixed(2)) : 0; // 1% TCS
    const fastag = 0.006; // flat ₹600
    const essentialKit = parseFloat((exShowroom * 0.015).toFixed(2)); // ~1.5% accessory pack
    
    // Handling charges (hidden dealer fee) - capped at ₹15,000
    const handlingCharges = parseFloat(Math.min(exShowroom * 0.01, 0.15).toFixed(2));
    
    const extendedWarranty = parseFloat((exShowroom * 0.018).toFixed(2)); // ~1.8% warranty

    const onRoadPrice = parseFloat(
      (
        exShowroom +
        rtoRegistration +
        insurance +
        tcs +
        fastag +
        essentialKit +
        handlingCharges +
        extendedWarranty
      ).toFixed(2)
    );

    return {
      exShowroom,
      rtoRegistration,
      insurance,
      tcs,
      fastag,
      essentialKit,
      handlingCharges,
      extendedWarranty,
      onRoadPrice
    };
  }

  /**
   * Calls primary LLM for a custom kit
   */
  private async generateWithPrimaryLLM(car: Car, variant: string, pricing: PricingBreakdown): Promise<NegotiationKitResult> {
    if (!this.gemini) throw new Error('Primary LLM SDK not initialized');

    const prompt = this.buildAIPrompt(car, variant, pricing);
    
    const model = this.gemini.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
      systemInstruction: 'You are a professional car purchasing concierge at VALT. Your job is to create a highly specific, customized dealer negotiation kit including a checklist of hidden fees and an interactive negotiation script for a client. Output strictly in valid JSON matching the requested schema.'
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return this.parseJSONResponse(responseText, car, variant, pricing);
  }

  /**
   * Calls secondary LLM for a custom kit
   */
  private async generateWithSecondaryLLM(car: Car, variant: string, pricing: PricingBreakdown): Promise<NegotiationKitResult> {
    if (!this.anthropic) throw new Error('Secondary LLM SDK not initialized');

    const prompt = this.buildAIPrompt(car, variant, pricing);

    const message = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2500,
      temperature: 0.25,
      system: 'You are a professional car purchasing concierge at VALT. Your job is to create a highly specific, customized dealer negotiation kit including a checklist of hidden fees and an interactive negotiation script for a client. Output ONLY a valid JSON object matching the requested schema. No preambles, no wrappers. Just raw JSON.',
      messages: [{ role: 'user', content: prompt }]
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    return this.parseJSONResponse(responseText, car, variant, pricing);
  }

  /**
   * Standard prompt builder for Negotiation Kit
   */
  private buildAIPrompt(car: Car, variant: string, pricing: PricingBreakdown): string {
    return `
Create a Dealer Negotiation Kit for the car:
- Brand & Model: ${car.brand} ${car.name}
- Variant: ${variant}
- Fuel Type: ${car.fuel_type}
- Price Breakdown:
  - Ex-Showroom: ₹${(pricing.exShowroom * 100000).toLocaleString('en-IN')}
  - RTO Registration: ₹${(pricing.rtoRegistration * 100000).toLocaleString('en-IN')}
  - Insurance: ₹${(pricing.insurance * 100000).toLocaleString('en-IN')}
  - Essential accessory kit: ₹${(pricing.essentialKit * 100000).toLocaleString('en-IN')}
  - Dealer handling charges: ₹${(pricing.handlingCharges * 100000).toLocaleString('en-IN')}
  - Extended Warranty: ₹${(pricing.extendedWarranty * 100000).toLocaleString('en-IN')}
  - On-Road Price: ₹${(pricing.onRoadPrice * 100000).toLocaleString('en-IN')}

Instructions:
1. Review the pricing. Identify hidden fees that the dealer could waive or discount (e.g. handling/logistics charges which are illegal, insurance markup where they can buy outside, accessories markup, or warranty discount).
2. Create a checklist of 4 "hiddenFeesChecklist" items. For each item:
   - "name": The fee name.
   - "amount": Integer amount in Rupees (not Lakhs).
   - "status": Choose from "Negotiable", "Waivable", "Optional", "Recommended but Negotiable".
   - "description": Why the dealer charges this and what the true value is.
   - "tactic": The exact tactic to use to get this fee removed or reduced.
3. Write a conversational "negotiationScript" with a global "strategy" and 4 interactive dialog "phases" (e.g. "Establish Control", "Waiver of Handling Fees", "Insurance Match", "Closing the Booking").
   - For each phase, specify:
     - "phaseName": e.g., "Establish Control"
     - "dealerOpening": A typical line the dealer salesman will say (e.g. focused on EMI or down payments).
     - "yourResponse": A professional, firm response redirecting the conversation to Out-The-Door price or requesting the removal of specific fees. Use the car name, variant, and pricing numbers where appropriate!

Output format MUST match this JSON structure:
{
  "hiddenFeesChecklist": [
    {
      "name": "Handling / Logistics Charges",
      "amount": 10000,
      "status": "Waivable",
      "description": "...",
      "tactic": "..."
    }
  ],
  "negotiationScript": {
    "strategy": "...",
    "phases": [
      {
        "phaseName": "Phase Name",
        "dealerOpening": "...",
        "yourResponse": "..."
      }
    ]
  }
}
`;
  }

  /**
   * Helper to parse and sanitize JSON
   */
  private parseJSONResponse(rawText: string, car: Car, variant: string, pricing: PricingBreakdown): NegotiationKitResult {
    let cleanText = rawText.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.substring(7);
    }
    if (cleanText.startsWith('```')) {
      cleanText = cleanText.substring(3);
    }
    if (cleanText.endsWith('```')) {
      cleanText = cleanText.substring(0, cleanText.length - 3);
    }
    cleanText = cleanText.trim();

    const parsed = JSON.parse(cleanText);
    
    return {
      carName: `${car.brand} ${car.name}`,
      variant,
      pricing,
      hiddenFeesChecklist: parsed.hiddenFeesChecklist || [],
      negotiationScript: parsed.negotiationScript || { strategy: '', phases: [] }
    };
  }

  /**
   * High-fidelity local template fallback
   */
  private generateLocalFallback(car: Car, variant: string, pricing: PricingBreakdown): NegotiationKitResult {
    const carFullName = `${car.brand} ${car.name}`;
    const handlingAmount = Math.round(pricing.handlingCharges * 100000);
    const accessoryAmount = Math.round(pricing.essentialKit * 100000);
    const insuranceAmount = Math.round(pricing.insurance * 100000);
    const warrantyAmount = Math.round(pricing.extendedWarranty * 100000);

    const hiddenFeesChecklist: HiddenFeeChecklist[] = [
      {
        name: 'Logistics / Handling Charges',
        amount: handlingAmount,
        status: 'Waivable',
        description: 'Charges billed by dealers for transporting the car from the yard to the showroom. RTO guidelines prohibit logistics charges as they are already factored into the dealer margins.',
        tactic: 'Advise the sales representative that handling charges are illegal under State RTO directives. Request it to be removed immediately or ask for a written invoice detailing this fee to report it.'
      },
      {
        name: 'Dealer Motor Insurance Premium Markup',
        amount: Math.round(insuranceAmount * 0.35), // Assume 35% savings
        status: 'Negotiable',
        description: 'Dealers markup insurance premiums by 30-40% compared to buying directly from the insurance provider online.',
        tactic: 'Get a direct online quote from leading insurers (Tata AIG, ICICI Lombard, HDFC Ergo) for the exact same coverage. Show this quote to the dealer and request they match it, or let you buy it independently.'
      },
      {
        name: 'Essential Accessory Kit Bundle',
        amount: accessoryAmount,
        status: 'Optional',
        description: 'Pre-packaged items like floor mats, mud flaps, car covers, and seat covers. These are marked up highly and often mandatory on invoices.',
        tactic: 'Tell the dealer to remove the bundle. Inspect the individual items and select only essential ones, or state that you will purchase them from aftermarket accessory shops for half the price.'
      },
      {
        name: 'Extended Warranty Premium',
        amount: Math.round(warrantyAmount * 0.15), // Assume 15% discount
        status: 'Recommended but Negotiable',
        description: 'Crucial for coverage but dealers have a high margin on this add-on.',
        tactic: 'Keep the extended warranty for peace of mind, but ask the dealer to waive handling charges or give a 15-20% discount on the warranty premium to close the deal today.'
      }
    ];

    const targetOtd = (pricing.onRoadPrice - pricing.handlingCharges - pricing.essentialKit * 0.5 - pricing.insurance * 0.25).toFixed(2);

    const negotiationScript: NegotiationScript = {
      strategy: `Prioritize the 'Out-the-Door' (OTD) total on-road price. Refuse to discuss finance details, monthly EMI, or down payment size until a final written on-road quote is locked down. Dealers frequently adjust loan margins to hide accessory and logistics markups.`,
      phases: [
        {
          phaseName: 'Establish Control',
          dealerOpening: "Let's work out a monthly payment plan that matches your salary. We have bank deals that will keep your EMI very low.",
          yourResponse: `I appreciate that, but I want to negotiate the Out-the-Door (OTD) on-road price of the ${carFullName} ${variant} first. Once we agree on a final price for the vehicle, I will decide whether to go with my pre-approved bank loan or use your financing.`
        },
        {
          phaseName: 'Challenge Handling & Accessories charges',
          dealerOpening: 'The logistics charge of ₹' + handlingAmount.toLocaleString('en-IN') + ' and the accessory kit of ₹' + accessoryAmount.toLocaleString('en-IN') + ' are standard dealer fees and cannot be edited in our billing system.',
          yourResponse: 'Logistics fees have been declared illegal by multiple RTO directives. Additionally, I would like to buy accessories separately. Please remove the logistics charges and let me select individual accessories to adjust this invoice.'
        },
        {
          phaseName: 'Counter the Insurance Quote',
          dealerOpening: 'If you buy insurance outside, we cannot support cashless repairs at our body shop in case of an accident.',
          yourResponse: 'Cashless claims are governed by the tie-up between the insurance company and your workshop, not by who sells the policy. Here is an online quote for ₹' + Math.round(insuranceAmount * 0.65).toLocaleString('en-IN') + ' for the exact same coverage. If you can match this premium, I will buy it from you, otherwise please remove it from the quote.'
        },
        {
          phaseName: 'The Final Out-The-Door Close',
          dealerOpening: 'What will it take for us to lock in your booking today? The waiting periods are increasing.',
          yourResponse: 'If you remove the handling fee, discount the insurance premium to match the online quote, and throw in the floor mats, I will sign the booking form and write the booking check of ₹50,000 right now for an Out-The-Door price of ₹' + targetOtd + ' Lakhs.'
        }
      ]
    };

    return {
      carName: carFullName,
      variant,
      pricing,
      hiddenFeesChecklist,
      negotiationScript
    };
  }
}

export const negotiationService = new NegotiationService();
