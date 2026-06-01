# AI Shortlist Builder

## What did you build and why? What did you deliberately cut?

AI Shortlist Builder helps users go from:

> "I don't know what car to buy"

to

> "These are the 3 cars I should seriously consider."

Users answer a few questions about their budget, usage, family size, fuel preference, and priorities. The system then generates a personalized shortlist with explanations, tradeoffs, and reasons why certain cars were selected over others.

---

## Tech Stack

### Frontend

* Next.js 15
* TypeScript
* Tailwind CSS
* ShadCN UI

### Backend

* Node.js
* Express

### Database

* Supabase (PostgreSQL)

### AI

* Gemini API

---

## What I Deliberately Cut

To keep the scope focused, I intentionally did not build:

* Authentication
* User accounts
* Saved searches
* Chat interface
* Vehicle comparison pages
* Dealer integrations

The goal was to build the shortest path from user preferences to a confident shortlist.

---

## AI Usage

I used AI tools to speed up:

* UI scaffolding
* Boilerplate code
* Type definitions
* Prompt iteration
* Documentation

The product design, recommendation flow, data model, and AI orchestration logic were designed manually.

---

## Where AI Helped Most

AI was especially useful for generating repetitive code and accelerating UI development, allowing me to focus more on product decisions and recommendation quality.

---

## Where AI Got In The Way

AI often suggested more complexity than needed (agents, RAG, vector databases, etc.). For this assignment, keeping the solution simple was usually the better choice.

---

## If I Had 4 More Hours

I would add:

* Follow-up questions to refine recommendations
* Side by side car comparison
* Better explainability and scoring
* Real user review summaries
* Save and revisit previous searches

---

## Running Locally

### Frontend

```bash
npm install
npm run dev
```

### Backend

```bash
npm install
npm run dev
```

Configure the following environment variables:

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
GEMINI_API_KEY=
```

---

## Key Takeaway

This project is not a car search engine.

It's a decision-support tool designed to help users confidently narrow down thousands of options into a shortlist they can actually act on.
