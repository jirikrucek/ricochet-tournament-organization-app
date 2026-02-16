# Translation Key Structure

Use nested JSON with dot-notation access.

## Pattern

```
{section}.{subsection}.{key}
```

**Examples:**
```javascript
t('navigation.live')                      // "Live"
t('players.modal.labels.fullName')        // "Full Name *"
t('matches.filters.all')                  // "All"
```

## Top-Level Sections

- `navigation` — Nav menu items
- `common` — Shared UI elements (buttons, actions)
- `players` — Player management page
- `matches` — Match management page
- `live` — Live view page
- `organizer` — Organizer/admin page
- `brackets` — Bracket visualization
- `standings` — Standings page
- `profile` — Player profile modal

## Nesting Guidelines

- **Max depth:** 3 levels (section.subsection.key)
- **Group related keys:** modal fields, form labels, etc.
- **Use descriptive names:** `fullName` not `fn`, `editTitle` not `et`
