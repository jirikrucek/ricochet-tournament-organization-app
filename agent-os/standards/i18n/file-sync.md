# Translation File Sync

All 5 language files MUST have identical key structures.

## Critical Rule

**Every key in one file must exist in all other files.**

If `en.json` has:
```json
{
  "players": {
    "title": "Players Database"
  }
}
```

Then `pl.json`, `nl.json`, `de.json`, `cs.json` must also have `players.title`.

## Why This Matters

- Missing keys break the app (silent failures or undefined text)
- i18next fallback only works if structure exists
- Users in different languages see broken UI

## Workflow

When adding or modifying translations:

1. Update the key in **ALL 5 files** simultaneously
2. Keep the same nesting structure
3. Translate the value appropriately for each language
4. Test by switching languages in the app

**Never commit a change to only one language file.**
