# Tech Stack

## Frontend Framework

- **React 19.2**: Modern functional components with hooks
- **Vite**: Fast development server and build tool
- **React Router v7**: Client-side routing and navigation
- **Context API**: Global state management (TournamentContext, MatchesContext)

## Backend

N/A - This is a frontend-only application with direct database integration

## Database & Storage

- **Supabase** (PostgreSQL): Optional cloud database for real-time synchronization
- **LocalStorage**: Fallback storage when Supabase is not configured
- **Dual-mode architecture**: Automatically detects and uses available storage method

## UI Libraries

- **Lucide React**: Modern icon library
- **@dnd-kit**: Drag-and-drop functionality for match management
- **react-zoom-pan-pinch**: Interactive bracket zooming and panning
- **QRCode.react**: QR code generation for match sharing

## Internationalization

- **i18next**: Multi-language support
- **react-i18next**: React integration for translations
- Supports 5 languages: **English (default/fallback)**, Polish, German, Dutch, Czech
- Automatic browser language detection with localStorage caching

## Development Tools

- **ESLint**: Code quality and style checking (configured for React 19)
- **Vite**: Build optimization and hot module replacement
- **Vitest**: Fast unit testing framework with jsdom environment
- **Testing Library**: React component testing (@testing-library/react, user-event, jest-dom)
- **TypeScript**: Type definitions for enhanced IDE support
- **CSS**: Custom styling with dark mode support

## Hosting

- **Vercel**: Deployment platform (configured via vercel.json)
- Static site generation optimized for fast global delivery
