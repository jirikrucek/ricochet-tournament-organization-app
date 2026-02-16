# Best-of Format Rules

Match format depends on bracket type:

```javascript
// Winners Bracket: BO5 (first to 3)
if (bracket === 'wb') return 5;

// Grand Final: BO5 (first to 3)  
if (bracket === 'gf') return 5;

// Losers Bracket: BO3 (first to 2)
if (bracket === 'lb') return 3;

// Placement Brackets: BO3 (first to 2)
if (bracket.startsWith('p')) return 3;
```

## Scoring Logic

```javascript
const isBo5 = (match.bracket === 'wb' || match.bracket === 'gf');
const winThresh = isBo5 ? 3 : 2;

if (score1 >= winThresh) winnerId = player1Id;
if (score2 >= winThresh) winnerId = player2Id;
```

**No exceptions** — These rules apply to every match in the tournament.
