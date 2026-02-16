# File Organization

Clear separation between routes, reusable components, and supporting code.

## Directory Structure

```
src/
├── pages/            Route components (one per route)
├── components/       Reusable UI components
├── contexts/         Global state providers
├── hooks/            Custom React hooks
├── utils/            Pure business logic
├── constants/        Static data
├── i18n/             Translation files
└── assets/           Images, fonts, etc.
```

## Rules

**Use `pages/` for:**
- Route-level components (one per URL)
- Components used by React Router
- Examples: `Players.jsx`, `Matches.jsx`, `Live.jsx`

**Use `components/` for:**
- Reusable UI elements
- Components used by multiple pages
- Examples: `Layout.jsx`, `PlayerProfileModal.jsx`, `BracketCanvas.jsx`

**Each component gets:**
- Single `.jsx` file (component code)
- Optional `.css` file (component styles)
- No folders unless component has sub-components

## Naming

- **PascalCase** for components: `PlayerProfileModal.jsx`
- **camelCase** for hooks: `usePlayers.js`, `useAuth.tsx`
- **camelCase** for utils: `bracketLogic.js`, `matchUtils.js`
