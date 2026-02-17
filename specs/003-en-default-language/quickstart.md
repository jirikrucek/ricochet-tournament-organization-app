# Quickstart Guide: Change Default Language from Polish to English

**Feature**: 003-en-default-language  
**Date**: 2026-02-17  
**Estimated Time**: 4-7 hours

## Overview

This guide provides step-by-step instructions for implementing the English default language feature. The changes are isolated to i18n configuration and translation files—no complex architecture modifications required.

## Prerequisites

- Node.js and npm installed
- Repository cloned and dependencies installed (`npm install`)
- Familiarity with JSON and i18next concepts
- (Optional) Access to AI translation tools for completing German/Czech translations

## Implementation Steps

### Step 1: Complete German Translations (2-3 hours)

**Goal**: Expand `de.json` from 57 keys to 220 keys to match English file

#### 1.1 Create German Translation Base

```bash
# Open both files for reference
code src/i18n/en.json src/i18n/de.json
```

#### 1.2 Use AI-Assisted Translation (Recommended)

**Prompt for ChatGPT/Claude**:
~~~
I need to translate a tournament application from English to German. 
Context: This is a Ricochet (table tennis variant) tournament management app.

Please translate the following JSON keys from English to German, preserving:
1. JSON structure exactly as shown
2. Interpolation variables ({{variable}})
3. Tournament-specific terminology accuracy

English JSON to translate:
[PASTE COMPLETE en.json HERE]

Key terminology:
- "Winners Bracket" → "Gewinnergruppe" or "Oberes Turnierbaum"
- "Losers Bracket" → "Verlierergruppe" or "Unteres Turnierbaum"  
- "Best of 3/5" → Keep as "Best of 3/5" (anglicism is acceptable)
- "Grand Finals" → "Großes Finale"
- "Seeding" → "Setzung"

Output: Complete German JSON file with same structure.
~~~

#### 1.3 Merge AI Output with Existing German File

```bash
# Backup current German file
cp src/i18n/de.json src/i18n/de.json.backup

# Open AI-generated translation and merge with existing partial translations
# Keep the better translation for keys that exist in both
```

#### 1.4 Validate German JSON

```bash
# Validate JSON syntax
node -e "console.log(JSON.parse(require('fs').readFileSync('src/i18n/de.json', 'utf8')))"

# Check key count (should be 220 lines)
wc -l src/i18n/de.json
```

### Step 2: Complete Czech Translations (2-3 hours)

**Goal**: Expand `cs.json` from 57 keys to 220 keys

#### 2.1 Create Czech Translation Base

Use the same AI-assisted approach as German:

**Prompt Modification**:
~~~
...translate from English to Czech...

Key terminology:
- "Winners Bracket" → "Vítězná skupina" or "Horní turnajový strom"
- "Losers Bracket" → "Poražených skupina" or "Dolní turnajový strom"
- "Best of 3/5" → Keep as "Best of 3/5" (anglicism acceptable)
- "Grand Finals" → "Velké finále"
- "Seeding" → "Nasazení"
~~~

#### 2.2 Validate Czech JSON

```bash
# Backup current Czech file
cp src/i18n/cs.json src/i18n/cs.json.backup

# Validate JSON syntax
node -e "console.log(JSON.parse(require('fs').readFileSync('src/i18n/cs.json', 'utf8')))"

# Check key count (should be 220 lines)
wc -l src/i18n/cs.json
```

### Step 3: Update i18n Configuration (15 minutes)

**Goal**: Import German/Czech files, change fallback language, reorder imports

#### 3.1 Modify `src/i18n/config.js`

**Current Code**:
```javascript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import pl from './pl.json';
import en from './en.json';
import nl from './nl.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            pl: { translation: pl },
            en: { translation: en },
            nl: { translation: nl }
        },
        fallbackLng: 'pl',
        debug: false,
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        }
    });

export default i18n;
```

**New Code** (apply these changes):

```javascript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Reordered: default language (en) first, then alphabetical by code
import en from './en.json';
import cs from './cs.json';  // ✅ NEW
import de from './de.json';  // ✅ NEW
import nl from './nl.json';
import pl from './pl.json';

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },  // ✅ MOVED FIRST
            cs: { translation: cs },  // ✅ NEW
            de: { translation: de },  // ✅ NEW
            nl: { translation: nl },
            pl: { translation: pl }
        },
        fallbackLng: 'en',  // ✅ CHANGED from 'pl'
        debug: false,
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        }
    });

export default i18n;
```

**Changes Summary**:
1. Added `import cs from './cs.json';`
2. Added `import de from './de.json';`
3. Reordered imports: en first, then alphabetical
4. Added `cs: { translation: cs }` to resources
5. Added `de: { translation: de }` to resources
6. Changed `fallbackLng: 'pl'` to `fallbackLng: 'en'`

### Step 4: Update Language Selector (10 minutes)

**Goal**: Add German and Czech to language dropdown, reorder languages

#### 4.1 Modify `src/components/LanguageSelector.jsx`

**Find this section** (line ~6):
```javascript
const LANGUAGES = [
    { code: 'pl', label: 'Polski' },
    { code: 'en', label: 'English' },
    { code: 'nl', label: 'Nederlands' }
];
```

**Replace with**:
```javascript
const LANGUAGES = [
    { code: 'en', label: 'English' },      // ✅ MOVED FIRST (default)
    { code: 'cs', label: 'Čeština' },      // ✅ NEW
    { code: 'de', label: 'Deutsch' },      // ✅ NEW
    { code: 'nl', label: 'Nederlands' },
    { code: 'pl', label: 'Polski' }
];
```

**Changes Summary**:
1. Added `{ code: 'cs', label: 'Čeština' }`
2. Added `{ code: 'de', label: 'Deutsch' }`
3. Reordered: English first (as default), then alphabetical by code

### Step 5: Verify Changes (30 minutes)

#### 5.1 Check ESLint

```bash
npm run lint
```

**Expected**: No errors (changes are JSON and simple config)

#### 5.2 Build Application

```bash
npm run build
```

**Expected**: Successful build with no errors

#### 5.3 Start Development Server

```bash
npm run dev
```

**Expected**: Application starts without errors

### Step 6: Testing (1-2 hours)

#### 6.1 Language Selector Test

1. Open application in browser
2. Click language selector (globe icon)
3. **Verify**: All 5 languages appear (EN, CS, DE, NL, PL)
4. Select each language
5. **Verify**: Interface updates within 1 second

#### 6.2 Translation Completeness Test

**For German**:
1. Select German from language selector
2. Navigate to each page: Live, Matches, Brackets, Standings, Players, Organizer
3. **Verify**: All text appears in German (no English fallback visible)
4. Open player modal (Add Player button)
5. **Verify**: All modal text is in German
6. Test form validation
7. **Verify**: Error messages are in German

**For Czech**:
1. Repeat same steps as German
2. **Verify**: All text appears in Czech

**For Other Languages** (EN, NL, PL):
1. Quick smoke test to ensure nothing broke
2. **Verify**: All languages still work correctly

#### 6.3 Fallback Behavior Test

**Test 1: New User (English Default)**:
```bash
# Open browser DevTools → Application → Storage → Local Storage
# Delete the 'i18nextLng' key
# Refresh page
```
**Expected**: App displays in English

**Test 2: Unsupported Language**:
```bash
# In DevTools Console:
localStorage.setItem('i18nextLng', 'es');  // Spanish (unsupported)
# Refresh page
```
**Expected**: App displays in English (fallback)

**Test 3: Missing Translation Key**:
```javascript
// Temporarily remove a key from de.json
// Select German language
// Navigate to page that uses that key
```
**Expected**: English text appears (not Polish)

**Cleanup**: Restore removed key after test

#### 6.4 Persistence Test

1. Select Polish language
2. Close browser completely
3. Reopen browser and navigate to app
4. **Verify**: Language is still Polish (preference persisted)

### Step 7: Commit Changes

```bash
# Stage changes
git add src/i18n/config.js
git add src/i18n/de.json
git add src/i18n/cs.json
git add src/components/LanguageSelector.jsx

# Check diff
git diff --cached

# Commit with descriptive message
git commit -m "feat: change default language to English and complete DE/CS translations

- Set fallbackLng to 'en' (was 'pl')
- Import and register German (de) and Czech (cs) languages
- Complete German translations (57 → 220 keys)
- Complete Czech translations (57 → 220 keys)
- Update LanguageSelector to show all 5 languages
- Reorder languages: EN first (default), then alphabetical

Closes #003"

# Push to feature branch
git push origin 003-en-default-language
```

## Troubleshooting

### Issue: JSON Syntax Error

**Symptom**: App crashes on startup with parsing error

**Solution**:
```bash
# Validate JSON files
node -e "require('./src/i18n/de.json')"
node -e "require('./src/i18n/cs.json')"

# Common issues:
# - Trailing commas in last object property
# - Unescaped quotes in translation strings
# - Missing closing brackets
```

### Issue: Language Not Appearing in Selector

**Symptom**: German or Czech not visible in dropdown

**Solution**:
1. Check `LanguageSelector.jsx` has correct `code` values
2. Verify language codes match between `config.js` and `LanguageSelector.jsx`
3. Check browser console for errors

### Issue: Incomplete Translations Showing English

**Symptom**: Some text appears in English when German/Czech selected

**Solution**:
1. This is expected behavior (English fallback)
2. Identify which keys are missing
3. Add missing keys to German/Czech JSON files
4. Verify key names match exactly (case-sensitive)

### Issue: Translation Variables Not Interpolating

**Symptom**: Text shows "{{count}}" instead of actual value

**Solution**:
1. Verify variable syntax: `{{variableName}}` (double curly braces)
2. Check no extra spaces: `{{ count }}` → `{{count}}`
3. Ensure interpolation is enabled: `interpolation: { escapeValue: false }`

## Verification Checklist

Before creating pull request:

- [ ] All 5 language files have 220 keys (use: `wc -l src/i18n/*.json`)
- [ ] German translations are accurate and complete
- [ ] Czech translations are accurate and complete
- [ ] `config.js` has `fallbackLng: 'en'`
- [ ] `config.js` imports all 5 languages  
- [ ] `LanguageSelector.jsx` shows all 5 languages
- [ ] ESLint passes: `npm run lint`
- [ ] Build succeeds: `npm run build`
- [ ] All 5 languages tested manually
- [ ] Fallback behavior works correctly
- [ ] Language preference persists
- [ ] No Polish text appears when English fallback triggered
- [ ] Committed with descriptive message

## Time Estimates

| Task | Estimated Time |
|------|----------------|
| German translation completion | 2-3 hours |
| Czech translation completion | 2-3 hours |
| Configuration changes | 15 minutes |
| Language selector update | 10 minutes |
| Build and verification | 30 minutes |
| Manual testing | 1-2 hours |
| **Total** | **4-7 hours** |

*Note: Time can be reduced with AI-assisted translation and review by native speakers*

## Next Steps

After merging this feature:

1. **Community Review**: Share with German/Czech speaking community for translation feedback
2. **A/B Testing**: Monitor which languages are most used
3. **Analytics**: Track language switching patterns
4. **Future i18n**: Add more languages if needed (same process)

## For Future Development: Adding New Features

**⚠️ Important for Developers**: This application uses English as the fallback language for all missing translations.

### What This Means for New Features

When you add a new feature that introduces new UI text:

1. **English is Required**: Always add English translations first to `src/i18n/en.json`
2. **Other Languages are Optional**: You can add translations to other languages (de, cs, nl, pl) later
3. **Automatic Fallback**: Any missing translation keys will automatically show English text
4. **No Polish Fallback**: The app will NEVER fall back to Polish—only English

### Best Practice Workflow

```bash
# 1. Add new feature with English translations only
# src/i18n/en.json
{
  "newFeature": {
    "title": "My New Feature",
    "description": "This is a description"
  }
}

# 2. Test the feature in all languages
# Users in non-English languages will see English text for new keys (acceptable)

# 3. Later, add translations for other languages
# Get native speakers to review translations for accuracy
# Update de.json, cs.json, nl.json, pl.json with translations

# 4. Verify complete translations
npm run build  # Should succeed with or without complete translations
```

### Translation Priority

- **High Priority**: English (en) - ALWAYS required
- **Medium Priority**: German (de), Czech (cs) - Complete translations preferred
- **Low Priority**: Dutch (nl), Polish (pl) - English fallback acceptable

### Fallback Configuration

The fallback is configured in [src/i18n/config.js](../../../src/i18n/config.js):

```javascript
fallbackLng: 'en',  // All missing keys fall back to English
```

**DO NOT** change this to another language unless explicitly discussed with the team.

## References

- Feature specification: [spec.md](spec.md)
- Research: [research.md](research.md)
- Data model: [data-model.md](data-model.md)
- i18next docs: https://www.i18next.com/
- React i18next: https://react.i18next.com/
