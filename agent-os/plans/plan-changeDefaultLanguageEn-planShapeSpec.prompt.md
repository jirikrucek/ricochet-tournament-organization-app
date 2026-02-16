# Plan: Change Default Language from PL to EN

This refactoring changes the application's default/fallback language from Polish (PL) to English (EN), enables all 5 translation languages, implements dynamic date formatting based on user language, and updates branding to be country-neutral. This aligns the codebase with international best practices while preserving existing Polish Open event branding where appropriate.

**Key Decisions:**
- EN becomes the fallback language (most widely understood)
- All 5 languages (pl, en, nl, de, cs) will be functional
- Date formatting will use `i18n.language` dynamically instead of hardcoded 'pl-PL'
- App title and demo data become generic "Ricochet Tournament" (not country-specific)
- Event-specific content (like "Polish Open 2026") remains in tournament data where it's the actual event name

---

## Task 1: Save Spec Documentation

Create `agent-os/specs/2026-02-16-1430-change-default-language-en/` with:

- **plan.md** — This full implementation plan
- **shape.md** — Shaping notes capturing scope, decisions, and context from our conversation
- **standards.md** — Relevant i18n standards from agent-os/standards/i18n/
- **references.md** — Key files studied during research phase

---

## Task 2: Update Core i18n Configuration

**File:** [src/i18n/config.js](src/i18n/config.js)

Changes:
1. **Line 7**: Add imports for missing languages:
   ```javascript
   import de from './de.json';
   import cs from './cs.json';
   ```
2. **Lines 13-19**: Expand resources object to include all 5 languages:
   ```javascript
   resources: {
       pl: { translation: pl },
       en: { translation: en },
       nl: { translation: nl },
       de: { translation: de },
       cs: { translation: cs }
   },
   ```
3. **Line 18**: Change fallback language:
   ```javascript
   fallbackLng: 'en',  // was 'pl'
   ```

---

## Task 3: Update Language Selector Component

**File:** [src/components/LanguageSelector.jsx](src/components/LanguageSelector.jsx)

Changes:
1. **Line 7**: Reorder LANGUAGES array to put English first:
   ```javascript
   const LANGUAGES = [
     { code: 'en', label: 'English' },
     { code: 'pl', label: 'Polski' },
     { code: 'de', label: 'Deutsch' },
     { code: 'nl', label: 'Nederlands' },
     { code: 'cs', label: 'Čeština' }
   ];
   ```
   Note: Add German and Czech to the array since they'll now be functional

2. **Line 51**: Update fallback from 'pl' to 'en':
   ```javascript
   const currentLang = i18n.language || 'en';
   ```

---

## Task 4: Implement Dynamic Date Formatting

**File:** [src/pages/Organizer.jsx](src/pages/Organizer.jsx)

Changes:
1. **Import i18n at top**: `import { useTranslation } from 'react-i18next';`
2. **Line 34-38**: Replace hardcoded 'pl-PL' with dynamic locale:
   ```javascript
   const { i18n } = useTranslation();
   const dateLocale = i18n.language || 'en';  // e.g., 'pl', 'en', 'de'
   
   // Update toLocaleDateString calls:
   toLocaleDateString(dateLocale, {
     year: 'numeric',
     month: '2-digit',
     day: '2-digit'
   })
   ```

**File:** [src/pages/TournamentSelect.jsx](src/pages/TournamentSelect.jsx)

Changes:
1. **Import i18n**: Add `import { useTranslation } from 'react-i18next';` at top
2. **Line 18**: Replace 'pl-PL' with dynamic locale:
   ```javascript
   const { i18n } = useTranslation();
   const dateLocale = i18n.language || 'en';
   
   // Update toLocaleDateString:
   toLocaleDateString(dateLocale, {
     year: 'numeric',
     month: '2-digit',
     day: '2-digit'
   })
   ```

---

## Task 5: Update Page Title to Generic Branding

**File:** [index.html](index.html)

Change:
- **Line 8**: Update title from country-specific to generic:
  ```html
  <title>Ricochet Tournament 2026</title>
  ```

---

## Task 6: Update Default Tournament Demo Data

**File:** [src/contexts/TournamentContext.jsx](src/contexts/TournamentContext.jsx)

Changes:
1. **Lines 40, 58**: Change default tournament name from "RICOCHET POLISH OPEN 2026" to:
   ```javascript
   name: "RICOCHET TOURNAMENT 2026"
   ```
2. **Lines 43, 61**: Change default location from "Warszawa" to generic:
   ```javascript
   location: "Tournament Venue"
   ```
   
Note: These are demo defaults. Actual tournament data (like "Polish Open 2026") should remain as entered by organizers.

---

## Task 7: Update Documentation Files

Update all documentation to reflect EN as default:

**File:** [.github/copilot-instructions.md](.github/copilot-instructions.md)
- **Line 80**: Change "Fallback language is Polish (`pl`)" to "Fallback language is English (`en`)"
- Add note about 5 functional languages

**File:** [agent-os/standards/index.yml](agent-os/standards/index.yml)
- **Line 11**: Change "5-language support with Polish fallback" to "5-language support with English fallback"

**File:** [agent-os/standards/i18n/language-support.md](agent-os/standards/i18n/language-support.md)
- **Line 9**: Update comment to show `en` as fallback instead of `pl`
- **Line 19**: Change "Polish is default" to "English is default"
- Update examples to show all 5 languages are imported and functional

**File:** [agent-os/product/tech-stack.md](agent-os/product/tech-stack.md)
- **Line 31**: Change "Supports 5 languages: Polish (default), English, German, Dutch, Czech" to "Supports 5 languages: English (default), Polish, German, Dutch, Czech"

**File:** [README.md](README.md)
- **Line 48**: Reorder language list to show 🇬🇧 English first
- **Line 53**: Keep auto-detection mention (still valid)
- Update any references to Polish as default

---

## Task 8: Verify Translation File Completeness

**All 5 translation files:** [src/i18n/](src/i18n/)

Research found German and Czech files are incomplete (58 lines vs 220+ for others). 

Action:
1. Compare [de.json](src/i18n/de.json) and [cs.json](src/i18n/cs.json) against [en.json](src/i18n/en.json) to identify missing keys
2. Two options for missing translations:
   - **Option A**: Copy EN translations as placeholders and add TODO comments
   - **Option B**: Use i18n's fallback mechanism (will fall back to EN automatically)
   
**Recommendation**: Option B - The i18next library will automatically fall back to EN for missing keys, so German/Czech users get partial translations + English fallback. Document this behavior as intentional.

Add to docs: "German and Czech translations are partially complete. Missing translations fall back to English."

---

## Verification

After implementation:

1. **Manual Testing:**
   - Clear localStorage: `localStorage.clear()`
   - Reload app → should default to English
   - Switch to each of 5 languages in LanguageSelector
   - Verify dates format correctly per language
   - Check page title shows "Ricochet Tournament 2026"

2. **Code Quality:**
   - Run `npm run lint` to ensure no issues
   - Check browser console for i18n warnings

3. **Spot Checks:**
   - Create new tournament → should show "RICOCHET TOURNAMENT 2026" as default name
   - Verify no hardcoded 'pl' references remain (grep for `'pl'` in source)

---

## Standards Applied

The following standards from agent-os/standards/i18n/ inform this work:

- **language-support.md** — Defines how fallback language is configured
- **usage-pattern.md** — Shows proper `useTranslation()` hook usage for accessing i18n.language
- **file-sync.md** — Ensures consistency across all translation files

---

## References Studied

- [src/i18n/config.js](src/i18n/config.js) — Core i18n configuration
- [src/components/LanguageSelector.jsx](src/components/LanguageSelector.jsx) — UI for language switching
- [src/contexts/TournamentContext.jsx](src/contexts/TournamentContext.jsx) — Demo data with Polish defaults
- All 5 translation files in [src/i18n/](src/i18n/) — Completeness analysis

---

**Ready for Implementation**

Once approved, Task 1 will save all spec documentation to `agent-os/specs/2026-02-16-1430-change-default-language-en/`, then implementation will proceed through Tasks 2-8.
