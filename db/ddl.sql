-- DDL: Database Schema Definition for VALT AI Shortlist Builder

-- Drop tables if they exist (for clean migrations)
DROP TABLE IF EXISTS searches;
DROP TABLE IF EXISTS cars;

-- Create Cars Table
CREATE TABLE cars (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    body_type VARCHAR(50) NOT NULL,      -- SUV, Sedan, Hatchback, MPV
    fuel_type VARCHAR(50) NOT NULL,      -- Petrol, Diesel, CNG, EV
    price_min NUMERIC(10, 2) NOT NULL,    -- In Lakhs (e.g., 6.5)
    price_max NUMERIC(10, 2) NOT NULL,    -- In Lakhs (e.g., 9.5)
    mileage NUMERIC(10, 2) NOT NULL,      -- In kmpl or km/charge (e.g., 22.0)
    safety_rating NUMERIC(3, 1) NOT NULL, -- Star rating (e.g., 4.0, 5.0)
    transmission VARCHAR(50) NOT NULL,    -- Manual, Automatic, or Automatic/Manual
    description TEXT                      -- Brief summary of the car
);

-- Create Searches Table for History Logging (Optional table but required by assignment)
CREATE TABLE searches (
    id BIGSERIAL PRIMARY KEY,
    user_preferences JSONB NOT NULL,     -- Budget, Family Size, Usage, Fuel, Body, Priority
    ai_response JSONB NOT NULL,          -- Recommended, Reasoning, Rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Disable Row Level Security (RLS) on both tables to allow public/anonymous backend queries and logs
ALTER TABLE cars DISABLE ROW LEVEL SECURITY;
ALTER TABLE searches DISABLE ROW LEVEL SECURITY;
