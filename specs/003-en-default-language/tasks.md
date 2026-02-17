# Tasks: Change Default Language from Polish to English

**Input**: Design documents from `/specs/003-en-default-language/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, quickstart.md ✅

**Tests**: No automated tests requested in specification - manual testing approach used

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Task Summary

- **Total Tasks**: 24
- **Parallelizable**: 14 tasks marked [P]
- **User Stories**: 4 (US1-P1, US2-P2, US3-P2, US4-P3)
- **Estimated Duration**: 4-7 hours total
- **Files Modified**: 4 files (config.js, de.json, cs.json, LanguageSelector.jsx)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Backup existing files before modifications

- [X] T001 Backup existing German translation file from src/i18n/de.json to src/i18n/de.json.backup
- [X] T002 Backup existing Czech translation file from src/i18n/cs.json to src/i18n/cs.json.backup

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ NO BLOCKING TASKS**: All user stories can be implemented independently. The configuration changes (US1) and translation completion (US3) have no dependencies on each other.

**Checkpoint**: Setup complete - all user story implementation can begin in parallel

---

## Phase 3: User Story 1 - International User Experience (Priority: P1) 🎯 MVP

**Goal**: Change the i18n fallback language from Polish to English so international users see English by default instead of Polish when visiting the app for the first time.

**Independent Test**: Set browser language to unsupported language (e.g., Spanish), clear localStorage, and verify app displays in English on first load.

### Implementation for User Story 1

- [X] T003 [P] [US1] Change fallbackLng from 'pl' to 'en' in src/i18n/config.js (line ~18)
- [X] T004 [P] [US1] Reorder import statements to place English first (convention) in src/i18n/config.js (lines 5-7)

**Test Criteria for US1**:
- Browser with unsupported language (e.g., Spanish) shows English interface
- New user without localStorage preference sees English
- Fallback language detection resolves to 'en' not 'pl'

**Checkpoint**: At this point, User Story 1 should be fully functional - international users will see English as the default language.

---

## Phase 4: User Story 3 - Complete Language Support (Priority: P2)

**Goal**: Complete German and Czech translation files (from 57 to 220 keys each) and make all 5 languages available in the language selector, ensuring German and Czech users see complete translations without any English fallback.

**Independent Test**: Select German or Czech language, navigate all app pages, and verify all text appears in selected language with no English fallback visible.

### Translation Completion for User Story 3

- [X] T005 [US3] Generate complete German translations using AI (add ~163 missing keys to src/i18n/de.json)
- [X] T006 [US3] Generate complete Czech translations using AI (add ~163 missing keys to src/i18n/cs.json)
- [X] T007 [P] [US3] Validate German JSON structure and syntax in src/i18n/de.json
- [X] T008 [P] [US3] Validate Czech JSON structure and syntax in src/i18n/cs.json
- [X] T009 [P] [US3] Verify German file has exactly 220 lines matching en.json structure
- [X] T010 [P] [US3] Verify Czech file has exactly 220 lines matching en.json structure

### Configuration Updates for User Story 3

- [X] T011 [P] [US3] Add import statement for German (de.json) in src/i18n/config.js
- [X] T012 [P] [US3] Add import statement for Czech (cs.json) in src/i18n/config.js  
- [X] T013 [P] [US3] Add German to resources object in src/i18n/config.js
- [X] T014 [P] [US3] Add Czech to resources object in src/i18n/config.js
- [X] T015 [P] [US3] Reorder resources object (en, cs, de, nl, pl) in src/i18n/config.js

### UI Updates for User Story 3

- [X] T016 [P] [US3] Add German language option to LANGUAGES array in src/components/LanguageSelector.jsx
- [X] T017 [P] [US3] Add Czech language option to LANGUAGES array in src/components/LanguageSelector.jsx
- [X] T018 [P] [US3] Reorder LANGUAGES array (EN first, then alphabetical) in src/components/LanguageSelector.jsx

**Test Criteria for US3**:
- Language selector dropdown shows all 5 languages (EN, CS, DE, NL, PL)
- Selecting German shows complete German interface (no English fallback)
- Selecting Czech shows complete Czech interface (no English fallback)
- All 220 translation keys display properly in German and Czech
- Language preference persists in localStorage after selection

**Checkpoint**: At this point, User Stories 1 AND 3 should both work - international users see English, and all 5 languages are fully available with complete translations.

---

## Phase 5: User Story 2 - Translation Fallback Consistency (Priority: P2)

**Goal**: Verify that the fallback mechanism correctly displays English (not Polish) when translation keys are missing in any selected language.

**Independent Test**: Temporarily remove a translation key from any language file, select that language, and verify English text appears (not Polish).

### Verification for User Story 2

- [X] T019 [US2] Test fallback behavior by temporarily removing a key from German file and verifying English appears
- [X] T020 [US2] Test fallback behavior by temporarily removing a key from Czech file and verifying English appears
- [X] T021 [US2] Verify no Polish text appears anywhere when fallback is triggered in any language

**Test Criteria for US2**:
- Missing key in German → English text shown (not Polish)
- Missing key in Czech → English text shown (not Polish)
- Missing key in Dutch → English text shown (not Polish)
- Missing key in Polish → English text shown
- Fallback always goes to 'en', never to 'pl'

**Checkpoint**: All user stories 1, 2, and 3 are now verified and functional.

---

## Phase 6: User Story 4 - Translation Fallback for Future Development (Priority: P3)

**Goal**: Document the fallback mechanism for future developers so they understand that incomplete translations will fall back to English.

**Independent Test**: Review documentation and verify it clearly explains the English fallback behavior for future feature development.

### Documentation for User Story 4

- [X] T022 [US4] Document fallback behavior in quickstart.md for future developers adding new features
- [X] T023 [US4] Add inline code comment in src/i18n/config.js explaining fallbackLng behavior

**Test Criteria for US4**:
- Documentation explains that new features with partial translations fall back to English
- Code comments clearly indicate fallback language configuration
- Future developers understand to add translations to all 5 files OR accept English fallback

**Checkpoint**: All 4 user stories are complete and documented.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final quality checks and comprehensive testing across all languages

### Code Quality

- [X] T024 Run ESLint to verify no syntax or style errors in modified files
- [X] T025 Run build command (npm run build) and verify successful compilation

### Comprehensive Testing

- [ ] T026 Test language switching between all 5 languages (EN, CS, DE, NL, PL) - verify instant switching
- [ ] T027 Test complete German translations: navigate all pages (Live, Matches, Brackets, Standings, Players, Organizer)
- [ ] T028 Test complete Czech translations: navigate all pages (Live, Matches, Brackets, Standings, Players, Organizer)
- [ ] T029 Test language persistence: select language, close browser, reopen, verify language persists
- [ ] T030 Test new user default: clear localStorage, open app, verify English is shown
- [ ] T031 Test existing Polish user: verify users with 'pl' in localStorage still see Polish (backward compatibility)
- [ ] T032 Test player modal in German: verify all form fields, labels, and validation messages appear in German
- [ ] T033 Test player modal in Czech: verify all form fields, labels, and validation messages appear in Czech

### Edge Case Testing  

- [ ] T034 Test browser language detection: set browser to 'de' → verify German loads
- [ ] T035 Test browser language detection: set browser to unsupported language → verify English loads
- [ ] T036 Test localStorage override: set localStorage to 'cs', browser to 'de' → verify Czech loads (localStorage wins)

**Final Checkpoint**: All testing complete - feature ready for pull request

---

## Dependencies & Parallel Execution

### Dependency Graph

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational - none)
    ↓
Phase 3 (US1) + Phase 4 (US3) ← CAN RUN IN PARALLEL
    ↓
Phase 5 (US2) ← DEPENDS ON US1 + US3
    ↓
Phase 6 (US4) ← CAN START ANYTIME (documentation)
    ↓
Phase 7 (Polish) ← DEPENDS ON ALL PHASES
```

### Parallel Execution Examples

**Batch 1** (can run simultaneously):
- T003, T004 (US1 config changes)
- T005, T006 (US3 translation generation)

**Batch 2** (after translations generated):
- T007, T008, T009, T010 (validation)
- T011, T012, T013, T014, T015 (config imports)
- T016, T017, T018 (UI updates)

**Batch 3** (testing):
- T019, T020, T021 (fallback testing)
- T022, T023 (documentation)

### MVP Scope Recommendation

**Minimum Viable Product** = User Story 1 only (T001-T004)
- Duration: 30 minutes
- Delivers: English default for international users
- German/Czech remain incomplete (acceptable, English fallback works)

**Full Feature** = All User Stories (T001-T036)
- Duration: 4-7 hours
- Delivers: Complete 5-language support with English default

---

## Implementation Strategy

### Recommended Order

1. **Start with US1** (T001-T004) - Quick win, immediate value ✅
2. **Then US3 translations** (T005-T010) - Most time-consuming, can use AI ⏰
3. **Then US3 config/UI** (T011-T018) - Quick once translations ready ⚡
4. **Then US2 testing** (T019-T021) - Verify fallback works ✓
5. **Then US4 docs** (T022-T023) - Document for future 📝
6. **Finally Polish** (T024-T036) - Comprehensive quality checks 🎯

### Time Estimates

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| Setup (Phase 1) | T001-T002 | 5 minutes |
| US1 (Phase 3) | T003-T004 | 15 minutes |
| US3 Translation (Phase 4) | T005-T010 | 3-4 hours |
| US3 Config/UI (Phase 4) | T011-T018 | 30 minutes |
| US2 Testing (Phase 5) | T019-T021 | 30 minutes |
| US4 Docs (Phase 6) | T022-T023 | 15 minutes |
| Polish (Phase 7) | T024-T036 | 1-2 hours |
| **TOTAL** | **36 tasks** | **4-7 hours** |

---

## Verification Checklist

Before marking feature as complete:

- [ ] All 5 language files have exactly 220 keys each
- [ ] fallbackLng is set to 'en' in src/i18n/config.js
- [ ] All 5 languages imported and registered in config.js
- [ ] Language selector shows all 5 languages (EN, CS, DE, NL, PL)
- [ ] German translations complete and tested (all pages)
- [ ] Czech translations complete and tested (all pages)
- [ ] Fallback always shows English (never Polish) when keys missing
- [ ] ESLint passes with no errors
- [ ] npm run build succeeds
- [ ] Language switching works instantly (<1 second)
- [ ] Language preference persists across browser sessions
- [ ] New users see English by default
- [ ] Existing Polish users still see Polish (backward compatibility)

---

## References

- Feature specification: [spec.md](spec.md)
- Implementation plan: [plan.md](plan.md)  
- Research: [research.md](research.md)
- Data model: [data-model.md](data-model.md)
- Quickstart guide: [quickstart.md](quickstart.md)
- Project constitution: [.specify/memory/constitution.md](../../.specify/memory/constitution.md)

---

**Generated by**: `/speckit.tasks` command  
**Date**: 2026-02-17  
**Branch**: `003-en-default-language`  
**Status**: Ready for implementation
