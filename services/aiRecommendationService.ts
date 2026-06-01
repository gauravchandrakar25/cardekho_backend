import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Car, carsData } from '../db/carsData';
import { FilterCriteria } from './carFilterService';
import * as dotenv from 'dotenv';

dotenv.config();

export interface RecommendedCar {
  name: string;
  score: number;
  whyFit: string;
  tradeOffs: string;
  idealBuyer: string;
}

export interface RejectedCar {
  name: string;
  reason: string;
}

export interface AIRecommendationResult {
  recommendedCars: RecommendedCar[];
  selectionReasoning: string[];
  rejectedCars: RejectedCar[];
}

class AIRecommendationService {
  private gemini: GoogleGenerativeAI | null = null;
  private anthropic: Anthropic | null = null;

  constructor() {
    const geminiKey = process.env.GEMINI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;

    if (geminiKey) {
      this.gemini = new GoogleGenerativeAI(geminiKey);
      console.log('🤖 Google Gemini AI configured.');
    }
    if (anthropicKey) {
      this.anthropic = new Anthropic({ apiKey: anthropicKey });
      console.log('🤖 Anthropic Claude AI configured.');
    }

    if (!geminiKey && !anthropicKey) {
      console.log('ℹ️ No AI API keys detected. Running with Rule-Based Mock AI Engine.');
    }
  }

  /**
   * Main recommendation router
   */
  public async getRecommendations(
    criteria: FilterCriteria,
    candidates: Car[]
  ): Promise<AIRecommendationResult> {
    if (candidates.length === 0) {
      return this.getEmptyFallbackResult(criteria);
    }

    // Try Gemini (Primary)
    if (this.gemini) {
      try {
        console.log('🤖 Requesting recommendations from Google Gemini...');
        return await this.callGemini(criteria, candidates);
      } catch (err) {
        console.error('❌ Gemini API call failed, attempting Anthropic Claude fallback:', err);
      }
    }

    // Try Claude (Fallback)
    if (this.anthropic) {
      try {
        console.log('🤖 Requesting recommendations from Anthropic Claude...');
        return await this.callClaude(criteria, candidates);
      } catch (err) {
        console.error('❌ Claude API call failed, defaulting to Local Mock Engine:', err);
      }
    }

    // Heuristic Fallback
    console.log('💾 Running Local Heuristic Mock AI Recommendation Engine.');
    return this.generateMockRecommendations(criteria, candidates);
  }

  /**
   * Call Google Gemini API
   */
  private async callGemini(criteria: FilterCriteria, candidates: Car[]): Promise<AIRecommendationResult> {
    if (!this.gemini) throw new Error('Gemini SDK not initialized');

    const prompt = this.buildPrompt(criteria, candidates);
    
    const model = this.gemini.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
      systemInstruction: 'You are a senior automotive purchase consultant at CarDekho. Your job is to select the top 3 cars from the candidate list that fit the user preferences, score them out of 100, explain why they fit, list critical tradeoffs, and describe the ideal buyer. You must also select 2-3 cars to reject (either from candidate list or comparative alternatives list) and explain why. Output strictly in valid JSON matching the requested schema.'
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return this.parseJSONResponse(responseText);
  }

  /**
   * Call Anthropic Claude API
   */
  private async callClaude(criteria: FilterCriteria, candidates: Car[]): Promise<AIRecommendationResult> {
    if (!this.anthropic) throw new Error('Claude SDK not initialized');

    const prompt = this.buildPrompt(criteria, candidates);

    const message = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 3000,
      temperature: 0.2,
      system: 'You are a senior automotive purchase consultant at CarDekho. Your job is to select the top 3 cars from the candidate list that fit the user preferences, score them out of 100, explain why they fit, list critical tradeoffs, and describe the ideal buyer. You must also select 2-3 cars to reject (either from candidate list or comparative alternatives list) and explain why. Output ONLY a valid JSON object matching the requested schema. No conversational preamble, no markdown code block wraps. Just raw JSON.',
      messages: [{ role: 'user', content: prompt }]
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    return this.parseJSONResponse(responseText);
  }

  /**
   * Standardized Prompt Builder
   */
  private buildPrompt(criteria: FilterCriteria, candidates: Car[]): string {
    // Pick 3 prominent comparative excluded cars from our shared carsData list that failed the active filters
    const excluded = carsData.filter(car => 
      !candidates.some(c => c.name === car.name && c.brand === car.brand)
    ).slice(0, 3);

    const formattedCandidates = candidates.map(c => `
- Brand & Name: ${c.brand} ${c.name} [FIT CANDIDATE]
  Body: ${c.body_type}, Fuel: ${c.fuel_type}
  Price Range: ${c.price_min} - ${c.price_max} Lakhs
  Mileage: ${c.mileage} ${c.fuel_type === 'EV' ? 'km/charge' : 'kmpl'}
  Safety Rating: ${c.safety_rating} Stars
  Transmission: ${c.transmission}
  Description: ${c.description}
    `).join('\n');

    const formattedExcluded = excluded.map(c => `
- Brand & Name: ${c.brand} ${c.name} [EXCLUDED COMPARATIVE ALTERNATIVE - FAILED FILTERS]
  Body: ${c.body_type}, Fuel: ${c.fuel_type}
  Price Range: ${c.price_min} - ${c.price_max} Lakhs
  Mileage: ${c.mileage} ${c.fuel_type === 'EV' ? 'km/charge' : 'kmpl'}
  Safety Rating: ${c.safety_rating} Stars
  Transmission: ${c.transmission}
  Description: ${c.description}
    `).join('\n');

    return `
Please analyze the following car candidates and recommend the top 3 options that best align with the buyer's preferences.

### User Preferences:
- Budget Range: ${criteria.budget}
- Family Size: ${criteria.familySize}
- Primary Usage: ${criteria.primaryUsage}
- Fuel Preference: ${criteria.fuelPreference}
- Body Type: ${criteria.bodyType}
- Top Priority: ${criteria.topPriority}

### Fit Candidate Cars List (Passed active budget/fuel/body filters):
${formattedCandidates}

### Excluded Comparative Alternatives (Failed active filters, useful for explaining why popular cars were rejected):
${formattedExcluded}

### Task Instructions:
1. Select the top 3 cars from the FIT CANDIDATES list. If fewer than 3 FIT CANDIDATES exist, recommend the ones available. Give each a Match Score out of 100.
2. For each recommendation, provide:
   - "name": Exact brand and name (e.g. "Tata Nexon")
   - "score": Integer score (e.g. 95)
   - "whyFit": 2-3 sentences explaining exactly how it satisfies their Top Priority, family size, and usage.
   - "tradeOffs": An honest statement highlighting 1-2 drawbacks (e.g., firm ride, lack of rear legroom, high highway fuel consumption, charging wait times). Honesty builds confidence!
   - "idealBuyer": 1 sentence summarizing the perfect owner (e.g. "Urban families prioritizing maximum safety and low monthly running costs.")
3. Write 4 concise bullet points of general "selectionReasoning" explaining the overall logic. Begin each with a "✓" symbol.
4. Select 2 cars to place in the "rejectedCars" list with their rejection "reason". 
   - You MUST pick these rejected cars either from remaining FIT CANDIDATES or from the EXCLUDED COMPARATIVE ALTERNATIVES list.
   - The reasons must highlight specific mismatches (e.g., "Exceeds budget, lacks priority safety rating, powered by an excluded fuel type, or tight space for 5+ occupants"). Explain exactly why they were excluded!

### Output JSON Format:
Provide exactly this JSON structure and absolutely nothing else:
{
  "recommendedCars": [
    {
      "name": "Brand Name",
      "score": 95,
      "whyFit": "...",
      "tradeOffs": "...",
      "idealBuyer": "..."
    }
  ],
  "selectionReasoning": [
    "✓ reason 1",
    "✓ reason 2"
  ],
  "rejectedCars": [
    {
      "name": "Brand Name",
      "reason": "..."
    }
  ]
}
`;
  }

  /**
   * Helper to parse and sanitize JSON response
   */
  private parseJSONResponse(rawText: string): AIRecommendationResult {
    let cleanText = rawText.trim();
    // Remove markdown codeblock wrapper if present
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

    return JSON.parse(cleanText) as AIRecommendationResult;
  }

  /**
   * Local Heuristic Mock AI engine
   */
  private generateMockRecommendations(criteria: FilterCriteria, candidates: Car[]): AIRecommendationResult {
    // 1. Score each candidate car programmatically
    const scoredCandidates = candidates.map(car => {
      let score = 70; // baseline

      // Check priority match
      if (criteria.topPriority === 'Safety' && car.safety_rating >= 4.5) {
        score += 15;
      }
      if (criteria.topPriority === 'Mileage' && car.mileage >= 20) {
        score += 15;
      }
      if (criteria.topPriority === 'Performance' && car.transmission.includes('Automatic')) {
        score += 5;
      }
      if (criteria.topPriority === 'Comfort' && (car.body_type === 'Sedan' || car.body_type === 'MPV')) {
        score += 10;
      }
      if (criteria.topPriority === 'Low Maintenance' && car.brand.includes('Maruti Suzuki')) {
        score += 15;
      }
      if (criteria.topPriority === 'Resale Value' && (car.brand.includes('Maruti Suzuki') || car.brand.includes('Toyota') || car.brand.includes('Hyundai'))) {
        score += 10;
      }

      // Fuel type exact match
      if (criteria.fuelPreference !== 'No Preference' && car.fuel_type.toLowerCase() === criteria.fuelPreference.toLowerCase()) {
        score += 10;
      }

      // Body type exact match
      if (criteria.bodyType !== 'No Preference' && car.body_type.toLowerCase() === criteria.bodyType.toLowerCase()) {
        score += 10;
      }

      // Family size considerations
      if (criteria.familySize === '5+' && (car.body_type === 'MPV' || (car.body_type === 'SUV' && car.description.includes('7 seater')))) {
        score += 10;
      } else if (criteria.familySize === '5+' && car.body_type === 'Hatchback') {
        score -= 15; // too small
      }

      // Cap at 98
      score = Math.min(score, 98);

      return { car, score };
    });

    // Sort by score descending
    scoredCandidates.sort((a, b) => b.score - a.score);

    // Pick top 3 for recommended
    const topScored = scoredCandidates.slice(0, 3);
    const recommendedCars: RecommendedCar[] = topScored.map(({ car, score }) => {
      // Custom tradeoffs based on body or fuel
      let tradeOffs = 'Fewer high-speed performance capabilities due to emphasis on commuter mileage.';
      if (car.fuel_type === 'EV') {
        tradeOffs = 'Requires pre-planned stops on long road trips due to electric charging times.';
      } else if (car.body_type === 'SUV') {
        tradeOffs = 'Slightly higher body roll at high speeds compared to a traditional sedan.';
      } else if (car.body_type === 'Hatchback') {
        tradeOffs = 'Limited luggage capacity when fully loaded with five adult passengers.';
      } else if (car.body_type === 'MPV') {
        tradeOffs = 'Large footprint makes tight city parallel parking slightly challenging.';
      }

      let idealBuyer = `A buyer looking for a reliable ${car.body_type} that balances budget with regular usage.`;
      if (criteria.topPriority === 'Safety') {
        idealBuyer = `Safety-conscious family buyers who want premium build quality and high GNCAP crash ratings.`;
      } else if (criteria.topPriority === 'Mileage') {
        idealBuyer = `High-mileage commuters looking to maximize fuel savings and minimize fuel stops.`;
      } else if (car.fuel_type === 'EV') {
        idealBuyer = `Eco-conscious tech-savvy buyers with access to home charging looking to eliminate gas bills.`;
      }

      let whyFit = `${car.brand} ${car.name} is selected because it fits your preferred budget. `;
      if (criteria.topPriority === 'Safety') {
        whyFit += `It offers an exceptional ${car.safety_rating}-star safety rating protecting your passengers.`;
      } else if (criteria.topPriority === 'Mileage') {
        whyFit += `It delivers a stellar mileage of ${car.mileage} ${car.fuel_type === 'EV' ? 'km per charge' : 'kmpl'} to keep running costs extremely low.`;
      } else {
        whyFit += `It offers high driving comfort, standard transmission options, and ${car.description.toLowerCase()}`;
      }

      return {
        name: `${car.brand} ${car.name}`,
        score,
        whyFit,
        tradeOffs,
        idealBuyer
      };
    });

    // Pick candidates ranked 4th or lower for rejection
    const rejectedScored = scoredCandidates.slice(3, 5);
    let rejectedCars: RejectedCar[] = rejectedScored.map(({ car }) => {
      let reason = `Considered but excluded because other candidates are closer matches to your primary priority focus of ${criteria.topPriority}.`;
      if (criteria.topPriority === 'Safety' && car.safety_rating < 4.5) {
        reason = `Rejected because its ${car.safety_rating}-star safety rating is lower than the 5-star standard you prioritized.`;
      } else if (criteria.topPriority === 'Mileage' && car.mileage < 18 && car.fuel_type !== 'EV') {
        reason = `Not shortlisted due to lower fuel efficiency (${car.mileage} kmpl) compared to highly optimized hybrid and CNG candidates.`;
      } else if (criteria.familySize === '5+' && car.body_type === 'Hatchback') {
        reason = `Rejected because its hatchback body structure is too compact to seat a family of 5+ comfortably.`;
      }

      return {
        name: `${car.brand} ${car.name}`,
        reason
      };
    });

    // Safeguard: If we do not have at least 2 rejected cars, pull prominent excluded cars from carsData to show comparative rejections!
    if (rejectedCars.length < 2) {
      const needed = 2 - rejectedCars.length;
      
      const nonCandidates = carsData.filter(car => 
        !candidates.some(c => c.name === car.name && c.brand === car.brand)
      );
      
      const fillSample = nonCandidates.slice(0, needed);
      
      const filledRejections = fillSample.map((car) => {
        let reason = `Considered but excluded because other candidates are closer matches to your primary priority focus of ${criteria.topPriority}.`;
        
        // Custom contrastive explainability logic based on preferences mismatch
        if (criteria.fuelPreference !== 'No Preference' && car.fuel_type.toLowerCase() !== criteria.fuelPreference.toLowerCase()) {
          reason = `Rejected because you preferred a ${criteria.fuelPreference} vehicle, whereas the ${car.brand} ${car.name} is powered by a ${car.fuel_type} engine.`;
        } else if (criteria.bodyType !== 'No Preference' && car.body_type.toLowerCase() !== criteria.bodyType.toLowerCase()) {
          reason = `Not shortlisted because you preferred a ${criteria.bodyType} body style, whereas this is a ${car.body_type} which doesn't fit your cabin space requirements.`;
        } else if (criteria.budget.includes('Under 10') && car.price_min >= 10) {
          reason = `Exceeds your budget range. Priced at ${car.price_min}-${car.price_max} Lakhs, which is higher than your preferred Under 10 Lakhs limit.`;
        } else if (criteria.familySize === '5+' && car.body_type === 'Hatchback') {
          reason = `Rejected because its hatchback body style is too compact to seat a family of 5+ comfortably.`;
        }
        
        return {
          name: `${car.brand} ${car.name}`,
          reason
        };
      });
      
      rejectedCars = [...rejectedCars, ...filledRejections];
    }

    // Generate overall reasoning bullets
    const selectionReasoning = [
      `✓ Selected cars align with your budget of ${criteria.budget}`,
      `✓ Prioritized vehicle features matching your focus on ${criteria.topPriority}`,
      `✓ Evaluated candidates based on ${criteria.primaryUsage} requirements`,
      `✓ Filtered against family size of ${criteria.familySize} to ensure cabin passenger comfort`
    ];

    return {
      recommendedCars,
      selectionReasoning,
      rejectedCars
    };
  }

  /**
   * If there are no candidate cars at all
   */
  private getEmptyFallbackResult(criteria: FilterCriteria): AIRecommendationResult {
    return {
      recommendedCars: [
        {
          name: 'No Matching Cars Found',
          score: 0,
          whyFit: 'We could not find any cars in our system that matched your parameters.',
          tradeOffs: 'Please try widening your budget or fuel preferences.',
          idealBuyer: 'An explorer willing to adjust parameters.'
        }
      ],
      selectionReasoning: ['✓ No cars matched the filter parameters. Please widen search criteria.'],
      rejectedCars: []
    };
  }
}

export const aiRecommendationService = new AIRecommendationService();
