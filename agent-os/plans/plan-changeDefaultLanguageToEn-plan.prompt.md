# Plan: Change Default Language from PL to EN with Full i18n Support

The app currently uses Polish as the fallback language but has 5 translation files. This refactor will make English the default language, enable all 5 languages in the UI, and reorder the language selector to show English first. The changes maintain backward compatibility with existing localStorage preferences.

## Steps

### 1. Update `src/i18n/config.js`
- Import missing languages: `import de from './de.json'` and `import cs from './cs.json'` after line 7
- Add `de: { translation: de }` and `cs: { translation: cs }` to resources object (lines 14-16)
- Change `fallbackLng: 'pl'` to `fallbackLng: 'en'` (line 18)

### 2. Update `src/components/LanguageSelector.jsx`
- Reorder and expand LANGUAGES array to:
  ```javascript
  [
    { code: 'en', label: 'English' },
    { code: 'pl', label: 'Polski' },
    { code: 'de', label: 'Deutsch' },
    { code: 'nl', label: 'Nederlands' },
    { code: 'cs', label: 'Čeština' }
  ]
  ```
- Change fallback in line 51 from `i18n.language || 'pl'` to `i18n.language || 'en'`

### 3. Update `.github/copilot-instructions.md`
- Change "Fallback language is Polish (`pl`)" to "Fallback language is English (`en`)" (line 80)

### 4. Update `agent-os/standards/i18n/language-support.md`
- Change comment "Polish (fallback)" to "English (fallback)" in resources example
- Change "`fallbackLng: 'pl'`" to "`fallbackLng: 'en'`"
- Update "Polish is default if translation missing" to "English is default if translation missing"

### 5. Update `agent-os/product/tech-stack.md`
- Change "Supports 5 languages: Polish (default), English, German, Dutch, Czech" to "Supports 5 languages: English (default), Polish, German, Dutch, Czech" (line 31)

## Verification Steps

1. Clear localStorage: `localStorage.removeItem('i18next')` in browser console
2. Reload app and verify English appears by default
3. Open language selector dropdown and verify all 5 languages appear with English first
4. Switch between all 5 languages to confirm translations load correctly
5. Check that language preference persists after page reload
6. Run `npm run lint` to ensure no syntax errors

## Decisions Made

- **Enabled all 5 languages**: German and Czech were previously translated but hidden from users - now fully accessible
- **English first in dropdown**: More intuitive order with EN as default, followed by PL, DE, NL, CS (alphabetically by English name)

## Impact

- Users without a saved language preference will see English instead of Polish on first visit
- Existing users with a saved language preference in localStorage will continue to see their chosen language
- Spectators and organizers can now access all 5 translation files (previously only 3 were accessible)
- Documentation will accurately reflect English as the fallback language
