# Project Guidelines

## Code Style

- **React 19.2** with functional components only (no class components except [ErrorBoundary.jsx](../src/components/ErrorBoundary.jsx))
- Use JSX file extension for components with JSX syntax
- Follow ESLint config in [eslint.config.js](../eslint.config.js) - unused variables starting with uppercase are allowed
- Import statements: Group by type (external libs → internal modules → styles)
- See [Layout.jsx](../src/components/Layout.jsx) for component structure patterns

## Architecture

### Dual-Mode Storage Pattern

**Critical**: Always check `isSupabaseConfigured` before data operations. This app works both with Supabase cloud database AND localStorage fallback.

```javascript
import { supabase, isSupabaseConfigured } from "../lib/supabase";

if (isSupabaseConfigured) {
  // Supabase operations
  const { data } = await supabase.from("table").select();
} else {
  // localStorage fallback
  const data = JSON.parse(localStorage.getItem("key"));
}
```

See [TournamentContext.jsx](../src/contexts/TournamentContext.jsx) for complete implementation pattern.

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

// Mock the entire supabase module
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ data: [], error: null })),
      insert: vi.fn(() => Promise.resolve({ data: [], error: null }))
    }))
  },
  isSupabaseConfigured: false
}));
```

**Mocking localStorage**:

```javascript
import { beforeEach, vi } from 'vitest';

beforeEach(() => {
  const mockStorage = {};
  global.localStorage = {
    getItem: vi.fn((key) => mockStorage[key] || null),
    setItem: vi.fn((key, value) => { mockStorage[key] = value; }),
    removeItem: vi.fn((key) => { delete mockStorage[key]; }),
    clear: vi.fn(() => { Object.keys(mockStorage).forEach(key => delete mockStorage[key]); })
  };
});
```

#### Testing Best Practices

1. **Test file naming**: Use `.test.js` or `.test.jsx` extension
2. **Organize with describe blocks**: Group related tests logically
3. **Test dual-mode storage**: Always test both Supabase and localStorage paths
4. **Mock external dependencies**: Mock Supabase, localStorage, and APIs
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
- Custom hooks with dual-mode storage (usePlayers, useMatches)
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
4. Fallback language is English (`en`)

### LocalStorage Keys

Follow the `ricochet_*` naming convention:

- `ricochet_tournaments_meta` - Tournament metadata
- `ricochet_theme` - Dark/light mode preference
- `ricochet_matches_{tournamentId}` - Match data per tournament

### Error Handling

- Wrap top-level app in ErrorBoundary (already configured in [main.jsx](../src/main.jsx))
- Use `console.error()` for debugging with descriptive messages
- Try-catch blocks for async operations with meaningful error messages
- See [TournamentContext.jsx](../src/contexts/TournamentContext.jsx) for patterns

## Integration Points

### Supabase Integration

- Optional cloud database configured via environment variables
- Check `isSupabaseConfigured` boolean before all DB operations
- Real-time subscriptions only when Supabase is configured
- Schema defined in [supabase_schema.sql](../supabase_schema.sql)

### Environment Variables

Required for Supabase mode (app works without them):

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

## Security

- Simple authentication via [useAuth.tsx](../src/hooks/useAuth.tsx) hook
- No sensitive credentials in code - use environment variables
- Admin routes check `isAuthenticated` state
- All player data is public by design
