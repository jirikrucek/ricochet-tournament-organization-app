# Provider Hierarchy

Providers wrap the app in specific order based on dependencies.

## Current Order (main.jsx)

```javascript
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>           {/* 1. Error handling first */}
      <BrowserRouter>          {/* 2. Router */}
        <AuthProvider>         {/* 3. Auth (no deps) */}
          <TournamentProvider> {/* 4. Tournament (needs Auth) */}
            <MatchesProvider>  {/* 5. Matches (needs Tournament + Auth) */}
              <App />
            </MatchesProvider>
          </TournamentProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
```

## Rules

1. **ErrorBoundary wraps everything** — Catches all errors
2. **Router before state** — Providers may use routing hooks
3. **Auth first** — Other contexts depend on isAuthenticated
4. **Tournament before Matches** — Matches need activeTournamentId
5. **Order by dependency** — Parent providers don't use child providers

## Why Order Matters

- **MatchesProvider uses useTournament()** — TournamentProvider must be ancestor
- **TournamentProvider uses useAuth()** — AuthProvider must be ancestor
- Breaking order causes "used outside provider" errors

## Adding New Providers

Insert based on dependencies:
- No deps? → Place after Auth
- Uses Tournament? → Place after Tournament
- Uses Matches? → Place after Matches
