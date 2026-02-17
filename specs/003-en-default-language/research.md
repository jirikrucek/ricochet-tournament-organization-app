# Research: Change Default Language from Polish to English

**Feature**: 003-en-default-language  
**Date**: 2026-02-17  
**Phase**: 0 - Research & Discovery

## Purpose

Document the existing i18n implementation, translation structure, and identify exactly what needs to be translated to complete German and Czech language files.

## Current Implementation Analysis

### i18next Configuration

**File**: `src/i18n/config.js`

**Current Setup**:
```javascript
import pl from './pl.json';  // Polish - 220 lines
import en from './en.json';  // English - 220 lines  
import nl from './nl.json';  // Dutch - 220 lines
// de.json and cs.json NOT imported

i18n.init({
    resources: {
        pl: { translation: pl },
        en: { translation: en },
        nl: { translation: nl }
        // de and cs NOT in resources
    },
    fallbackLng: 'pl',  // ⚠️ Currently Polish
    // ... other config
});
```

**Required Changes**:
1. Import `de` and `cs` JSON files
2. Add de/cs to `resources` object
3. Change `fallbackLng: 'pl'` to `fallbackLng: 'en'`
4. Reorder imports (convention: put default language first)

### Translation File Structure

**Complete Files (220 lines each)**:
- ✅ `en.json` - English (reference file)
- ✅ `pl.json` - Polish (complete)
- ✅ `nl.json` - Dutch (complete)

**Incomplete Files (57 lines each)**:
- ⚠️ `de.json` - German (missing ~163 keys/~74% incomplete)
- ⚠️ `cs.json` - Czech (missing ~163 keys/~74% incomplete)

### Translation Key Structure

All translation files use nested JSON with the following top-level sections:

```javascript
{
    "navigation": {},      // Nav bar items
    "common": {},          // Shared UI elements (buttons, labels, etc.)
    "players": {},         // Players page & modal
    "matches": {},         // Matches page
    "brackets": {},        // Brackets page
    "standings": {},       // Standings page
    "live": {},           // Live view page
    "organizer": {},      // Organizer/admin page
    "login": {},          // Login page
    "allPages": {},       // Settings page
    "pages": {}           // Generic page content
}
```

**Access Pattern**: `t('section.subsection.key')` via `useTranslation()` hook

**Example**:
```javascript
const { t } = useTranslation();
return <h1>{t('players.title')}</h1>; // "Players Database"
```

### Missing Translations Analysis

**What German (de.json) Has (57 lines)**:
- navigation (complete)
- common (partial - missing some keys)
- players (partial - missing modal errors and some fields)
- pages (minimal placeholder)

**What German (de.json) Needs**:
- Complete `common` section (~10 missing keys)
- Complete `players` section (~15 missing keys)
- Complete `matches` section (~30 keys)
- Complete `brackets` section (~25 keys)
- Complete `standings` section (~20 keys)
- Complete `live` section (~30 keys)
- Complete `organizer` section (~25 keys)
- Complete `login` section (~5 keys)
- Complete `allPages` section (~8 keys)

**Czech (cs.json) Status**: Mirror of German - same keys missing

### Language Selector Component

**File**: `src/components/LanguageSelector.jsx`

**Current Implementation**:
```javascript
const LANGUAGES = [
    { code: 'pl', label: 'Polski' },
    { code: 'en', label: 'English' },
    { code: 'nl', label: 'Nederlands' }
    // de and cs NOT listed
];
```

**Required Change**:
```javascript
const LANGUAGES = [
    { code: 'en', label: 'English' },      // ✅ NEW ORDER (default first)
    { code: 'cs', label: 'Čeština' },      // ✅ NEW
    { code: 'de', label: 'Deutsch' },      // ✅ NEW
    { code: 'nl', label: 'Nederlands' },
    { code: 'pl', label: 'Polski' }
];
```

**Note**: Order convention is alphabetical by language code with English first (as default).

## Translation Completion Strategy

### Decision: Use English as Translation Reference

**Rationale**: 
- English file (`en.json`) is complete with 220 keys
- English is widely understood internationally
- Professional translation or AI-assisted translation can use English as source
- Maintains consistency across all language pairs

### Translation Sources (Options)

1. **AI-Assisted Translation** (Recommended for speed):
   - Use ChatGPT/Claude with context about tournament terminology
   - Provide full English JSON structure
   - Request German/Czech translations with sports context
   - Manual review for domain-specific terms (e.g., "Winners Bracket", "seeding")

2. **Professional Translation**:
   - Send English reference to German/Czech translators
   - Higher accuracy for domain terminology
   - More expensive and time-consuming

3. **Community Translation**:
   - Engage German/Czech speaking community members
   - Native speaker accuracy
   - Requires coordination and review time

4. **Hybrid Approach** (Best for quality):
   - AI-assisted for initial translation
   - Native speaker review for corrections
   - Focus on tournament-specific terminology

### Key Tournament Terms to Verify

These terms require domain knowledge and should be verified by native speakers:

| English Term | Context | Notes |
|--------------|---------|-------|
| Winners Bracket | Tournament structure | German: "Gewinnergruppe" or "Oberes Turnierbaum"? |
| Losers Bracket | Tournament structure | German: "Verlierergruppe" or "Unteres Turnierbaum"? |
| Grand Finals | Final match | German: "Großes Finale" or "Finale"? |
| Seeding | Player placement | German: "Setzung" or "Platzierung"? |
| Best of 3/5 | Match format | German: "Best of 3" (anglicism) or translation? |
| Standings | Rankings | German: "Tabelle" (already in partial de.json) |
| Micro-points | Point-by-point | German: "Punktverlauf" or "Einzelpunkte"? |

**Recommendation**: Preserve anglicisms for widely-understood tournament terms (e.g., "Best of 3", "seeding") unless natural translations exist.

## i18next Architecture

### How Fallback Works

**Current Behavior** (fallbackLng: 'pl'):
1. User selects German → de.json loaded
2. Key "matches.title" requested
3. NOT found in de.json
4. Falls back to pl.json (Polish)
5. User sees Polish text (bad UX for non-Polish speakers)

**Desired Behavior** (fallbackLng: 'en'):
1. User selects German → de.json loaded
2. Key "matches.title" requested
3. NOT found in de.json
4. Falls back to en.json (English)
5. User sees English text (acceptable international default)

### Language Detection Order

**Current Configuration** (no changes needed):
```javascript
detection: {
    order: ['localStorage', 'navigator'],
    caches: ['localStorage']
}
```

**How It Works**:
1. Check `localStorage.i18nextLng` (user's previous selection)
2. If not found, check browser `navigator.language`
3. If not supported, use `fallbackLng`
4. Save selection to localStorage

**Impact of Changing Fallback**:
- **Existing users** with 'pl' in localStorage: NO CHANGE (preference respected)
- **New users** without preference: Will see English (not Polish)
- **Users with unsupported language** (e.g., Spanish): Will see English (not Polish)

## Implementation Checklist

### Phase 1: Configuration Changes

- [ ] Import `de.json` and `cs.json` in `src/i18n/config.js`
- [ ] Add `de` and `cs` to resources object
- [ ] Change `fallbackLng: 'pl'` to `fallbackLng: 'en'`
- [ ] Reorder imports to place English first (convention)

### Phase 2: Translation Completion

- [ ] Generate complete German translations (220 keys)
- [ ] Generate complete Czech translations (220 keys)
- [ ] Review tournament-specific terminology
- [ ] Validate JSON structure matches English file exactly

### Phase 3: UI Update

- [ ] Update `LANGUAGES` array in `LanguageSelector.jsx`
- [ ] Add German: `{ code: 'de', label: 'Deutsch' }`
- [ ] Add Czech: `{ code: 'cs', label: 'Čeština' }`
- [ ] Reorder to: EN, CS, DE, NL, PL (alphabetical by code, EN first)

### Phase 4: Testing

- [ ] Test language switching (all 5 languages)
- [ ] Test fallback behavior (temporarily remove keys, verify English appears)
- [ ] Test with cleared localStorage (verify English default)
- [ ] Test with browser language set to unsupported language (verify English)
- [ ] Test German/Czech completeness (navigate all pages, verify no missing text)

## Risks & Mitigations

### Risk: Poor Quality Translations

**Impact**: German/Czech users see awkward or incorrect terminology  
**Likelihood**: Medium (if using AI without review)  
**Mitigation**: 
- Use AI for initial translation
- Request review from native speakers in community
- Focus quality review on tournament-specific terms

### Risk: JSON Validation Errors

**Impact**: App crashes or i18n fails to load  
**Likelihood**: Low  
**Mitigation**:
- Use JSON validator before committing
- Test app startup after changes
- ESLint can catch JSON syntax errors in build

### Risk: Missed Translation Keys

**Impact**: Some UI elements show fallback English  
**Likelihood**: Low (using structured copy from en.json)  
**Mitigation**:
- Use diff tool to compare key structures
- Systematic review of all pages during testing
- Can be addressed iteratively (English fallback is acceptable)

## Next Steps (Phase 1)

1. Generate German translations using AI-assisted approach:
   - Input: Complete `en.json` file
   - Output: Complete `de.json` with 220 keys
   - Focus: Tournament terminology accuracy

2. Generate Czech translations (same approach)

3. Create data model (data-model.md) - minimal, just translation structure

4. Create implementation guide (quickstart.md) for developers

5. Update agent context with new i18n patterns

**Estimated Effort**:
- Translation generation: 2-4 hours (with AI assistance)
- Configuration changes: 30 minutes
- Testing: 1-2 hours
- **Total**: 4-7 hours

## References

- i18next documentation: https://www.i18next.com/
- i18next-browser-languagedetector: https://github.com/i18next/i18next-browser-languageDetector
- Existing language files: `src/i18n/*.json`
- Language selector: `src/components/LanguageSelector.jsx`
- i18n configuration: `src/i18n/config.js`
