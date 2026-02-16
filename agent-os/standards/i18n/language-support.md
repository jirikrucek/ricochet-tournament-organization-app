# Language Support

App supports 5 languages with English fallback.

## Supported Languages

```javascript
resources: {
    en: { translation: en },  // English (fallback)
    pl: { translation: pl },  // Polish
    nl: { translation: nl },  // Dutch
    de: { translation: de },  // German
    cs: { translation: cs }   // Czech
}
```

## Configuration

- **Fallback:** `fallbackLng: 'en'` — English is default if translation missing
- **Detection:** Checks localStorage first, then browser language
- **Persistence:** Language choice saved to localStorage

## Language Files

All translation files located in `src/i18n/`:
- `pl.json`, `en.json`, `nl.json`, `de.json`, `cs.json`

**Import in config.js:**
```javascript
import pl from './pl.json';
import en from './en.json';
// ... etc
```
