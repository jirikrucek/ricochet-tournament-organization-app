# Real-time Subscriptions

Supabase provides live updates, localStorage uses storage events.

## Supabase Real-time

```javascript
let channel;
if (isSupabaseConfigured) {
    channel = supabase
        .channel('matches:tournament-123')
        .on(
            'postgres_changes',
            {
                event: '*',  // INSERT, UPDATE, DELETE
                schema: 'public',
                table: 'matches',
                filter: `tournament_id=eq.${tournamentId}`
            },
            () => {
                fetchMatches(); // Re-fetch on change
            }
        )
        .subscribe();
}

// Cleanup
return () => {
    if (channel) supabase.removeChannel(channel);
};
```

## localStorage Events

```javascript
if (!isSupabaseConfigured) {
    // Listen for changes from other tabs
    const handleStorage = () => fetchMatches();
    window.addEventListener('storage', handleStorage);
    
    return () => {
        window.removeEventListener('storage', handleStorage);
    };
}
```

**Note:** Storage events only fire in OTHER tabs, not the current tab.

## When to Subscribe

- **Always** in useEffect with cleanup
- **Conditional** based on isSupabaseConfigured
- **Filter** by tournament_id to reduce noise

## Benefits

- **Multi-user sync:** Changes appear instantly across devices
- **No polling:** Server pushes updates
- **Efficient:** Only notified of actual changes
