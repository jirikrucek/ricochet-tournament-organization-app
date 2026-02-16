# Hook Conventions

Consistent naming and structure for custom hooks.

## Naming

**All hooks start with `use`**
```javascript
✓ usePlayers, useMatches, useTournament
✗ getPlayers, playersHook, PlayersHook
```

## Return Structure

**Return objects for multiple values:**
```javascript
export const usePlayers = () => {
    return {
        // Data
        players,
        loading,
        error,
        
        // Operations
        addPlayer,
        updatePlayer,
        deletePlayer,
        importPlayers
    };
};
```

**Usage with destructuring:**
```javascript
const { players, addPlayer, loading } = usePlayers();
```

## Operation Naming

**Use verb prefixes:**
- `add*` — Create new item (addPlayer, addMatch)
- `update*` — Modify existing (updatePlayer, updateMatch)
- `delete*` — Remove item (deletePlayer, deleteMatch)
- `fetch*` — Load data (fetchPlayers)
- `save*` — Persist changes (saveMatches)

## Error Handling

```javascript
const addPlayer = async (data) => {
    try {
        // ... operation
        return newPlayer;
    } catch (error) {
        console.error('Error adding player:', error);
        return null; // or throw
    }
};
```

**Return null or throw** on error, never undefined.
