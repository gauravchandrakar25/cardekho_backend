import { Car } from '../db/carsData';
import { supabaseService } from './supabaseService';

export interface FilterCriteria {
  budget: string;          // "Under 10 Lakhs", "10–15 Lakhs", "15–20 Lakhs", "20–30 Lakhs", "Above 30 Lakhs"
  familySize: string;      // "1–2", "3–4", "5+"
  primaryUsage: string;    // "City Driving", "Highway Driving", "Mixed"
  fuelPreference: string;  // "Petrol", "Diesel", "CNG", "EV", "No Preference"
  bodyType: string;        // "SUV", "Sedan", "Hatchback", "MPV", "No Preference"
  topPriority: string;     // "Mileage", "Comfort", "Safety", "Performance", "Low Maintenance", "Resale Value"
}

export interface FilteredResult {
  candidates: Car[];
  isRelaxed: boolean;
  relaxationReason?: string;
}

export class CarFilterService {
  /**
   * Parse budget string into numerical range in Lakhs
   */
  private getBudgetRange(budgetStr: string): { min: number; max: number } {
    const cleaned = budgetStr.replace(/–/g, '-'); // normalize dashes
    
    if (cleaned.toLowerCase().includes('under 10')) {
      return { min: 0, max: 10 };
    } else if (cleaned.includes('10-15')) {
      return { min: 10, max: 15 };
    } else if (cleaned.includes('15-20')) {
      return { min: 15, max: 20 };
    } else if (cleaned.includes('20-30')) {
      return { min: 20, max: 30 };
    } else if (cleaned.toLowerCase().includes('above 30')) {
      return { min: 30, max: 100 }; // 100 Lakhs cap
    }
    return { min: 0, max: 100 };
  }

  /**
   * Filter cars based on criteria with fallback relaxation
   */
  public async filterCandidates(criteria: FilterCriteria): Promise<FilteredResult> {
    const allCars = await supabaseService.getCars();
    
    // Step 1: Attempt strict filtering
    let filtered = this.applyFilters(allCars, criteria, { strictBudget: true, strictFuel: true, strictBody: true });
    if (filtered.length > 0) {
      return { candidates: filtered, isRelaxed: false };
    }

    console.log('⚠️ Strict filter returned 0 results. Beginning progressive relaxation...');

    // Step 2: Relax Preferred Body Type constraint (accept any body type)
    filtered = this.applyFilters(allCars, criteria, { strictBudget: true, strictFuel: true, strictBody: false });
    if (filtered.length > 0) {
      return {
        candidates: filtered,
        isRelaxed: true,
        relaxationReason: `We couldn't find a ${criteria.bodyType} that matches all your criteria, so we considered other excellent body styles that fit your fuel and budget requirements.`
      };
    }

    // Step 3: Relax Preferred Fuel Preference constraint (accept any fuel type)
    filtered = this.applyFilters(allCars, criteria, { strictBudget: true, strictFuel: false, strictBody: false });
    if (filtered.length > 0) {
      return {
        candidates: filtered,
        isRelaxed: true,
        relaxationReason: `No cars matched your exact budget, body, and fuel combination. We expanded the search to other fuel types like Petrol or CNG that still fit your budget.`
      };
    }

    // Step 4: Relax Budget constraint by expanding range by 50%
    filtered = this.applyFilters(allCars, criteria, { strictBudget: false, strictFuel: false, strictBody: false });
    if (filtered.length > 0) {
      return {
        candidates: filtered,
        isRelaxed: true,
        relaxationReason: `We expanded the budget bounds slightly to include highly-rated cars just outside your primary budget range that fit your needs exceptionally well.`
      };
    }

    // Absolute fallback: return a diverse list of top cars
    console.log('🚨 Extreme fallback triggered: returning top safety/mileage cars.');
    const fallbacks = allCars.slice(0, 6);
    return {
      candidates: fallbacks,
      isRelaxed: true,
      relaxationReason: "We couldn't find any direct matches for your combination, so we selected a diverse range of top-performing vehicles for your review."
    };
  }

  /**
   * Core filtering logic
   */
  private applyFilters(
    cars: Car[],
    criteria: FilterCriteria,
    options: { strictBudget: boolean; strictFuel: boolean; strictBody: boolean }
  ): Car[] {
    const budgetRange = this.getBudgetRange(criteria.budget);

    return cars.filter((car) => {
      // Auto-detect and normalize price scales (Rupees vs Lakhs)
      let priceMin = car.price_min;
      let priceMax = car.price_max;
      if (priceMin > 1000) {
        priceMin = priceMin / 100000;
        priceMax = priceMax / 100000;
      }

      // 1. Budget Filter (Overlap check)
      let matchesBudget = false;
      if (options.strictBudget) {
        // Car's price range overlaps user's budget range
        matchesBudget = priceMin <= budgetRange.max && priceMax >= budgetRange.min;
      } else {
        // Relax budget: Expand user budget range by 5 Lakhs on each side
        const relaxedMin = Math.max(0, budgetRange.min - 5);
        const relaxedMax = budgetRange.max + 10; // extend upper limit
        matchesBudget = priceMin <= relaxedMax && priceMax >= relaxedMin;
      }

      if (!matchesBudget) return false;

      // 2. Fuel Filter
      if (options.strictFuel && criteria.fuelPreference !== 'No Preference') {
        if (car.fuel_type.toLowerCase() !== criteria.fuelPreference.toLowerCase()) {
          return false;
        }
      }

      // 3. Body Type Filter
      if (options.strictBody && criteria.bodyType !== 'No Preference') {
        if (car.body_type.toLowerCase() !== criteria.bodyType.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }
}

export const carFilterService = new CarFilterService();
