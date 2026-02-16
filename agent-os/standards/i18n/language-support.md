# Language Support

App supports 3 languages with English fallback.

## Supported Languages

```javascript
resources: {
    pl: { translation: pl },  // Polish
    en: { translation: en },  // English (fallback)
    nl: { translation: nl }   // Dutch
}
```

**Note:** German (`de.json`) and Czech (`cs.json`) translation files exist but are not currently loaded in the runtime configuration.

## Configuration

- **Fallback:** `fallbackLng: 'en'` — English is default if translation missing
- **Detection:** Checks localStorage first, then browser language
- **Persistence:** Language choice saved to localStorage

## Language Files

Active translation files loaded in `src/i18n/config.js`:
- `pl.json` (Polish)
- `en.json` (English - fallback)
- `nl.json` (Dutch)

Additional translation files available but not loaded:
- `de.json` (German)
- `cs.json` (Czech)

**Import in config.js:**
```javascript
import pl from './pl.json';
import en from './en.json';
import nl from './nl.json';
```
