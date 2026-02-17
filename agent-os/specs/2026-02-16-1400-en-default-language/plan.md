# Plan: Expand to Full 5-Language Support with English Default

**TL;DR**: Expand the app to full 5-language support (English, Polish, Dutch, German, Czech) with English as the default language. This includes completing the incomplete German and Czech translation files (~162 missing keys each), updating i18n configuration to load all 5 languages, reordering language selector to show English first, and updating all documentation to reflect the complete international support.

**Key Decisions:**
- English becomes the fallback language for missing translations
- Complete German and Czech translations to match the 220+ keys in English
- All 5 languages fully configured and available in language selector
- Language selector shows English first, then alphabetically: Czech, German, Dutch, Polish
- All product and technical documentation reflects full 5-language support
- Existing users keep their language preference (stored in localStorage)

**Scope Change**: Originally a simple default-language change, now expanded to complete full internationalization with all 5 languages fully functional.

## Implementation Summary

### Translation Work
- **German (de.json)**: Expand from 58 to 220+ keys
- **Czech (cs.json)**: Expand from 58 to 220+ keys
- **Missing sections**: brackets, live, login, matches, organizer, profile, select, settings, standings, welcome

### Configuration Changes
- **i18n config**: Add de/cs imports, change fallbackLng to 'en', reorder resources
- **Language Selector**: Add de/cs options, reorder with en first, update fallback

### Documentation Updates
- **Copilot instructions**: Update language list and fallback reference
- **README**: Update language list with English as default
- **Tech stack**: Update language default
- **Standards**: Update language-support.md and index.yml

## Verification Steps

1. **Translation completeness**: All 5 files should have ~220 lines
2. **Functional testing**: Language selector, default language, switching, persistence
3. **Build & lint**: Verify production build and code quality
4. **Documentation review**: Search for remaining Polish default references
