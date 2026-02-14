# Ricochet Tournament Organization App

A comprehensive web-based tournament management system specifically designed for organizing Ricochet tournaments (a competitive sport similar to racquetball). This application provides both public viewing and administrative tournament management capabilities.

## 🎯 Overview

The **Ricochet Polish Open 2026** app enables tournament organizers to manage complex tournament brackets, track matches in real-time, and provide spectators with live updates. It features a dual-mode architecture that works with or without a cloud database, making it highly flexible for different deployment scenarios.

## ✨ Core Features

### For Tournament Organizers (Admin)
- ✅ Create and manage multiple tournaments
- ✅ Register and manage players with country flags and ELO ratings
- ✅ Organize matches into Winners and Losers brackets (Brazilian double elimination system)
- ✅ Enter match scores and track micro-points
- ✅ Assign matches to courts
- ✅ Manage tournament status (setup → live → finished)

### For Spectators/Players (Public)
- 👀 Live tournament view with real-time updates
- 📊 View match schedules and results
- 🏆 Check tournament standings and rankings
- 📱 Access bracket visualizations
- 👥 View player profiles and statistics
- 📲 Generate QR codes for match sharing

## 🛠️ Technology Stack

### Frontend Framework
- **React 19.2** with **Vite** for fast development
- **React Router v7** for page navigation
- **Context API** for state management

### Data Storage (Dual-Mode)
- **Supabase** (PostgreSQL cloud database) - optional for real-time sync
- **LocalStorage** - fallback when Supabase is not configured
- Hybrid approach allows offline operation

### UI Components & Libraries
- **Lucide React** - Modern icon library
- **@dnd-kit** - Drag-and-drop functionality
- **react-zoom-pan-pinch** - Interactive bracket zooming
- **QRCode.react** - QR code generation
- Custom CSS with dark mode support

### Internationalization
- **i18next** - Supports 5 languages:
  - 🇵🇱 Polish
  - 🇬🇧 English  
  - 🇩🇪 German
  - 🇳🇱 Dutch
  - 🇨🇿 Czech
- Auto-detection of browser language

## 📁 Project Structure

```
src/
├── pages/              # Main application screens
│   ├── Live.jsx        # Real-time tournament display (public)
│   ├── Matches.jsx     # Match list & scoring interface
│   ├── Brackets.jsx    # Visual bracket diagram
│   ├── Standings.jsx   # Rankings & statistics
│   ├── Players.jsx     # Player roster with profiles
│   ├── Organizer.jsx   # Tournament management (admin only)
│   ├── Login.jsx       # Simple authentication
│   ├── TournamentSelect.jsx  # Choose active tournament
│   └── AllPages.jsx    # Settings page
│
├── contexts/           # Global state management
│   ├── TournamentContext.jsx   # Tournament CRUD operations
│   └── MatchesContext.jsx      # Match data & persistence
│
├── components/         # Reusable UI components
│   ├── Layout.jsx      # Navigation bar & theme toggle
│   ├── BracketCanvas.jsx       # Bracket rendering engine
│   ├── PlayerProfileModal.jsx  # Player details popup
│   └── [other components]
│
├── hooks/              # Custom React hooks
│   ├── useAuth.tsx     # Authentication logic
│   ├── useTournament.js # Tournament operations
│   ├── useMatches.js   # Match operations
│   └── usePlayers.js   # Player data access
│
├── utils/              # Business logic
│   ├── bracketLogic.js # Tournament bracket calculations
│   ├── matchUtils.js   # Score validation & updates
│   └── [other utilities]
│
├── i18n/               # Translation files (5 languages)
│   ├── en.json
│   ├── pl.json
│   ├── de.json
│   ├── nl.json
│   └── cs.json
│
└── lib/
    └── supabase.js     # Database connection config
```

## 🎮 Key Concepts

### 1. Tournament Bracket System
The app implements a **Brazilian double elimination** format:
- **Winners Bracket (WB)**: 5 rounds - players who haven't lost
- **Losers Bracket (LB)**: 6 rounds - players who lost once get a second chance
- **Grand Finals**: Winner of WB faces winner of LB
- Specific drop patterns when players lose (defined in `bracketLogic.js`)

### 2. Dual Storage Architecture
```javascript
// Check if Supabase is configured
if (isSupabaseConfigured) {
  // Use cloud database with real-time sync
  await supabase.from('matches').insert(data);
} else {
  // Use localStorage as fallback
  localStorage.setItem('matches', JSON.stringify(data));
}
```

### 3. Match Structure
Each match has:
- **ID**: e.g., "wb-r1-m1" (Winners Bracket, Round 1, Match 1)
- **Players**: Two player IDs
- **Scores**: Points for each player
- **Micro-points**: Array of point-by-point results `[1, 2, 1, 1, 2]`
- **Status**: pending/in_progress/completed
- **Court**: Physical court assignment

### 4. Authentication
Simple client-side authentication:
- Admin flag stored in localStorage (`rpo_admin`)
- Protected routes require login
- Public routes accessible to everyone

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher recommended)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/jirikrucek/ricochet-tournament-organization-app.git
cd ricochet-tournament-organization-app
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Configure Supabase:
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials
   - The app works without Supabase using localStorage

4. Start the development server:
```bash
npm run dev
```

5. Open your browser to `http://localhost:5173`

### Development Commands

```bash
npm run dev      # Start development server (Vite)
npm run build    # Build for production
npm run lint     # Check code quality with ESLint
npm run preview  # Preview production build
```

## 💾 Database Schema

### tournaments
- `id` (UUID) - Primary key
- `name` (text) - Tournament name
- `date` (text) - Tournament date
- `status` (text) - Current status
- `created_at` (timestamp)

### players
- `id` (UUID) - Primary key
- `tournament_id` (UUID) - Foreign key to tournaments
- `full_name` (text) - Player's full name
- `country` (text) - Country code
- `elo` (integer) - ELO rating
- `created_at` (timestamp)

### matches
- `tournament_id` (UUID) - Foreign key to tournaments
- `id` (text) - Match identifier (e.g., "wb-r1-m1")
- `bracket_type` (text) - "wb" or "lb"
- `round_id` (text) - Round identifier
- `player1_id` (UUID) - Foreign key to players
- `player2_id` (UUID) - Foreign key to players
- `score1` (integer) - Player 1 score
- `score2` (integer) - Player 2 score
- `micro_points` (jsonb) - Array of point-by-point results
- `winner_id` (UUID) - Foreign key to players
- `status` (text) - Match status
- `court` (text) - Court assignment
- `created_at` (timestamp)

## 🔄 Data Flow

```
1. User opens app
   ↓
2. TournamentContext loads available tournaments
   ↓
3. User selects active tournament
   ↓
4. MatchesContext fetches matches for that tournament
   ↓
5. User navigates to different pages (Live, Brackets, Standings)
   ↓
6. Admin enters scores → optimistic UI update
   ↓
7. Changes saved to Supabase/localStorage
   ↓
8. Real-time subscriptions notify other users (if using Supabase)
```

## 🔑 Key Files to Understand

1. **`src/App.jsx`** - Main app component with routing
2. **`src/contexts/TournamentContext.jsx`** - Tournament management logic
3. **`src/contexts/MatchesContext.jsx`** - Match state handling
4. **`src/utils/bracketLogic.js`** - Bracket calculation algorithms
5. **`src/pages/Live.jsx`** - Main public-facing interface
6. **`src/pages/Organizer.jsx`** - Admin tournament setup

## 🌟 What Makes This App Special

- ✨ **Flexible Deployment** - Works with or without a database
- ✨ **Real-time Updates** - Live tournament progress via Supabase subscriptions
- ✨ **International** - 5 language support out of the box
- ✨ **Mobile-Friendly** - Responsive design for phones/tablets
- ✨ **Offline Capable** - LocalStorage fallback ensures it always works
- ✨ **Sport-Specific** - Custom bracket logic for Brazilian double elimination

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is private and proprietary.

## 🏆 About Ricochet

Ricochet is a competitive sport similar to racquetball, played in tournaments with specific bracket formats. This application is designed to handle the unique requirements of Ricochet tournament organization, including the Brazilian double elimination format with specialized bracket drop patterns.

---

**Built with ❤️ for the Ricochet community**
