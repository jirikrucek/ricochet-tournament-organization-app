# Standards for Full 5-Language Support

The following standards apply to this work:

## Referenced Standards

### @agent-os/standards/i18n/language-support.md
Will be updated to reflect:
- English as fallback language (instead of Polish)
- All 5 languages fully supported
- Resource ordering with English first

### @agent-os/standards/i18n/key-structure.md
Critical for translation work:
- Nested JSON structure for translation keys
- Consistent naming conventions
- Hierarchical organization

### @agent-os/standards/i18n/usage-pattern.md
Applies to component usage:
- useTranslation hook patterns
- Translation key access patterns
- Language switching implementation

### @agent-os/standards/i18n/file-sync.md
**Most Critical for this work**:
- All 5 files must have identical key structures
- No missing keys in any language file
- Structural consistency across all translations
- Key ordering should match across files

## Implementation Notes

1. **Translation Quality**: Prioritize accurate, contextually appropriate translations for tournament/sports terminology
2. **Key Structure**: Maintain exact key structure across all 5 files
3. **Validation**: Use i18next warnings in DevTools to catch missing keys
4. **Testing**: Verify language switching works correctly for all 5 languages
5. **Documentation**: Update all references to reflect English default
