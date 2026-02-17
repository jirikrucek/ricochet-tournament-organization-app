# References: Full 5-Language Support Implementation

## Key Findings from Research

### Current Configuration State
- **Active languages**: Only 3 configured in runtime (pl, en, nl)
- **Inactive languages**: German (de) and Czech (cs) exist but not loaded
- **Config file**: src/i18n/config.js imports only pl, en, nl
- **Component**: LanguageSelector.jsx shows only 3 languages

### Translation File Status
```
en.json: 219 lines (complete reference)
pl.json: 221 lines (complete)
nl.json: 221 lines (complete)
de.json: 57 lines (incomplete - ~162 keys missing)
cs.json: 57 lines (incomplete - ~162 keys missing)
```

### Missing Translation Sections
German and Czech files need these complete sections:
- `brackets.*` - Bracket visualization and controls
- `live.*` - Live tournament display
- `login.*` - Authentication
- `matches.*` - Match management
- `organizer.*` - Tournament organization tools
- `profile.*` - User profiles
- `select.*` - Tournament selection
- `settings.*` - Application settings
- `standings.*` - Tournament standings
- `welcome.*` - Welcome screen

### Current Top-Level Keys by Language
**en.json** (complete):
- brackets, common, live, login, matches, navigation, organizer, pages, players, profile, select, settings, standings, welcome

**de.json & cs.json** (incomplete):
- common, navigation, pages, players
- **Missing**: brackets, live, login, matches, organizer, profile, select, settings, standings, welcome

### Language Detection Logic
Located in src/i18n/config.js:
```javascript
detection: {
    order: ['localStorage', 'navigator'],
    caches: ['localStorage'],
}
```
1. Checks localStorage first (key: 'i18nextLng')
2. Falls back to browser language preference
3. Falls back to configured fallbackLng

### Current Fallback
- **Set to**: 'pl' (Polish)
- **Will change to**: 'en' (English)

### Component Structure
LanguageSelector.jsx:
- Line 6-10: LANGUAGES array (currently 3 languages)
- Line 51: Fallback logic `i18n.language || 'pl'`
- Uses dropdown with flag emojis and language names

### Documentation Locations
Files requiring updates:
1. `.github/copilot-instructions.md` (lines 261, 264)
2. `README.md` (line 48-52)
3. `agent-os/product/tech-stack.md` (line 31)
4. `agent-os/product/roadmap.md` (if exists)
5. `agent-os/standards/i18n/language-support.md` (multiple lines)
6. `agent-os/standards/index.yml` (line 11)

### Testing Considerations
- No existing tests explicitly test language behavior
- Existing i18n tests verify basic configuration
- Manual testing will be primary validation method
- Browser DevTools console shows i18next warnings for missing keys

### Translation Approach
For high-quality German and Czech translations:
- Maintain sports/tournament terminology consistency
- Use appropriate formal/informal register for UI text
- Follow existing pattern from complete translations
- Preserve technical terms (e.g., "QR code", "Live")

### Standards Referenced
- `agent-os/standards/i18n/language-support.md` - Language configuration patterns
- `agent-os/standards/i18n/key-structure.md` - Translation key structure
- `agent-os/standards/i18n/usage-pattern.md` - Component usage patterns
- `agent-os/standards/i18n/file-sync.md` - Critical for maintaining identical structures
