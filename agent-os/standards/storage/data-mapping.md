# Data Mapping Pattern

Convert between app (camelCase) and Supabase (snake_case) naming.

## Why Map?

- **JavaScript convention:** camelCase (`playerId`, `fullName`)
- **PostgreSQL convention:** snake_case (`player_id`, `full_name`)
- **Consistency:** App code uses camelCase everywhere

## Mapper Functions

### From Database (snake → camel)

```javascript
const mapToCamel = (dbRecord) => ({
    id: dbRecord.id,
    playerId: dbRecord.player_id,
    fullName: dbRecord.full_name,
    tournamentId: dbRecord.tournament_id,
    // ... all fields
});

// Usage
const { data } = await supabase.from('matches').select('*');
const matches = data.map(mapToCamel);
```

### To Database (camel → snake)

```javascript
const mapToSnake = (appData) => ({
    id: appData.id,
    player_id: appData.playerId,
    full_name: appData.fullName,
    tournament_id: appData.tournamentId,
    // ... all fields
});

// Usage
const dbRecord = mapToSnake(match);
await supabase.from('matches').insert(dbRecord);
```

## localStorage: No Mapping

```javascript
// localStorage stores JS objects directly
localStorage.setItem('matches', JSON.stringify(matches));
const matches = JSON.parse(localStorage.getItem('matches'));
// Already in camelCase
```

**Only map for Supabase operations.**
