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
```

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
4. Fallback language is Polish (`pl`)

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

## Security

- Simple authentication via [useAuth.tsx](../src/hooks/useAuth.tsx) hook
- No sensitive credentials in code - use environment variables
- Admin routes check `isAuthenticated` state
- All player data is public by design
