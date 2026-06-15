import { Request, Response } from 'express';
import { carFilterService, FilterCriteria } from '../services/carFilterService';
import { aiRecommendationService } from '../services/aiRecommendationService';
import { supabaseService } from '../services/supabaseService';
import { recommendSchema } from '../validators/recommendValidator';
import { financialService } from '../services/financialService';
import { negotiationService } from '../services/negotiationService';

export class CarController {
  /**
   * Main recommendation endpoint: POST /api/recommend
   */
  public async recommendCars(req: Request, res: Response): Promise<void> {
    try {
      // Validate incoming request body via Joi schema
      const { error, value } = recommendSchema.validate(req.body, { abortEarly: false });

      if (error) {
        res.status(400).json({
          success: false,
          error: 'Survey preferences validation failed.',
          details: error.details.map(d => d.message)
        });
        return;
      }

      const {
        budget,
        familySize,
        primaryUsage,
        fuelPreference,
        bodyType,
        topPriority
      } = value;

      const criteria: FilterCriteria = {
        budget,
        familySize,
        primaryUsage,
        fuelPreference,
        bodyType,
        topPriority
      };

      console.log('📝 Received Questionnaire:', criteria);

      // 1. Filter candidates
      const filterResult = await carFilterService.filterCandidates(criteria);
      
      console.log(`🔍 Filter complete. Found ${filterResult.candidates.length} candidates. (Relaxed: ${filterResult.isRelaxed})`);

      // 2. Generate LLM recommendations (or mock)
      const recommendations = await aiRecommendationService.getRecommendations(criteria, filterResult.candidates);

      // 3. Save Search log asynchronously
      // Ignore failure to ensure request completes
      supabaseService.saveSearch(criteria, recommendations).catch(err => {
        console.error('⚠️ Failed to save search history log:', err);
      });

      // 4. Return results along with system debug headers
      res.json({
        success: true,
        data: {
          recommendedCars: recommendations.recommendedCars,
          selectionReasoning: recommendations.selectionReasoning,
          rejectedCars: recommendations.rejectedCars
        },
        metadata: {
          candidatesCount: filterResult.candidates.length,
          filtersRelaxed: filterResult.isRelaxed,
          relaxationReason: filterResult.relaxationReason || null,
          databaseMode: supabaseService.isOfflineMode() ? 'Offline Demo (In-Memory)' : 'Supabase Cloud Connected',
          aiMode: process.env.GEMINI_API_KEY 
            ? 'Google Gemini Flash' 
            : (process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY) 
              ? 'Anthropic Claude Sonnet' 
              : 'Local Heuristic AI Engine'
        }
      });
    } catch (err: any) {
      console.error('💥 Recommendation Endpoint Crashed:', err);
      res.status(500).json({
        success: false,
        error: 'An internal error occurred while processing recommendations.',
        details: err.message
      });
    }
  }

  /**
   * Helper endpoint: GET /api/cars (To verify seed database contents)
   */
  public async getAllCars(req: Request, res: Response): Promise<void> {
    try {
      const cars = await supabaseService.getCars();
      res.json({
        success: true,
        count: cars.length,
        data: cars
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve cars list.',
        details: err.message
      });
    }
  }

  /**
   * Status check endpoint: GET /api/health
   */
  public async getHealth(req: Request, res: Response): Promise<void> {
    res.json({
      success: true,
      status: 'OK',
      timestamp: new Date().toISOString(),
      system: {
        databaseMode: supabaseService.isOfflineMode() ? 'Offline (In-Memory Fallback)' : 'Cloud (Supabase Postgres Connected)',
        aiIntegration: {
          claudeAvailable: !!(process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY),
          geminiAvailable: !!process.env.GEMINI_API_KEY
        }
      }
    });
  }

  /**
   * Get car loan interest rates: GET /api/bank-rates
   */
  public async getBankRates(req: Request, res: Response): Promise<void> {
    try {
      const rates = financialService.getBankRates();
      res.json({
        success: true,
        rates
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve bank rates.',
        details: err.message
      });
    }
  }

  /**
   * Get customized negotiation kit: GET /api/negotiation-kit
   */
  public async getNegotiationKit(req: Request, res: Response): Promise<void> {
    try {
      const carName = req.query.carName as string;
      const variant = (req.query.variant as string) || 'Base';

      if (!carName) {
        res.status(400).json({
          success: false,
          error: 'Missing query parameter: carName'
        });
        return;
      }

      const kit = await negotiationService.generateKit(carName, variant);
      res.json({
        success: true,
        data: kit
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: 'Failed to generate negotiation kit.',
        details: err.message
      });
    }
  }
}

export const carController = new CarController();
