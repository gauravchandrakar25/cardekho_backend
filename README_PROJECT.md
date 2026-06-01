# CarDekho AI Shortlist Builder - Backend API Server

This repository contains the backend Node.js, Express, and TypeScript API server for the **AI Shortlist Builder** web application.

---

## 🚗 Core Design & Highlights

1. **Dual-Mode System Architecture**:
   - **Cloud Mode**: Connects to your remote **Supabase Postgres** instance and triggers **Google Gemini Flash** (or fallback **Anthropic Claude 3.5 Sonnet**) for real-time recommendations.
   - **Offline Demo Mode**: If no `.env` credentials are provided (or if connections time out), the server automatically activates a local, in-memory representation of our **17 seeded Indian cars** and runs a **Rule-Based Mock AI engine**.
   - This ensures **zero-configuration runnability** for graders, with fully personalized matching, selection criteria bullets, tradeoffs, and rejected cars.

2. **Indian Market Seed Data**:
   - Includes data for 17 popular Indian vehicles (Maruti Suzuki Swift, Tata Nexon EV, Toyota Innova Hycross, BMW 3 Series, etc.) with accurate Lakh-denominated pricing, mileage, safety stars, body types, and fuel options.

3. **Smart Candidate Relaxation**:
   - If a user inputs extremely restrictive criteria (e.g., EVs under 10 Lakhs) that produce zero database matches, the server progressively relaxes filters (first body type, then fuel type, then budget limits) so the LLM always receives relevant, nearby alternatives to explain and justify.

---

## 📂 Directory Layout

```text
cardekho_backend/
├── db/
│   ├── carsData.ts         # Shared single-source-of-truth static car seed records
│   ├── ddl.sql             # SQL migrations for Cars & Searches tables
│   ├── dml.sql             # SQL raw INSERT statements for seeding
│   └── seed.ts             # Programmatic TypeScript Supabase seeder utility
├── controllers/
│   └── carController.ts    # Route handler orchestrator & validation
├── services/
│   ├── supabaseService.ts  # Database connection manager with in-memory fallback
│   ├── carFilterService.ts # Progressive candidate filtering and relaxation
│   └── aiRecommendationService.ts # Gemini/Claude integration and Mock AI fallback
├── routes/
│   └── routes.ts           # REST endpoint mapping
├── validators/
│   └── recommendValidator.ts # Joi request body schema validator
├── app.ts                  # Server configuration and boot configuration
├── package.json
└── tsconfig.json
```

---

## 🛠️ Environment Configurations

Create a `.env` file in the root of this folder. You can copy the contents of `.env.example`:

```bash
# Server Port (Defaults to 5001)
PORT=5001

# Supabase Postgres Keys (Optional: leaves system in in-memory fallback if empty)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-only-required-for-seed-script

# AI LLM Provider Keys
# (Optional: If both missing, backend operates in high-fidelity heuristic offline AI mode!)
GEMINI_API_KEY=your-google-gemini-api-key

# Fallback AI LLM Provider (Optional)
ANTHROPIC_API_KEY=your-anthropic-claude-api-key
# OR
CLAUDE_API_KEY=your-anthropic-claude-api-key
```

---

## 🚀 Running the Server

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Seeding (Optional - requires Supabase credentials in .env)
```bash
npm run seed
```

### 3. Run Development Server
```bash
npm run dev
```
The server will boot and listen on **`http://localhost:5001`**.

---

## 📡 REST Endpoints

### 1. `GET /api/health`
Checks server status, database connection state, and active AI providers.
* **URL**: `http://localhost:5001/api/health`

### 2. `GET /api/cars`
Lists all cars loaded into the active database (cloud or in-memory fallback).
* **URL**: `http://localhost:5001/api/cars`

### 3. `POST /api/recommend`
Submits a questionnaire and retrieves personalized top 3 recommendations, selection reasoning, and rejected alternatives.
* **URL**: `http://localhost:5001/api/recommend`
* **Payload Format**:
```json
{
  "budget": "10-15 Lakhs",
  "familySize": "3-4",
  "primaryUsage": "City Driving",
  "fuelPreference": "Petrol",
  "bodyType": "SUV",
  "topPriority": "Safety"
}
```
* **Response Format**:
```json
{
  "success": true,
  "data": {
    "recommendedCars": [
      {
        "name": "Tata Nexon",
        "score": 95,
        "whyFit": "Fits your requirement for a Safe SUV under 15 Lakhs. It offers GNCAP 5-star safety.",
        "tradeOffs": "Firm low-speed ride quality.",
        "idealBuyer": "Safety-conscious small families commuting in the city."
      }
    ],
    "selectionReasoning": [
      "✓ Fits budget",
      "✓ 5-star GNCAP safety"
    ],
    "rejectedCars": [
      {
        "name": "Hyundai Creta",
        "reason": "Exceeds the 15 Lakh budget limit in its top-safety trims."
      }
    ]
  },
  "metadata": {
    "candidatesCount": 4,
    "filtersRelaxed": false,
    "databaseMode": "Offline Demo (In-Memory)",
    "aiMode": "Local Heuristic AI Engine"
  }
}
```