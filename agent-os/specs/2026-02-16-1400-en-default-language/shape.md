# Shape: Expand to Full 5-Language Support with English Default

## Original Scope
Change default language from Polish to English - a simple configuration change.

## Expanded Scope
Complete full internationalization with all 5 languages functional:
1. Complete German translation file (add ~162 keys)
2. Complete Czech translation file (add ~162 keys)
3. Make all 5 languages available in UI
4. Reorder language list with English first
5. Update all documentation to reflect changes

## Key Decisions

### English as Default
- **Why**: International accessibility - English is more universally understood
- **Impact**: New users see English by default; existing users retain their preference
- **Implementation**: Change fallbackLng from 'pl' to 'en' in config.js

### Complete All 5 Languages
- **Why**: Rather than keeping German/Czech incomplete, finish them for full international support
- **Impact**: ~324 translations needed (~162 keys × 2 languages)
- **Implementation**: Expand de.json and cs.json to match en.json structure

### Alphabetical Ordering
- **Why**: Consistent, predictable ordering for users
- **Implementation**: English first (default), then alphabetically: Czech, German, Dutch, Polish
- **Order**: en, cs, de, nl, pl

### Update All Product Docs
- **Why**: This is a product-level change affecting all documentation
- **Impact**: Updates to README, tech-stack, standards, copilot instructions
- **Scope**: Treat as complete internationalization announcement

## Context

### Current State
- Only 3 languages configured in runtime (pl, en, nl)
- German and Czech files exist but incomplete: 58 keys vs 220+
- Missing sections: brackets, live, login, matches, organizer, profile, select, settings, standings, welcome
- German and Czech not imported in config.js
- German and Czech not shown in LanguageSelector
- Polish is current fallback language

### Language Detection Flow
1. Check localStorage for saved preference
2. Check browser language
3. Fall back to configured default

### File Sync Requirement
Critical: All 5 translation files must maintain identical key structures per agent-os/standards/i18n/file-sync.md

## Non-Goals
- No test changes needed (existing tests don't explicitly test language behavior)
- No visual design changes (internationalization work)
- No changes to language detection logic (works correctly)

## Success Criteria
- All 5 language files have ~220 keys with identical structure
- Language selector shows all 5 languages in correct order
- English is default for new users
- All documentation reflects English default and 5-language support
- Build and lint pass
- App functions correctly in all 5 languages
