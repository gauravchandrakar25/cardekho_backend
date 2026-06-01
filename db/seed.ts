import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { carsData } from './carsData';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

async function seed() {
  console.log('🚀 Starting database seeding...');

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_ANON_KEY/SUPABASE_SERVICE_ROLE_KEY in .env file.');
    console.log('ℹ️ Running in Local Fallback mode instead. Seed data will be used in-memory.');
    process.exit(0);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('🧹 Clearing existing cars table...');
  const { error: deleteError } = await supabase.from('cars').delete().neq('id', 0);

  if (deleteError) {
    console.error('❌ Error clearing cars table:', deleteError.message);
    process.exit(1);
  }

  console.log(`📦 Seeding ${carsData.length} cars into Supabase...`);
  
  // Remove id from seed records so DB generates the primary keys
  const carsToInsert = carsData.map(({ id, ...car }) => car);

  const { data, error: insertError } = await supabase
    .from('cars')
    .insert(carsToInsert)
    .select();

  if (insertError) {
    console.error('❌ Error seeding cars table:', insertError.message);
    process.exit(1);
  }

  console.log('✅ Database seeded successfully!');
  console.log(`Inserted ${data?.length} records.`);
}

seed().catch((err) => {
  console.error('💥 Seeding crashed with exception:', err);
  process.exit(1);
});
