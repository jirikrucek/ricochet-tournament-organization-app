# Storage Mode Selection

App operates in ONE mode: Supabase OR localStorage.

## Modes

### Supabase Mode

**When:** Environment variables configured
```bash
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

**Features:**
- Cloud database
- Real-time sync across devices
- Multi-user support
- Persistent data

### localStorage Mode

**When:** No environment variables

**Features:**
- Browser-only storage
- Single device
- No internet required
- Data clears with browser cache

## Critical: Never Mix

```javascript
// ✗ WRONG - Don't do this
if (isSupabaseConfigured) {
    await supabase.from('players').insert(data);
}
localStorage.setItem('backup', JSON.stringify(data)); // NO!
```

```javascript
// ✓ CORRECT - One or the other
if (isSupabaseConfigured) {
    await supabase.from('players').insert(data);
} else {
    localStorage.setItem('players', JSON.stringify(data));
}
```

## Why Single Mode?

- **Avoids sync conflicts** between storage layers
- **Clear data source** — Never ambiguous where data lives
- **Simpler logic** — No conflict resolution needed
