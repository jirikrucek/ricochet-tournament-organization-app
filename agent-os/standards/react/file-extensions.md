# File Extensions

Use file extensions to signal content type.

## Rules

**Use `.jsx` for:**
- React components that contain JSX syntax
- Page components in `src/pages/`
- Reusable UI components in `src/components/`

**Use `.js` for:**
- Utility functions (no JSX)
- Business logic
- Constants
- Configuration files

**Use `.tsx`/`.ts` for:**
- TypeScript files (gradually migrating)
- Type definitions
- Currently: `useAuth.tsx`, `supabase.ts`

## Examples

```
✓ src/components/Layout.jsx       (has JSX)
✓ src/utils/bracketLogic.js       (pure logic)
✓ src/hooks/useAuth.tsx           (TypeScript)
✗ src/components/Layout.js        (should be .jsx)
```

**Why:** Clear file type identification for developers and tools. ESLint and build tools treat `.jsx` files appropriately.
