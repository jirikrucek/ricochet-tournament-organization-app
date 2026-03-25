# Project Guidelines

## Code Style

- **React 19.2** with functional components only (no class components except [ErrorBoundary.jsx](../src/components/ErrorBoundary.jsx))
- Use JSX file extension for components with JSX syntax
- Follow ESLint config in [eslint.config.js](../eslint.config.js) - unused variables starting with uppercase are allowed
- Import statements: Group by type (external libs → internal modules → styles)
- See [Layout.jsx](../src/components/Layout.jsx) for component structure patterns

## Design Principles

This project follows three core software engineering principles: **Domain-Driven Design (DDD)**, **Test-Driven Development (TDD)**, and **SOLID** principles.

### Domain-Driven Design (DDD)

The codebase is organized around tournament domain concepts:

- **Domain Logic**: Pure business logic in `utils/` (bracket progression, match state transitions)
- **Domain Models**: Tournament, Player, Match entities with clear boundaries
- **Ubiquitous Language**: Code uses tournament terminology (brackets, rounds, seeding, progression)
- **Bounded Contexts**: Tournament management, match tracking, and player profiles are separate concerns
- **Repository Pattern**: Data access abstracted through custom hooks (`usePlayers`, `useMatches`, `useTournamentMatches`)

Example: [bracketLogic.js](../src/utils/bracketLogic.js) encapsulates all bracket progression rules as pure domain logic, independent of UI or storage concerns.

### Test-Driven Development (TDD)

Write tests before or alongside implementation:

1. **Test Coverage Requirements**:
   - All `utils/` functions must have unit tests
   - Custom hooks should have integration tests
   - Complex components require component tests
   - Aim for >80% coverage on critical paths

2. **Test-First Workflow**:
   - Write failing test that describes desired behavior
   - Implement minimal code to pass the test
   - Refactor while keeping tests green

3. **Test Organization**:
   - Place `.test.js` or `.test.jsx` files adjacent to implementation
   - Use descriptive test names: `should [expected behavior] when [condition]`
   - Group related tests with `describe` blocks

Example: [bracketLogic.test.js](../src/utils/bracketLogic.test.js) validates all bracket progression scenarios before they're used in the UI.

### SOLID Principles

#### Single Responsibility Principle (SRP)
- Each component/hook/utility has one reason to change
- `usePlayers` only handles player data operations
- `BracketCanvas` only renders bracket visualization
- `matchUtils.js` only contains match state logic

#### Open/Closed Principle (OCP)
- Custom hooks abstract data access, allowing implementation changes
- Translation system supports adding languages without changing components

#### Liskov Substitution Principle (LSP)
- All hooks follow consistent interface patterns (loading, error, data)
- Components receive props that can be fulfilled by different data sources

#### Interface Segregation Principle (ISP)
- Contexts expose only necessary methods (`TournamentContext` vs `MatchesContext`)
- Custom hooks return focused interfaces (players hook doesn't expose match operations)
- Components receive specific props, not entire context objects

#### Dependency Inversion Principle (DIP)
- Components depend on hooks (abstractions), not direct database access
- Business logic in `utils/` has no dependencies on React or storage
- UI components depend on contexts, not concrete data sources

**Key Pattern**: High-level tournament logic depends on abstractions (hooks/contexts), not concrete storage details.

## Technology Stack

### Frontend Framework
- **React 19.2** with **Vite** for fast development
- **React Router v7** for page navigation
- **Context API** for state management

### Data Storage
- **Supabase** (PostgreSQL cloud database) - required for all domain data
- **LocalStorage** - only for UI preferences (theme, language, active tournament ID)
- App will hard-fail with an error screen if Supabase is unreachable

### UI Components & Libraries
- **Lucide React** - Modern icon library
- **@dnd-kit** - Drag-and-drop functionality
- **react-zoom-pan-pinch** - Interactive bracket zooming
- **QRCode.react** - QR code generation
- Custom CSS with dark mode support

### Internationalization
- **i18next** - Supports 5 languages (Polish, English, German, Dutch, Czech)
- Auto-detection of browser language

## Architecture

### Supabase-Only Storage Pattern

**Critical**: Supabase is the sole data store for domain data (tournaments, players, matches). The app requires a valid Supabase connection at startup — a reachability check runs before the app renders. If it fails, a fatal error screen blocks all interaction.

```javascript
import { supabase } from "../lib/supabase";

// All domain data operations go through Supabase
const { data, error } = await supabase.from("table").select();
if (error) throw error;
```

**localStorage is only used for UI preferences:**
- `ricochet_theme` — dark/light mode
- `ricochet_active_id` — last selected tournament ID
- `i18nextLng` — language preference (managed by i18next)

See [TournamentContext.jsx](../src/contexts/TournamentContext.jsx) for the implementation pattern.

### State Management

- **Context API** for global state (TournamentContext, MatchesContext)
- **Custom hooks** for data operations (useAuth, usePlayers, useMatches, useTournamentMatches)
- Never duplicate data fetching logic - create a custom hook instead
- Context providers wrap the app in [main.jsx](../src/main.jsx)

### File Organization

- `pages/` - Route components (one per route)
- `contexts/` - Global state providers
- `components/` - Reusable UI components
- `hooks/` - Custom React hooks for data operations
- `utils/` - Pure business logic functions
- `i18n/` - Translation files (5 languages)

### Project Structure

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

### Key Files to Understand

1. **`src/App.jsx`** - Main app component with routing
2. **`src/contexts/TournamentContext.jsx`** - Tournament management logic
3. **`src/contexts/MatchesContext.jsx`** - Match state handling
4. **`src/utils/bracketLogic.js`** - Bracket calculation algorithms
5. **`src/pages/Live.jsx`** - Main public-facing interface
6. **`src/pages/Organizer.jsx`** - Admin tournament setup

### Data Flow

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

## Build and Test

```bash
npm run dev      # Start development server (Vite)
npm run build    # Production build
npm run lint     # Check code quality with ESLint
npm run preview  # Preview production build
npm run test     # Run tests with Vitest
npm run test:ui  # Run tests with UI interface
```

### Testing with Vitest

**Test Framework**: Vitest with jsdom environment for React component testing

**Available Testing Libraries**:
- `vitest` - Test runner and assertion library
- `@testing-library/react` - React component testing utilities
- `@testing-library/user-event` - User interaction simulation
- `@testing-library/jest-dom` - Custom matchers for DOM assertions

#### Test File Structure

Place test files adjacent to the code they test with `.test.js` or `.test.jsx` extension:

```
src/
  utils/
    bracketLogic.js
    bracketLogic.test.js
  hooks/
    usePlayers.js
    usePlayers.test.jsx
  components/
    PlayerProfileModal.jsx
    PlayerProfileModal.test.jsx
```

#### Unit Testing Patterns

**Testing Pure Functions** (utils):

```javascript
import { describe, it, expect } from 'vitest';
import { getTargetDropId } from './bracketLogic';

describe('bracketLogic', () => {
  describe('getTargetDropId', () => {
    it('should return correct drop target for WB R1 loss', () => {
      const result = getTargetDropId('wb', 1, 1);
      expect(result).toBe('lb-r1-m1');
    });
  });
});
```

**Testing React Hooks**:

```javascript
import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePlayers } from './usePlayers';

describe('usePlayers', () => {
  it('should fetch players from localStorage when Supabase not configured', async () => {
    const { result } = renderHook(() => usePlayers('tournament-123'));
    
    await waitFor(() => {
      expect(result.current.players).toHaveLength(32);
    });
  });
});
```

#### Integration Testing Patterns

**Testing Components with Context**:

```javascript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TournamentContext } from '../contexts/TournamentContext';
import { PlayerProfileModal } from './PlayerProfileModal';

describe('PlayerProfileModal', () => {
  const mockContextValue = {
    currentTournament: { id: '123', name: 'Test Tournament' },
    updatePlayer: vi.fn()
  };

  it('should render player information', () => {
    render(
      <TournamentContext.Provider value={mockContextValue}>
        <PlayerProfileModal playerId="player-1" isOpen={true} />
      </TournamentContext.Provider>
    );
    
    expect(screen.getByText(/player information/i)).toBeInTheDocument();
  });
});
```

**Testing with i18n**:

```javascript
import { render } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../i18n/config';

const renderWithI18n = (component) => {
  return render(
    <I18nextProvider i18n={i18n}>
      {component}
    </I18nextProvider>
  );
};

// Use in tests
it('should display translated text', () => {
  renderWithI18n(<MyComponent />);
  // assertions...
});
```

#### Mocking Patterns

**Mocking Supabase**:

```javascript
import { vi } from 'vitest';

const mockFrom = vi.fn();

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: (...args) => mockFrom(...args),
    channel: vi.fn(() => ({ on: vi.fn().mockReturnThis(), subscribe: vi.fn().mockReturnThis() })),
    removeChannel: vi.fn(),
  },
  checkSupabaseReachability: vi.fn().mockResolvedValue(undefined),
}));

// Helper to create chainable mock
const createChain = (resolveValue = { data: [], error: null }) => {
    const chain = {};
    chain.select = vi.fn().mockReturnValue(chain);
    chain.insert = vi.fn().mockReturnValue(chain);
    chain.update = vi.fn().mockReturnValue(chain);
    chain.delete = vi.fn().mockReturnValue(chain);
    chain.eq = vi.fn().mockReturnValue(chain);
    chain.order = vi.fn().mockReturnValue(chain);
    chain.single = vi.fn().mockResolvedValue(resolveValue);
    chain.then = (fn) => Promise.resolve(resolveValue).then(fn);
    chain.catch = (fn) => Promise.resolve(resolveValue).catch(fn);
    return chain;
};

mockFrom.mockReturnValue(createChain({ data: [], error: null }));
```

#### Testing Best Practices

1. **Test file naming**: Use `.test.js` or `.test.jsx` extension
2. **Organize with describe blocks**: Group related tests logically
3. **Mock Supabase chains**: Use the `createChain()` helper pattern for chainable mock queries
4. **Mock external dependencies**: Mock Supabase module and auth hooks
5. **Use Testing Library queries**: Prefer `getByRole`, `getByLabelText` over `getByTestId`
6. **Test user interactions**: Use `@testing-library/user-event` for realistic interactions
7. **Clean up**: Use `beforeEach`/`afterEach` for test isolation
8. **Async operations**: Use `waitFor` and `findBy*` queries for async updates

#### What to Test

**Priority 1 - Critical Business Logic**:
- Bracket progression logic ([bracketLogic.js](../src/utils/bracketLogic.js))
- Match state transitions ([matchUtils.js](../src/utils/matchUtils.js))
- Tournament CRUD operations (TournamentContext)

**Priority 2 - Data Hooks**:
- Custom hooks with Supabase operations (usePlayers, useMatches)
- Data fetching and error handling
- Real-time subscription logic

**Priority 3 - UI Components**:
- Complex interactive components (BracketCanvas, PlayerProfileModal)
- Form validation and submission
- Conditional rendering based on state

**Lower Priority**:
- Simple presentational components
- Styling-only changes
- Third-party library wrappers

## Project Conventions

### Tournament Bracket System

This app uses a **strict Brazilian double elimination system** with:

- Winners Bracket: 5 rounds (WB)
- Losers Bracket: 6 rounds (LB)
- Specific drop patterns defined in [bracketLogic.js](../src/utils/bracketLogic.js)

**Match ID Pattern**: `{bracket}-r{round}-m{matchNum}`

- Example: `wb-r1-m1` (Winners Bracket, Round 1, Match 1)
- Example: `lb-r3-m4` (Losers Bracket, Round 3, Match 4)

**Never modify drop patterns** without understanding the complete bracket flow - see `getTargetDropId()` function.

### Internationalization (i18n)

When adding or modifying UI text:

1. Add translation keys to **ALL 5 language files**: [en.json](../src/i18n/en.json), [pl.json](../src/i18n/pl.json), [de.json](../src/i18n/de.json), [nl.json](../src/i18n/nl.json), [cs.json](../src/i18n/cs.json)
2. Use nested structure matching existing patterns
3. Access with `t('section.key')` via `useTranslation()` hook
4. Fallback language is English (`en`) - **always add English translations first for new features**

### LocalStorage Keys

LocalStorage is used **only for UI preferences** (not domain data):

- `ricochet_theme` - Dark/light mode preference
- `ricochet_active_id` - Last selected tournament ID
- `i18nextLng` - Language preference (managed by i18next)

### Match Data Structure

Each match has:
- **ID**: e.g., "wb-r1-m1" (Winners Bracket, Round 1, Match 1)
- **Players**: Two player IDs
- **Scores**: Points for each player
- **Micro-points**: Array of point-by-point results `[1, 2, 1, 1, 2]`
- **Status**: pending/in_progress/completed
- **Court**: Physical court assignment

### Error Handling

- Wrap top-level app in ErrorBoundary (already configured in [main.jsx](../src/main.jsx))
- Use `console.error()` for debugging with descriptive messages
- Try-catch blocks for async operations with meaningful error messages
- See [TournamentContext.jsx](../src/contexts/TournamentContext.jsx) for patterns

## Integration Points

### Supabase Integration

- **Required** cloud database configured via environment variables
- App hard-fails at startup if Supabase is unreachable (shows fatal error UI)
- Real-time subscriptions for live updates on tournaments, players, and matches
- Schema defined in [supabase migrations](../supabase/migrations/)
- Admin writes gated by `admins` allowlist table + RLS policies

#### Database Schema

**tournaments**
- `id` (UUID) - Primary key
- `name` (text) - Tournament name
- `date` (text) - Tournament date
- `status` (text) - Current status
- `created_at` (timestamp)

**players**
- `id` (UUID) - Primary key
- `tournament_id` (UUID) - Foreign key to tournaments
- `full_name` (text) - Player's full name
- `country` (text) - Country code
- `elo` (integer) - ELO rating
- `created_at` (timestamp)

**matches**
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

### Environment Variables

Required (app will not start without them):

```
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key
```

### Third-Party Libraries

- `@dnd-kit` - Drag-and-drop for match management
- `react-zoom-pan-pinch` - Bracket visualization zoom
- `qrcode.react` - QR code generation for match sharing
- `lucide-react` - Icon library

### Context7 Documentation Retrieval

When working with external libraries or need up-to-date documentation:

- Use Context7 (via Upstash MCP server) to retrieve latest docs and code examples
- Search available tools with pattern `mcp_upstash` to access documentation tools
- Helpful for getting current API references, best practices, and usage examples
- Use when library documentation is needed beyond what's in node_modules

**When to use Context7:**
- Implementing new features with unfamiliar libraries
- Updating library usage to latest patterns
- Resolving API compatibility issues
- Finding code examples for specific use cases

## Deployment

### Vercel Deployment

This application is optimized for deployment on **Vercel**, a static site hosting platform with global CDN distribution.

#### Configuration

The project includes [vercel.json](../vercel.json) with the following configuration:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This rewrite rule enables client-side routing for the React Router v7 SPA by redirecting all routes to `index.html`.

#### Build Settings

Vercel automatically detects Vite projects. The build process uses:

- **Build Command**: `npm run build` (outputs to `dist/`)
- **Output Directory**: `dist`
- **Development Command**: `npm run dev`
- **Install Command**: `npm install`

#### Environment Variables

For production deployments, configure environment variables in the Vercel dashboard:

```
VITE_SUPABASE_URL=your_production_url
VITE_SUPABASE_ANON_KEY=your_production_key
```

**Important**: Never commit `.env` files with real credentials. Use Vercel's environment variable management for sensitive data.

#### Deployment Workflow

1. **Automatic Deployments**: Push to `main` branch triggers production deployment
2. **Preview Deployments**: Pull requests automatically get preview URLs
3. **Rollback**: Use Vercel dashboard to rollback to previous deployments

#### Best Practices

- **Preview Before Merge**: Test changes in preview deployments before merging PRs
- **Environment Parity**: Keep development and production environment variables in sync
- **Build Validation**: Ensure `npm run build` succeeds locally before pushing
- **Performance Monitoring**: Use Vercel Analytics to track Core Web Vitals
- **Domain Configuration**: Configure custom domains via Vercel dashboard

#### Supabase Requirement

The app requires a running Supabase instance. Without it:

- The app shows a "Database Unavailable" error screen
- No domain data can be loaded or saved
- The retry button reloads the page to re-check connectivity

For local development, use Supabase CLI (`supabase start`).

#### Troubleshooting

- **404 on Refresh**: Ensure `vercel.json` rewrite rules are configured (already included)
- **Build Failures**: Check for ESLint errors with `npm run lint`
- **Environment Variables**: Verify all `VITE_*` prefixed variables are set in Vercel dashboard
- **Routing Issues**: Confirm React Router routes match Vercel rewrite configuration

## Security

- Supabase Auth with email/password authentication via [useAuth.tsx](../src/hooks/useAuth.tsx) hook
- `admins` allowlist table gates write access via RLS policies
- No sensitive credentials in code - use environment variables
- Admin routes check `isAuthenticated` state (ProtectedRoute in App.jsx)
- All player data is public by design
