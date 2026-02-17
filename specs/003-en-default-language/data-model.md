# Data Model: Change Default Language from Polish to English

**Feature**: 003-en-default-language  
**Date**: 2026-02-17  
**Phase**: 1 - Design

## Overview

This feature has minimal data modeling requirements as it deals with static translation content and configuration, not dynamic application data. This document describes the structure of translation resources and language preferences.

## Entities

### Language Resource

**Type**: Static JSON file  
**Location**: `src/i18n/{languageCode}.json`  
**Purpose**: Contains all UI text translations for a specific language

**Structure**:
```typescript
interface TranslationResource {
  navigation: NavigationTranslations;
  common: CommonTranslations;
  players: PlayersTranslations;
  matches: MatchesTranslations;
  brackets: BracketsTranslations;
  standings: StandingsTranslations;
  live: LiveTranslations;
  organizer: OrganizerTranslations;
  login: LoginTranslations;
  allPages: AllPagesTranslations;
  pages: PagesTranslations;
}
```

**Attributes**:
- **Language Code**: Two-letter ISO 639-1 code (en, pl, de, nl, cs)
- **Translation Keys**: Nested object structure with dot-notation access
- **Key Count**: 220 translation keys (complete) across all sections
- **Format**: JSON with nested objects

**Relationships**:
- N/A (static files, no database relationships)

**Validation Rules**:
1. Must be valid JSON
2. Must contain all top-level sections (navigation, common, etc.)
3. Key structure should match reference file (en.json)
4. Values must be strings (no nested objects at leaf nodes)
5. Interpolation variables use {{variableName}} format

**State Transitions**: N/A (static content)

### Language Preference

**Type**: localStorage entry  
**Location**: `localStorage.i18nextLng`  
**Purpose**: Persists user's language selection across browser sessions

**Structure**:
```typescript
interface LanguagePreference {
  key: 'i18nextLng';
  value: LanguageCode; // 'en' | 'pl' | 'de' | 'nl' | 'cs'
}
```

**Attributes**:
- **Key**: `i18nextLng` (fixed, managed by i18next library)
- **Value**: Two-letter language code
- **Storage**: Browser localStorage
- **Persistence**: Permanent until user clears browser data

**Relationships**:
- References TranslationResource by language code
- Overrides browser language detection
- Overrides fallback language setting

**Validation Rules**:
1. Value must be one of supported language codes
2. If invalid, i18next falls back to browser language or fallbackLng

**State Transitions**:
```
[Not Set] → [Language Selected] → User clicks language selector → [Preference Saved]
[Preference Saved] → [Browser Cleared] → User clears data → [Not Set]
[Preference Saved] → [New Selection] → User changes language → [Preference Updated]
```

## Translation Key Hierarchy

**Root Sections** (11 total):

1. **navigation** (~8 keys)
   - Nav bar links and labels

2. **common** (~24 keys)
   - Shared UI elements (buttons, labels, actions)
   - App branding
   - Confirmation dialogs

3. **players** (~40 keys)
   - Players page content
   - Player modal (add/edit)
   - Search and table headers
   - Validation messages

4. **matches** (~30 keys)
   - Matches list and filters
   - Match details
   - Scoring interface

5. **brackets** (~25 keys)
   - Bracket visualization
   - Round labels
   - Match progression

6. **standings** (~20 keys)
   - Rankings table
   - Statistics
   - Sorting options

7. **live** (~30 keys)
   - Live tournament view
   - Current matches
   - Real-time updates

8. **organizer** (~25 keys)
   - Tournament setup
   - Admin controls
   - Configuration options

9. **login** (~5 keys)
   - Authentication interface
   - Login prompts

10. **allPages** (~8 keys)
    - Settings page
    - Global preferences

11. **pages** (~5 keys)
    - Generic page content
    - Placeholders

**Total**: 220 keys across all sections

## i18next Configuration Schema

**File**: `src/i18n/config.js`

**Structure**:
```typescript
interface I18nConfig {
  resources: {
    [languageCode: string]: {
      translation: TranslationResource;
    };
  };
  fallbackLng: LanguageCode;
  debug: boolean;
  interpolation: {
    escapeValue: boolean;
  };
  detection: {
    order: string[];
    caches: string[];
  };
}
```

**Current State**:
```javascript
{
  resources: {
    pl: { translation: plTranslations },  // 220 keys
    en: { translation: enTranslations },  // 220 keys
    nl: { translation: nlTranslations }   // 220 keys
    // de and cs missing
  },
  fallbackLng: 'pl',  // ⚠️ Currently Polish
  // ...
}
```

**Target State**:
```javascript
{
  resources: {
    en: { translation: enTranslations },  // 220 keys (reordered first)
    cs: { translation: csTranslations },  // 220 keys (NEW - complete)
    de: { translation: deTranslations },  // 220 keys (NEW - complete)
    nl: { translation: nlTranslations },  // 220 keys
    pl: { translation: plTranslations }   // 220 keys
  },
  fallbackLng: 'en',  // ✅ Changed to English
  // ...
}
```

## Data Flow

```
User Opens App
     ↓
i18next Initialization
     ↓
Check localStorage.i18nextLng
     ↓
   Has Value? ─ No → Check navigator.language
     ↓ Yes              ↓
Load Saved        Supported? ─ No → Use fallbackLng ('en')
Language               ↓ Yes
     ↓            Load Browser Language
     ↓                   ↓
     └──────────────────┘
              ↓
    Load Language Resource
         (de.json, en.json, etc.)
              ↓
    Render UI with Translations
              ↓
    t('section.key') → Translated Text
              ↓
  Key Missing? ─ No → Display Translation
     ↓ Yes
Fall back to English (fallbackLng)
     ↓
Display English Text
```

## File Dependencies

```
src/i18n/config.js
    ↓ imports
    ├── en.json (reference - complete)
    ├── cs.json (needs completion)
    ├── de.json (needs completion)
    ├── nl.json (reference - complete)
    └── pl.json (reference - complete)
         ↓
    Used by React Components
         ↓
    useTranslation() hook
         ↓
    t('key') function
         ↓
    Rendered in UI
```

## Constraints

1. **File Size**: Each language file should be <50KB (currently ~10KB each)
2. **Key Consistency**: All language files must have identical key structures
3. **JSON Validity**: Files must be valid JSON (no trailing commas, proper escaping)
4. **Character Encoding**: UTF-8 encoding required for special characters (ä, ö, ü, č, etc.)
5. **Interpolation Format**: Variables must use {{variableName}} syntax
6. **No HTML**: Translation values should not contain HTML (React components handle markup)

## Migration Notes

**No Data Migration Required**:
- Existing user preferences (`localStorage.i18nextLng`) remain unchanged
- Users who selected 'pl' will continue seeing Polish
- Only new users or users without preferences see the new English default
- No database changes required (client-side only)

## Testing Considerations

**Data Validation**:
- [x] All language files are valid JSON
- [ ] German file has 220 keys (currently 57)
- [ ] Czech file has 220 keys (currently 57)
- [ ] Key structures match across all 5 files
- [ ] All interpolation variables are properly formatted

**State Testing**:
- [ ] New user (no localStorage) → sees English
- [ ] User with 'pl' preference → still sees Polish (backward compatibility)
- [ ] User changes language → localStorage updates
- [ ] User clears browser data → reverts to English default

## References

- Translation files: `src/i18n/*.json`
- Configuration: `src/i18n/config.js`
- i18next documentation: https://www.i18next.com/
- Language code standard: ISO 639-1
