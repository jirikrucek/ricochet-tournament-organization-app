# Ricochet Polish Open 2026 - Codebase Overview

## 📋 Project Summary

**Ricochet Polish Open 2026** is a comprehensive tournament management web application designed specifically for managing Ricochet (table tennis variant) tournaments. The application provides real-time match tracking, bracket management, player standings, and a professional live display system suitable for streaming or TV presentation.

## 🏗️ Architecture & Technology Stack

### Frontend Framework
- **React 19.2.0** - Modern component-based UI library
- **Vite 7.2.4** - Fast build tool and development server
- **React Router 7.12.0** - Client-side routing and navigation

### Key Dependencies
- **Supabase (@supabase/supabase-js)** - Backend-as-a-Service for database and authentication
- **i18next & react-i18next** - Internationalization supporting multiple languages (Polish, English, German, Dutch, Czech)
- **@dnd-kit** - Drag-and-drop functionality for player management
- **Lucide React** - Icon library for UI components
- **QRCode.react** - QR code generation for mobile access
- **react-zoom-pan-pinch** - Interactive bracket visualization controls

### Backend & Data Storage
The application supports **dual-mode operation**:
1. **Supabase Mode** - Cloud-based PostgreSQL database with real-time subscriptions
2. **Local Storage Mode** - Fallback for offline/demo usage

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── BracketCanvas.jsx       # Interactive bracket visualization
│   ├── Layout.jsx              # Main layout wrapper with navigation
│   ├── LanguageSelector.jsx   # Multi-language switcher
│   ├── PlayerProfileModal.jsx # Player details popup
│   └── ErrorBoundary.jsx       # Error handling wrapper
│
├── pages/               # Main application views
│   ├── Live.jsx                # Real-time match display (TV mode)
│   ├── Organizer.jsx           # Tournament creation/management
│   ├── Matches.jsx             # Match schedule and results
│   ├── Brackets.jsx            # Tournament bracket visualization
│   ├── Standings.jsx           # Player rankings and statistics
│   ├── Players.jsx             # Player roster management
│   ├── Login.jsx               # Admin authentication
│   └── TournamentSelect.jsx   # Tournament switcher
│
├── contexts/            # React Context providers
│   ├── TournamentContext.jsx  # Tournament state management
│   └── MatchesContext.jsx     # Match data and updates
│
├── hooks/               # Custom React hooks
│   ├── useAuth.tsx             # Authentication state
│   ├── useTournamentMatches.js # Match data fetching
│   └── usePlayers.js           # Player data management
│
├── utils/               # Business logic utilities
│   ├── bracketLogic.js         # Tournament bracket generation
│   ├── matchUtils.js           # Match scoring and status
│   └── racketPathUtils.js      # Bracket path calculations
│
├── i18n/                # Internationalization
│   ├── config.js               # i18next configuration
│   └── [pl/en/de/nl/cs].json  # Language translations
│
├── constants/           # Static configuration
└── lib/                 # External service clients
    └── supabase.js             # Supabase client setup
```

## 🎯 Core Features

### 1. **Tournament Management** (`Organizer.jsx`)
- Create, edit, and delete tournaments
- Set tournament name, date, and location
- Switch between multiple active tournaments
- Tournament status tracking (setup, live, finished)

### 2. **Player Management** (`Players.jsx`)
- Add players with names, countries, and ELO ratings
- Import/export player lists
- Drag-and-drop reordering for seeding
- Country flag display with internationalization
- Player profile modals with statistics

### 3. **Bracket System** (`Brackets.jsx`, `bracketLogic.js`)
The application implements a sophisticated **Double Elimination (Brazilian) bracket** system:

- **Winners Bracket (WB)**: 5 rounds (32→16→8→4→2→1)
- **Losers Bracket (LB)**: 6 rounds with complex drop patterns
- **Grand Final**: Winner of WB vs Winner of LB
- **Consolation Final**: 3rd place match
- **Automatic bracket generation** from seeded player list
- **Cascade updates**: When a match is completed, next matches auto-populate
- **Loser drops**: Strict Brazilian mapping for players dropping from WB to LB

#### Seeding Logic
Uses standard 32-player snake seeding:
```javascript
[1,32], [16,17], [9,24], [8,25], [5,28], [12,21], [13,20], [4,29],
[3,30], [14,19], [11,22], [6,27], [7,26], [10,23], [15,18], [2,31]
```

### 4. **Match Management** (`Matches.jsx`)
- Schedule matches across multiple courts
- Enter scores and micro-points (point-by-point tracking)
- Best-of format configuration (BO3, BO5, BO7)
- Match status tracking (scheduled, in-progress, completed)
- Admin vs. Public view permissions

### 5. **Live Display** (`Live.jsx`)
A professional TV-ready interface featuring:
- **TV Mode** (`?mode=tv`): Fullscreen display optimized for streaming
- Real-time match status updates
- Current scores and micro-point progression
- Court assignments
- QR code for mobile access
- Auto-refresh capabilities
- Fullscreen API support (F11 or JS API)

### 6. **Standings** (`Standings.jsx`)
- Real-time player rankings
- Win/loss records
- Point differentials
- Sortable columns
- Statistics aggregation

### 7. **Multi-Language Support**
Built-in translations for:
- 🇵🇱 Polish (default)
- 🇬🇧 English
- 🇩🇪 German
- 🇳🇱 Dutch
- 🇨🇿 Czech

Language auto-detection with manual override via `LanguageSelector` component.

## 🗄️ Database Schema

The application uses a PostgreSQL database (via Supabase) with three main tables:

### `tournaments`
```sql
- id: uuid (primary key)
- name: text
- date: timestamptz
- status: text ('setup' | 'live' | 'finished')
- address: text
- created_at: timestamptz
```

### `players`
```sql
- id: uuid (primary key)
- tournament_id: uuid (foreign key)
- full_name: text
- country: text
- elo: int
- created_at: timestamptz
```

### `matches`
```sql
- tournament_id: uuid (composite primary key)
- id: text (composite primary key, e.g., 'wb-r1-m1')
- bracket_type: text ('wb' | 'lb' | 'consolation' | 'grand-final')
- round_id: int
- player1_id: uuid
- player2_id: uuid
- score1: int
- score2: int
- micro_points: jsonb (point-by-point history)
- winner_id: uuid
- status: text
- court: text
- created_at: timestamptz
```

### Row Level Security (RLS)
- Public read access enabled for all tables
- Admin authentication required for write operations

## 🔐 Authentication & Authorization

The application uses a **simplified admin authentication** system:

- **Login page** (`Login.jsx`): Password-based admin access
- **Local storage flag**: `rpo_admin` boolean
- **Protected routes**: Organizer and Settings pages require admin privileges
- **Public views**: Live, Matches, Brackets, Standings, and Players are read-only for guests

### Protected Routes
```javascript
- /organizer  // Tournament CRUD operations
- /settings   // System configuration
```

### Public Routes
```javascript
- /live       // Live display (read-only for guests, editable for admins)
- /matches    // Match list and details
- /brackets   // Bracket visualization
- /standings  // Player rankings
- /players    // Player roster
```

## 🚀 Development Workflow

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Environment Configuration

Create a `.env` file based on `.env.example`:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Note**: If Supabase credentials are not configured, the app automatically falls back to **Local Storage mode**.

## 🎨 Key Design Patterns

### 1. **Context Providers**
- `TournamentContext`: Global tournament state and CRUD operations
- `MatchesContext`: Match data with real-time updates
- `AuthProvider`: Authentication state management

### 2. **Custom Hooks**
- `useTournamentMatches()`: Fetches and manages match data for active tournament
- `usePlayers()`: Player CRUD operations with optimistic updates
- `useAuth()`: Authentication state and helpers

### 3. **Dual-Mode Data Storage**
The app intelligently switches between Supabase and Local Storage:

```javascript
if (isSupabaseConfigured) {
  // Use Supabase for persistence
  await supabase.from('matches').insert(data);
} else {
  // Fallback to localStorage
  localStorage.setItem('matches', JSON.stringify(data));
}
```

### 4. **Real-time Updates**
Supabase subscriptions enable live updates across all connected clients:

```javascript
supabase
  .channel('matches_changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' },
      (payload) => handleMatchUpdate(payload))
  .subscribe();
```

## 🧪 Testing & Quality

- **ESLint**: Code quality and consistency enforcement
- **React Hooks linting**: Ensures proper hook usage
- **Error Boundaries**: Graceful error handling
- **Type safety**: Some TypeScript usage (`.tsx` files) for critical components

## 🌐 Deployment

The project includes:
- **Vercel configuration** (`vercel.json`): Optimized for Vercel deployment
- **Vite build**: Generates optimized production assets
- **Public assets**: Favicon and static resources in `/public`

## 📱 Mobile & Responsive Design

- Fully responsive CSS with mobile-first approach
- QR code generation for easy mobile access
- Touch-friendly interfaces for tablets
- Optimized for various screen sizes

## 🔧 Advanced Features

### Bracket Canvas (`BracketCanvas.jsx`)
- Interactive SVG-based bracket visualization
- Zoom, pan, and pinch controls
- Auto-layout with collision detection
- Winner path highlighting

### Micro-Points Tracking
Point-by-point scoring system:
```javascript
microPoints: [
  { winner: 'player1', score1: 1, score2: 0 },
  { winner: 'player2', score1: 1, score2: 1 },
  // ... detailed point history
]
```

### Match Status Logic (`matchUtils.js`)
Intelligent status determination:
- `scheduled`: No scores entered
- `in-progress`: Partial scores
- `completed`: Winner determined
- Best-of format validation

## 📦 Key Utilities

### `bracketLogic.js`
- `getBracketBlueprint()`: Generates full tournament structure
- `seedPlayers()`: Assigns players to first round matches
- `updateBracketMatch()`: Cascades match results through bracket
- `getTargetDropId()`: Determines loser bracket placement

### `matchUtils.js`
- `getBestOf()`: Returns required wins for match format
- `compareMatchIds()`: Sorts matches by bracket order
- `getMatchStatus()`: Calculates match state from scores

## 🎓 Learning Resources

For developers new to the stack:
- [React Documentation](https://react.dev/)
- [Vite Guide](https://vite.dev/guide/)
- [Supabase Docs](https://supabase.com/docs)
- [React Router](https://reactrouter.com/)
- [i18next](https://www.i18next.com/)

## 🤝 Contributing

This is a tournament-specific application, but the architecture can be adapted for other sports or competition formats. Key extension points:

1. **Bracket formats**: Modify `bracketLogic.js` for different tournament structures
2. **Scoring systems**: Extend `matchUtils.js` for sport-specific scoring
3. **Languages**: Add new JSON files in `src/i18n/`
4. **Themes**: Customize CSS files in component directories

## 📄 License

Check repository for license information.

## 🏁 Quick Start Guide

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd ricochet-polish-open-2026
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment** (optional for Supabase)
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   - Open http://localhost:5173
   - Login with admin credentials (if configured)
   - Create your first tournament
   - Add players and generate brackets
   - Start managing matches!

---

**Project Maintainer**: This codebase represents a complete tournament management system with professional features suitable for live events, streaming, and competitive play.
