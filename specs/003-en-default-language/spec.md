# Feature Specification: Change Default Language from Polish to English

**Feature Branch**: `003-en-default-language`  
**Created**: 2026-02-17  
**Status**: Draft  
**Input**: User description: "Refactor the code to use EN as default language instead of PL"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - International User Experience (Priority: P1)

An international user visits the tournament app for the first time with their browser set to a language not supported by the app (e.g., Spanish, French, Japanese). They should immediately see the interface in English rather than Polish, as English is the international standard language for sports applications.

**Why this priority**: This is the core value proposition of the feature. English is the de facto international language, and defaulting to Polish creates a barrier for non-Polish speakers. This affects the majority of potential international users.

**Independent Test**: Can be fully tested by setting browser language to an unsupported language (e.g., Spanish), clearing localStorage, and verifying that the app loads with English text. Delivers immediate value by making the app accessible to international users.

**Acceptance Scenarios**:

1. **Given** a user with browser language set to Spanish (not supported), **When** they visit the app for the first time, **Then** all UI text displays in English
2. **Given** a user with browser language set to French (not supported), **When** they navigate through all pages, **Then** all navigation, buttons, and labels are in English
3. **Given** a user with no language preference stored, **When** the app attempts language detection, **Then** it defaults to English when no supported language is detected

---

### User Story 2 - Translation Fallback Consistency (Priority: P2)

During future development, new features may be added with translations initially only in one language. The system must ensure that if a translation key is missing in any language file, the English translation appears as fallback instead of Polish text or blank values, maintaining usability across all language options.

**Why this priority**: Establishes English as the fallback language for all future development. This ensures consistency during development cycles when new features are added, preventing Polish text from appearing as fallback for non-Polish users.

**Independent Test**: Can be tested by temporarily removing translation keys from any language file and verifying that English text appears instead of Polish. Delivers value by ensuring the fallback mechanism works correctly for future development.

**Acceptance Scenarios**:

1. **Given** a user has selected any non-English language, **When** a translation key is missing in that language file, **Then** the corresponding English text from en.json is displayed
2. **Given** a user has selected any language, **When** a new feature is added with incomplete translations, **Then** missing translations show English text
3. **Given** any language is selected, **When** the fallback mechanism is triggered, **Then** no Polish text appears anywhere in the interface

---

### User Story 3 - Complete Language Support (Priority: P2)

Tournament organizers and administrators need access to all 5 supported languages (English, Polish, German, Dutch, Czech) through the language selector with complete translations, ensuring all language communities can participate effectively without any missing or fallback text.

**Why this priority**: Essential for true internationalization. Currently German and Czech have incomplete translations (57 keys vs. 220 keys in other languages). Users selecting these languages would see mixed language interfaces with English fallback text, creating a poor user experience.

**Independent Test**: Can be tested by selecting each language from the language selector, navigating all pages, and verifying no fallback text appears. Delivers value by making the app fully accessible to German and Czech-speaking communities.

**Acceptance Scenarios**:

1. **Given** a user opens the language selector, **When** they view available languages, **Then** all 5 languages (EN, PL, DE, NL, CS) are listed
2. **Given** a user selects German, **When** they navigate all pages in the app, **Then** all UI text appears in German with no English fallback text
3. **Given** a user selects Czech, **When** they navigate all pages in the app, **Then** all UI text appears in Czech with no English fallback text
4. **Given** a user switches between any two languages, **When** the change occurs, **Then** the preference is persisted in localStorage
5. **Given** a user selects German or Czech, **When** they use all features, **Then** all 220 translation keys display properly translated text

---

### User Story 4 - Translation Fallback for Future Development (Priority: P3)

During future development, new features may be added with translations initially only in one language. The system must ensure that if a translation key is missing in any language file, the English translation appears as fallback instead of Polish text or blank values.

**Why this priority**: Establishes English as the fallback language for all future development. While current translations will be complete, this ensures consistency during development cycles when new features are added.

**Independent Test**: Can be tested by temporarily removing translation keys from any language file and verifying that English text appears instead of Polish. Delivers value by ensuring the fallback mechanism works correctly for future development.

**Acceptance Scenarios**:

1. **Given** a developer adds a new feature with only English translations, **When** a user views the feature in any other language, **Then** the English text is displayed (not Polish)
2. **Given** a translation key is removed from a language file during development, **When** that language is selected, **Then** English fallback text appears
3. **Given** the fallback language is set to 'en', **When** any language is missing a key, **Then** no Polish text ever appears

---

### Edge Cases

- What happens when a user has localStorage set to 'pl' but the default changes to 'en'? 
  - *User's stored preference should be respected; localStorage takes precedence over fallback settings*
- How does the system handle browser languages that are supported but not exactly matching (e.g., 'en-US' vs 'en')?
  - *i18next language detection should match base language codes (e.g., 'en-US' → 'en')*
- What happens if en.json is corrupted or missing?
  - *App should display translation keys as text (e.g., "live.title") rather than crashing*
- What happens to existing users who have no language preference stored?
  - *They should get English by default unless their browser language matches one of the 5 supported languages*

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST set English ('en') as the fallback language in i18next configuration
- **FR-002**: System MUST import all 5 language files (en, pl, de, nl, cs) in the i18n configuration
- **FR-003**: System MUST register all 5 languages in the i18next resources object
- **FR-004**: System MUST prioritize language detection order: localStorage → browser language → fallback to 'en'
- **FR-005**: System MUST display English text when a translation key is missing in the selected language
- **FR-006**: Language selector MUST display all 5 languages as available options
- **FR-007**: System MUST persist user's language selection in localStorage under the existing 'i18nextLng' key
- **FR-008**: System MUST handle partial language files gracefully by falling back to English for missing keys
- **FR-009**: All 5 language JSON files MUST contain complete translations with the same set of translation keys
- **FR-010**: German (de.json) and Czech (cs.json) files MUST be expanded from current 57 translation keys to match the complete set of 220 keys present in other language files

### Key Entities *(include if feature involves data)*

- **Language Resource**: Represents a translation file (en.json, pl.json, etc.) containing key-value pairs for UI text. Each resource has a language code identifier and a complete set of translation keys structured in nested objects.
- **Language Preference**: Represents the user's selected language stored in localStorage. Has a language code value and persists across browser sessions. Defaults to detected browser language or fallback language if none stored.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users with unsupported browser languages see the app in English on first load (currently they would see Polish)
- **SC-002**: All 5 languages (EN, PL, DE, NL, CS) appear in the language selector dropdown
- **SC-003**: When a translation key is missing in any language during future development, English text appears instead of Polish
- **SC-004**: Users can successfully switch between all 5 languages and see the complete interface in their selected language within 1 second
- **SC-005**: German and Czech languages display all 220 translation keys without any English fallback text appearing
- **SC-006**: The language preference persists when users close and reopen the browser
- **SC-007**: No Polish text appears when any user encounters missing translation keys (English fallback only)
- **SC-008**: International users (non-Polish speakers) can navigate the entire app in English without encountering Polish text

## Assumptions

- All 5 language JSON files (en.json, pl.json, de.json, nl.json, cs.json) exist and contain valid JSON
- German and Czech currently have incomplete translations (57 keys each vs. 220 in other files) and will be completed as part of this feature
- The i18next library supports dynamic language fallback (confirmed by documentation)
- The language selector component already exists and will automatically reflect all languages registered in i18next resources
- Browser language detection is handled by i18next-browser-languagedetector package (already installed)
- Existing users with 'pl' stored in localStorage will retain Polish - their preference is respected
- The change affects only NEW users or users without a stored language preference
- Translation content for German and Czech is available or can be obtained (e.g., from translators, AI translation with review, or community contributions)

## Scope

### In Scope

- Changing fallbackLng configuration from 'pl' to 'en' in src/i18n/config.js
- Importing German (de.json) and Czech (cs.json) language files into the i18n configuration
- Adding de and cs to i18next resources object
- Completing German and Czech translation files to match the full set of 220 translation keys
- Reordering imports to place English first (convention for default language)
- Verifying all 5 languages appear in language selector
- Testing that all languages display complete translations without fallback
- Testing fallback behavior when translation keys are missing (for future development scenarios)

### Out of Scope

- Changing existing translations in any language file
- Modifying the language selector UI component design
- Adding new languages beyond the existing 5
- Changing the language detection order (localStorage → navigator → fallback)
- Migrating existing users' language preferences
- Updating documentation to reflect the language change
- Creating automated tests for i18n fallback behavior (should be done in a future PR)

## Dependencies

- Existing i18next configuration in src/i18n/config.js
- All 5 language JSON files must exist and be accessible
- LanguageSelector component that reads available languages from i18next
- i18next-browser-languagedetector package for automatic language detection

## Risks

- **Risk**: Existing Polish users may be confused if the app defaults to English for new browser sessions
  - **Mitigation**: User preference in localStorage is respected, so only affects new users or cleared browser data

- **Risk**: The change may not be reflected immediately if i18next caches language resources
  - **Mitigation**: Test with cleared localStorage and browser cache; verify cache-busting if needed
