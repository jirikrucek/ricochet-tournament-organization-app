# Plan: Refactor Default Language from PL to EN

This refactoring changes the application's default/fallback language from Polish (PL) to English (EN) across all configuration, code, and documentation files. The research revealed that while 5 languages are documented, only 3 (PL, EN, NL) are currently configured. This plan also fixes that discrepancy by properly importing German and Czech translation files.

**Key decision:** English chosen as the new default because it's the most internationally recognized language, making the app more accessible to global users while Polish remains fully supported.

## Relevant Standards

@agent-os/standards/i18n/language-support.md
@agent-os/standards/i18n/file-sync.md
@agent-os/standards/i18n/adding-translations.md

## Steps

### 1. Update core i18n configuration

**File:** [src/i18n/config.js](src/i18n/config.js)

- Change line 18: `fallbackLng: 'en'` (was `'pl'`)
- Import missing language files: `import de from './de.json'` and `import cs from './cs.json'` (lines 1-8)
- Add German and Czech to resources object: `de: { translation: de }, cs: { translation: cs }` (lines 11-17)
- Reorder resources to put `en` first (optional but conventional for default language)

### 2. Fix hardcoded fallback in LanguageSelector

**File:** [src/components/LanguageSelector.jsx](src/components/LanguageSelector.jsx)

- Change line 51: `const currentLang = i18n.language || 'en'` (was `|| 'pl'`)
- Optionally reorder LANGUAGES array (lines 6-10) to list English first

### 3. Make date formatting dynamic

**Files:** 
- [src/pages/Organizer.jsx](src/pages/Organizer.jsx#L38)
- [src/pages/TournamentSelect.jsx](src/pages/TournamentSelect.jsx#L18)

Actions:
- Create locale mapping helper function (e.g., in `src/utils/localeUtils.js`):
  ```javascript
  const getLocaleFromLanguage = (lang) => {
    const map = { pl: 'pl-PL', en: 'en-US', nl: 'nl-NL', de: 'de-DE', cs: 'cs-CZ' };
    return map[lang] || 'en-US';
  }
  ```
- Replace hardcoded `'pl-PL'` with `getLocaleFromLanguage(i18n.language)` in both files
- Import `useTranslation` hook if not already imported to access `i18n.language`

### 4. Update GitHub Copilot instructions

**File:** [.github/copilot-instructions.md](.github/copilot-instructions.md#L80)

- Change line 80: "4. Fallback language is English (`en`)"

### 5. Update agent-os standards

**Files:**
- [agent-os/standards/index.yml](agent-os/standards/index.yml#L11): Change description to "5-language support with English fallback"
- [agent-os/standards/i18n/language-support.md](agent-os/standards/i18n/language-support.md): Update line 3 to "English fallback", line 9 to show `en` first with "// English (fallback)" comment, line 19 to `fallbackLng: 'en'`

### 6. Update product documentation

**Files:**
- [agent-os/product/tech-stack.md](agent-os/product/tech-stack.md#L31): Change to "Supports 5 languages: English (default), Polish, German, Dutch, Czech"
- [README.md](README.md#L48): Reorder language list to show English first with 🇬🇧 flag, maintain all 5 languages

### 7. Verify translation file completeness

**Location:** [src/i18n/](src/i18n/)

- Confirm all 5 JSON files have identical key structures per file-sync standard
- If discrepancies found, synchronize key structures across all language files
- Ensure no missing translations that would cause fallback issues

## Verification

1. Run `npm run dev` and open application in browser
2. Check that English loads by default on first visit (clear localStorage or use incognito)
3. Test language switching via LanguageSelector - verify all 5 languages work
4. Check date formatting in Organizer and TournamentSelect pages displays correctly for all languages
5. Verify browser console shows no i18next warnings about missing translations
6. Test with `i18nextLng` localStorage key cleared to confirm EN displays as default
7. Run `npm run lint` to ensure no code quality issues introduced

## Decisions

- **English as default:** Most international, increases accessibility for global users
- **Fix missing languages now:** Addresses documented vs. configured discrepancy in same refactor
- **Dynamic date locales:** Improves UX by showing dates in user's selected language format, avoids hardcoded values
