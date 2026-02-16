# Match ID Format

All matches use this strict ID pattern:

```
{bracket}-r{round}-m{matchNum}
```

**Examples:**
- `wb-r1-m1` — Winners Bracket, Round 1, Match 1
- `lb-r3-m4` — Losers Bracket, Round 3, Match 4  
- `p25-r2-m1` — Placement bracket (25th), Round 2, Match 1

**Special Finals:**
- `grand-final` — Championship match
- `consolation-final` — 3rd place qualifier
- `lb-final` — Losers bracket final
- `p{N}-f` — Placement finals (e.g., `p25-f`, `p17-f`)

**Match IDs are immutable** — They're used as references throughout the bracket logic (nextMatchId, loserMatchId, sourceMatchId). Never modify once created.
