import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { carsData, Car } from '../db/carsData';
import * as dotenv from 'dotenv';

dotenv.config();

class SupabaseService {
  private client: SupabaseClient | null = null;
  private isFallback = true;

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    // Prefer service role key in trusted backend to bypass Row-Level Security (RLS) restrictions
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        this.client = createClient(supabaseUrl, supabaseKey);
        this.isFallback = false;
        console.log('🔌 Connected to Supabase Cloud Instance successfully.');
      } catch (err) {
        console.error('⚠️ Supabase connection failed. Falling back to local/in-memory mode:', err);
        this.isFallback = true;
      }
    } else {
      console.log('ℹ️ Supabase environment variables missing. Running in Offline Demo Mode.');
      this.isFallback = true;
    }
  }

  /**
   * Check if the database service is running in offline demo mode.
   */
  public isOfflineMode(): boolean {
    return this.isFallback;
  }

  /**
   * Get all cars from Supabase or local seed data fallback
   */
  public async getCars(): Promise<Car[]> {
    if (this.isFallback || !this.client) {
      console.log('💾 [Offline DB] Fetching cars from in-memory seed dataset.');
      return carsData;
    }

    try {
      const { data, error } = await this.client
        .from('cars')
        .select('*');

      if (error) {
        console.error('❌ Supabase fetch error, falling back to local dataset:', error.message);
        return carsData;
      }

      // Safeguard: If table is connected but has 0 rows, fallback to local seed data
      if (!data || data.length === 0) {
        console.log('⚠️ Supabase "cars" table is empty (0 rows). Automatically serving in-memory seed dataset to ensure functionality!');
        return carsData;
      }

      return data as Car[];
    } catch (err) {
      console.error('💥 Database query failed, falling back to local dataset:', err);
      return carsData;
    }
  }

  /**
   * Save a search record to database (or logs it in offline fallback)
   */
  public async saveSearch(userPreferences: any, aiResponse: any): Promise<boolean> {
    if (this.isFallback || !this.client) {
      console.log('💾 [Offline DB] Search history saved to local logs:');
      console.log('   Preferences:', JSON.stringify(userPreferences));
      console.log('   Response Summary: Recs count =', aiResponse.recommendedCars?.length);
      return true;
    }

    try {
      const { error } = await this.client
        .from('searches')
        .insert({
          user_preferences: userPreferences,
          ai_response: aiResponse
        });

      if (error) {
        console.error('❌ Supabase saveSearch error:', error.message);
        return false;
      }

      console.log('💾 Search record logged to Supabase.');
      return true;
    } catch (err) {
      console.error('💥 Database query failed on saveSearch:', err);
      return false;
    }
  }
}

export const supabaseService = new SupabaseService();
