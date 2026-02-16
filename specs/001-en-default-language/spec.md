# Feature Specification: English as Default Language

**Feature Branch**: `001-en-default-language`  
**Created**: 2026-02-16  
**Status**: Draft  
**Input**: User description: "Refactor the code to use EN as default language instead of PL"

## Clarifications

### Session 2026-02-16

- Q: Translation File Loading Failure Handling - What should happen if one or more language files fail to load (network error, file missing, JSON parse error)? → A: Graceful degradation - App continues with available languages, logs errors to console, shows warning to user
- Q: Language Order in Dropdown Selector - In what order should the 5 languages appear in the dropdown after English? → A: English first, then alphabetical by native name (Čeština, Deutsch, Nederlands, Polski)
- Q: Test File Update Strategy - How should tests that explicitly check for Polish as the default language be handled? → A: Update only test setup/fixtures, preserve test logic structure
- Q: Warning Display Location for Failed Translations - Where, how long, and how should the warning be displayed when language files fail to load? → A: Toast notification, 5 seconds, user-dismissible
- Q: Browser Language Detection Notification - Should users be notified when their browser language is unsupported and the app falls back to English? → A: Silent fallback, no notification
- Q: German and Czech Translation Completeness - Should German (de.json) and Czech (cs.json) translation files be completed with all missing keys to match other language files? → A: Yes, complete all translation files with all ~220 keys for consistency

## User Scenarios & Testing *(mandatory)*

### User Story 1 - First-Time User Sees English Interface (Priority: P1)

When a new user opens the application for the first time without any language preference set, they see the interface in English rather than Polish. This includes all navigation, buttons, labels, and error messages.

**Why this priority**: This is the most critical change because it establishes English as the primary language for international users. Most tournament participants globally understand English better than Polish, making the application more accessible.

**Independent Test**: Clear browser localStorage, open application in a browser with no language preference, and verify all UI text displays in English. This can be verified by checking the language selector shows English as selected and all visible text matches English translation keys.

**Acceptance Scenarios**:

1. **Given** a user opens the application for the first time with no stored language preference, **When** the application loads, **Then** all UI text displays in English
2. **Given** a user's browser has no language preference set, **When** the application initializes i18n, **Then** the fallback language is English (en)
3. **Given** a translation key is missing in the user's selected language, **When** the application attempts to display that text, **Then** it falls back to the English translation

---

### User Story 2 - Complete 5-Language Support Available (Priority: P2)

Users can select from all 5 supported languages (English, Czech, German, Dutch, Polish) via the language selector dropdown, with English appearing first as the default option. All languages have complete translations with no missing keys.

**Why this priority**: While English as default is critical, providing full multi-language support with complete translations ensures tournament accessibility for all European participants. This completes the internationalization system as documented and eliminates inconsistent fallback behavior between languages.

**Independent Test**: Open the language selector dropdown and verify all 5 languages are listed (English, Czech, German, Dutch, Polish). Select each language and verify the interface displays complete translations without fallback text. English should appear first in the list.

**Acceptance Scenarios**:

1. **Given** a user clicks the language selector, **When** the dropdown opens, **Then** all 5 languages are displayed: English, Czech (Čeština), German (Deutsch), Dutch (Nederlands), Polish (Polski)
2. **Given** a user selects Czech language, **When** the language changes, **Then** the UI displays text in Czech for all ~220 translation keys
3. **Given** a user selects German language, **When** the language changes, **Then** the UI displays text in German for all ~220 translation keys

---

### User Story 3 - Documentation Reflects Accurate Default (Priority: P3)

Developer documentation correctly states that English is the default/fallback language, ensuring future contributors implement features consistently with the i18n architecture.

**Why this priority**: Accurate documentation prevents confusion and ensures maintainability, but doesn't directly affect end users. This is a necessary housekeeping task that supports long-term project health.

**Independent Test**: Search all documentation files for references to "fallback" or "default language" and verify they state English (en) rather than Polish (pl). Run tests to verify no test fixtures hardcode Polish as expected default.

**Acceptance Scenarios**:

1. **Given** a developer reads the internationalization documentation, **When** they check the fallback language specification, **Then** it states English (en) is the fallback
2. **Given** a developer reviews the language support section, **When** they check the language order, **Then** English is listed first as the default
3. **Given** existing tests validate language behavior, **When** tests run, **Then** they expect English as the default language for new users

---

### Edge Cases

- What happens when a user has Polish stored in localStorage from a previous session? (The stored preference should be respected, only new users see English by default)
- How does the system handle missing translation keys after completing German and Czech files? (All 5 language files will have the same ~220 keys, eliminating most fallback scenarios except for file loading failures)
- What if browser language detection returns a language not in our 5 supported languages? (Falls back silently to English as the default with no notification to user)
- How does language switching affect real-time data updates and tournament state? (Language is UI-only, does not affect data persistence or tournament logic)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: i18n configuration MUST set `fallbackLng` to 'en' instead of 'pl'
- **FR-002**: i18n configuration MUST import and register all 5 language translation files (en, pl, nl, de, cs)
- **FR-003**: Language Selector component MUST display all 5 supported languages in the dropdown
- **FR-004**: Language Selector component MUST list languages in order: English first, then alphabetical by native name (Čeština, Deutsch, Nederlands, Polski)
- **FR-005**: Existing user language preferences stored in localStorage MUST be preserved and respected
- **FR-006**: When a translation key is missing in the selected language, the system MUST fall back to the English translation
- **FR-007**: Developer documentation MUST be updated to reflect English as the fallback language
- **FR-008**: All UI text MUST continue to display correctly in all 5 languages without breaking existing translations
- **FR-009**: Language detection order MUST remain: localStorage first, then browser navigator preference
- **FR-010**: The language selector MUST display native language names (English, Čeština, Deutsch, Nederlands, Polski)
- **FR-011**: If any language file fails to load, the application MUST continue with available languages, log errors to console, and display a user-dismissible toast notification for 5 seconds
- **FR-012**: When browser language detection returns an unsupported language, the application MUST silently fall back to English without displaying a notification
- **FR-013**: German (de.json) and Czech (cs.json) translation files MUST be completed with all missing translation keys to achieve parity with English, Polish, and Dutch translation files (~220 keys each)

### Key Entities

- **i18n Configuration**: The internationalization configuration object that controls language loading, fallback behavior, and detection strategy. Key attributes include fallbackLng, resources (language files), and detection order.
- **Language Resource**: Translation JSON files for each supported language (en.json, pl.json, nl.json, de.json, cs.json). Contains nested key-value pairs for all UI text.
- **Language Preference**: User's selected language stored in browser localStorage under key managed by i18next. Persists across sessions and takes precedence over browser language detection.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: New users without stored language preference see English interface on first load (100% of cases)
- **SC-002**: All 5 languages appear in the language selector dropdown and are functional when selected
- **SC-003**: Existing users with stored Polish preference continue to see Polish interface without disruption
- **SC-004**: All 5 language files (en, pl, nl, de, cs) contain the same ~220 translation keys with no missing translations
- **SC-005**: All existing tests pass by updating only test setup/fixtures and expected values (from Polish to English), while preserving test logic structure unchanged
- **SC-006**: Language switching remains instantaneous (under 100ms) with no performance degradation
- **SC-007**: Zero translation key errors or missing text warnings in browser console after changes

### Assumptions

- German (de.json) and Czech (cs.json) translation files currently have only ~58 keys and need to be completed to ~220 keys to match English/Polish/Dutch
- Translations for German and Czech can be sourced (machine translation acceptable with human review recommended)
- Browser language detection via i18next-browser-languagedetector continues to work correctly with English fallback
- No changes to localStorage key structure or i18next caching mechanism are required
- The language selector UI layout accommodates 5 languages without visual overflow or usability issues
- Translation file structure and key hierarchy remain unchanged between languages
