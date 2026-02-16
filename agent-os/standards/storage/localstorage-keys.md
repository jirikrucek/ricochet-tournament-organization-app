# localStorage Key Naming

Consistent naming convention for all localStorage keys.

## Pattern

```
ricochet_{category}_{scope}
```

## Current Keys

### Global Keys

```javascript
'ricochet_theme'              // dark/light mode
'ricochet_active_id'          // active tournament ID
'ricochet_tournaments_meta'   // tournament metadata
'ricochet_players_db_{id}'    // players per tournament
```

### Tournament-Specific Keys

```javascript
'ricochet_matches_{tournamentId}'   // match data
'brazilian_v14_GLOBAL_STATE_{id}'   // legacy match storage
```

## Rules

1. **Always prefix with `ricochet_`**
   - Avoids conflicts with other apps
   - Easy to find in DevTools
   - Clear ownership

2. **Include scope when needed**
   ```javascript
   // Global
   localStorage.setItem('ricochet_theme', 'dark');
   
   // Tournament-specific
   const key = `ricochet_players_db_${tournamentId}`;
   localStorage.setItem(key, JSON.stringify(players));
   ```

3. **Use snake_case for keys**
   ```
   ✓ ricochet_active_id
   ✗ ricochetActiveId
   ```

## Cleanup

When deleting a tournament:
```javascript
localStorage.removeItem(`ricochet_players_db_${id}`);
localStorage.removeItem(`ricochet_matches_${id}`);
```
