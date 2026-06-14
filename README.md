# FreshCart — 10-min Grocery Delivery (Amazon Hackathon 2026)

A smart grocery delivery app with AI-powered features, social commerce, and accessibility.

## Quick Start

```bash
# Install frontend dependencies
npm install

# Run the frontend
npm run dev

# In a separate terminal — run the backend
cd server
npm install
npm start
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Features

### Core Shopping
- 35 grocery products (Indian brands, ₹ pricing)
- Category filters, live search with instant results
- Add to cart with +/- quantity controls
- Today's Deals with % discount badges and quick-add buttons
- Product detail page with full info
- 1-page checkout that records orders
- Order history per user
- Location detection (shows real city in navbar)

### Smart Cart (⚡)
- Type an occasion: "movie night", "breakfast", "dinner", "party", etc.
- Snack mode: Choose Healthy / Junk / Mix
- Set number of people, budget, urgency
- Auto-generates a cart with items and quantities

### Elder Mode (`/elder`) — WhatsApp-style Voice Ordering
- Simple screen with 🎤 Voice and 📷 Photo buttons
- Real speech-to-text (Hindi/English) via Web Speech API
- AI understanding via Groq LLaMA 3.1 (translates Hindi → extracts intent → matches product)
- Processing pipeline animation (transcribe → understand → match → done)
- Auto-adds matched item to delegate's cart
- Cart items show "📌 Mom asked for this" with ✓ Confirm / ✗ Remove buttons
- Notification banner on main app when elder adds an item
- Cart syncs across browser tabs via localStorage

### Social Commerce — Friends System
- Login with phone number
- Add friends by phone number
- When a friend orders a product 3+ times → you see ❤️ on that product
- "Popular with Friends" section on homepage
- Leave comments on products visible to friends
- Order history per user

### Allergy & Dietary Preferences
- Set allergies: gluten, lactose, nuts, egg, soy, shellfish, peanuts (+ custom)
- Set dietary prefs: vegetarian, vegan, jain
- ⚠️ Warning popup when adding a product that conflicts with your preferences
- "Add Anyway" or "Don't Add" options

### Cross-Platform Intelligence (Amazon Now ↔ All Categories)
- Dropdown in search bar: "Amazon Now" vs "All Categories"
- All Categories page with electronics, laptops, appliances
- After buying a laptop → come back to Amazon Now → AI suggests compatible cables, stands, mouse
- Proactive banner on homepage: "Recently bought HP Laptop — here are quick-delivery accessories"
- Powered by Groq AI — dynamic suggestions, no hardcoded mappings

### Split Cart (👥)
- Toggle "Split Cart" on the cart page
- Add roommates/family members by name
- Assign each item to a person or mark as "Shared"
- Live per-person cost breakdown
- At checkout: shows who owes how much

### Discount Progress Bar
- Visual progress bar in cart showing milestones:
  - ₹199 → Free delivery unlocked
  - ₹499 → 10% bulk discount unlocked
- Encourages households to consolidate into one order
- Actual discounts applied to total

### Frequently Bought Together (💡)
- When you add butter → suggests bread
- Toast notification with "Add" buttons

## Environment Variables

Create `server/.env`:
```
GROQ_API_KEY=your_groq_api_key_here
```

Get a Groq key from: https://console.groq.com

## Tech Stack
- **Frontend**: React 18, Vite 5, Tailwind CSS, React Router
- **Backend**: Express.js, Groq AI (LLaMA 3.1)
- **Database**: JSON file (server/db.json)
- **State**: React Context + localStorage (cross-tab sync)
- **Speech**: Web Speech API (browser native)
- **Location**: Geolocation API + OpenStreetMap Nominatim

## Demo Routes
- `/` — Homepage with products, deals, friend favorites, cross-platform suggestions
- `/product/:id` — Product detail with friend comments
- `/cart` — Shopping cart with split cart, discount progress bar, elder confirmations
- `/checkout` — 1-page checkout with split summary
- `/orders` — Order history
- `/friends` — Add/manage friends
- `/preferences` — Allergy & dietary settings
- `/all-categories` — Electronics/appliances (cross-platform demo)
- `/elder` — Elder mode (WhatsApp-style voice ordering)
