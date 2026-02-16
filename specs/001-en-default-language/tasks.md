# Tasks: English as Default Language

**Feature**: 001-en-default-language  
**Branch**: `001-en-default-language`  
**Input**: Design documents from `/specs/001-en-default-language/`

## Task Format: `- [ ] [ID] [P?] [Story] Description`

- **[P]**: Parallelizable (different files, no blocking dependencies)
- **[Story]**: User story label (US1, US2, US3)
- All tasks include exact file paths

---

## Phase 1: Setup

**Purpose**: Project initialization and verification

- [X] T001 Verify current i18n configuration state in src/i18n/config.js (current fallbackLng, imported languages)
- [X] T002 Create backup branch checkpoint before changes (git commit current state)
- [X] T003 [P] Count existing translation keys in each language file (en.json=~220, pl.json=~220, nl.json=~220, de.json=~58, cs.json=~58)

**Checkpoint**: Current state documented, baseline established

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core i18n configuration changes that ALL user stories depend on

**⚠️ CRITICAL**: These tasks MUST complete before user story implementation begins

- [X] T004 Update fallbackLng from 'pl' to 'en' in src/i18n/config.js
- [X] T005 [P] Import German translations: Add `import de from './de.json';` to src/i18n/config.js
- [X] T006 [P] Import Czech translations: Add `import cs from './cs.json';` to src/i18n/config.js
- [X] T007 Register German in resources object: `de: { translation: de }` in src/i18n/config.js
- [X] T008 Register Czech in resources object: `cs: { translation: cs }` in src/i18n/config.js
- [X] T009 Verify all 5 languages load correctly (run dev server, check browser console for errors)
- [X] T009a [US1] Verify language detection order: test localStorage preference → browser navigator → English fallback (FR-009)

**Checkpoint**: i18n configuration complete - all 5 languages loaded with English as fallback

---

## Phase 3: User Story 1 - First-Time User Sees English Interface (Priority: P1) 🎯 MVP

**Goal**: New users without stored language preference see the interface in English rather than Polish

**Independent Test**: Clear browser localStorage, open application, verify all UI text displays in English and language selector shows English selected

### Implementation for User Story 1

- [X] T010 [US1] Verify i18n initialization uses English fallback by testing in incognito mode
- [X] T010a [P] [US1] Implement error handling for language file loading failures with user-dismissible 5-second toast notification (FR-011)
- [X] T010b [P] [US1] Create tests for language file loading failure scenarios (graceful degradation, console logging, toast notification)
- [X] T011 [US1] Update test configuration in src/setupTests.js to use English fallback (if file exists, change fallbackLng: 'en')
- [X] T012 [US1] Update test configuration in src/test-utils.jsx to use English fallback (if file exists, change lng: 'en' and fallbackLng: 'en')
- [X] T013 [US1] Run existing test suite and identify failing tests that expect Polish defaults (npm run test, create list in tasks.md comments or separate file)
- [X] T014 [US1] Update test assertions expecting Polish text to expect English text (modify test files identified in T013)
- [X] T015 [US1] Verify all tests pass with English defaults (npm run test should show 0 failures)

**Checkpoint**: ✅ User Story 1 Complete - New users see English interface, all tests pass

---

## Phase 4: User Story 2 - Complete 5-Language Support Available (Priority: P2)

**Goal**: Users can select from all 5 supported languages with English first in the dropdown, and all languages have complete translations

**Independent Test**: Open language selector dropdown, verify all 5 languages listed in correct order, select each language and verify complete translations without fallback text

### Translation File Completion

- [X] T016 [P] [US2] Extract complete key list from src/i18n/en.json as reference using `jq 'keys' en.json` or create extraction script (~220 keys)
- [X] T017 [P] [US2] Identify missing keys in src/i18n/de.json by comparing with reference (~162 missing keys)
- [X] T018 [P] [US2] Identify missing keys in src/i18n/cs.json by comparing with reference (~162 missing keys)
- [X] T019 [P] [US2] Translate missing German keys using machine translation (DeepL or Google Translate) and add to src/i18n/de.json
- [X] T020 [P] [US2] Translate missing Czech keys using machine translation (DeepL or Google Translate) and add to src/i18n/cs.json
- [X] T020a [P] [US2] Create automated tests to verify German translation completeness (all ~220 keys present, no missing translations)
- [X] T020b [P] [US2] Create automated tests to verify Czech translation completeness (all ~220 keys present, no missing translations)
- [X] T021 [US2] Verify German translation file completeness: all 5 files have identical key structure (run comparison script or manual verification)
- [X] T022 [US2] Verify Czech translation file completeness: all 5 files have identical key structure (run comparison script or manual verification)

### Language Selector Update

- [X] T023 [US2] Update LANGUAGES array order in src/components/LanguageSelector.jsx to [en, cs, de, nl, pl]
- [X] T024 [US2] Verify language selector displays all 5 languages in correct order (English, Čeština, Deutsch, Nederlands, Polski)
- [X] T025 [US2] Test language switching for all 5 languages (select each, verify UI updates immediately)
- [X] T025a [US2] Test silent fallback for unsupported browser languages (set browser to unsupported language, verify falls back to English without notification) (FR-012)
- [X] T026 [US2] Verify no missing translation fallback occurs in German (navigate all pages in German language)
- [X] T027 [US2] Verify no missing translation fallback occurs in Czech (navigate all pages in Czech language)

**Checkpoint**: ✅ User Story 2 Complete - All 5 languages functional with complete translations, English appears first

---

## Phase 5: User Story 3 - Documentation Reflects Accurate Default (Priority: P3)

**Goal**: Developer documentation correctly states English as default/fallback language

**Independent Test**: Search all documentation for references to fallback language, verify all state English (en) rather than Polish (pl)

### Documentation Updates

- [X] T028 [P] [US3] Search for fallback language references: `grep -r "fallback.*polish\|fallback.*pl\|default.*polish" .github/ agent-os/ README.md` (case-insensitive)
- [X] T029 [P] [US3] Update .github/copilot-instructions.md to state English as fallback language (find and replace Polish → English in fallback references)
- [X] T030 [P] [US3] Update agent-os/standards/i18n/language-support.md to list English first as default language
- [X] T031 [P] [US3] Verify consistency across all i18n documentation files in agent-os/standards/i18n/ directory
- [X] T032 [US3] Update README.md if it references supported languages or default language
- [X] T033 [US3] Verify no outdated Polish fallback references remain: run grep search again, should return no matches

**Checkpoint**: ✅ User Story 3 Complete - Documentation accurate and consistent

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, performance check, and cleanup

- [ ] T034 Run full test suite to verify all changes (npm run test - all tests must pass)
- [ ] T035 [P] Run ESLint to verify code quality (npm run lint - no errors)
- [ ] T036 [P] Build production bundle and verify no errors (npm run build)
- [ ] T037 [P] Test performance: language switching completes in <100ms (use DevTools Performance tab)
- [ ] T038 Manual test: New user sees English (incognito mode, clear localStorage, verify English interface)
- [ ] T039 Manual test: Existing Polish user unaffected (set i18nextLng='pl' in localStorage, verify Polish interface)
- [ ] T040 Manual test: All 5 languages selectable and functional (test each language via selector)
- [ ] T041 Manual test: German translations complete (select German, navigate all pages, verify no English fallback)
- [ ] T042 Manual test: Czech translations complete (select Czech, navigate all pages, verify no English fallback)
- [ ] T043 [P] Check browser console for errors or warnings (should be zero)
- [ ] T044 [P] Verify bundle size increase acceptable (<100KB for 2 completed language files)
- [ ] T045 Review all changes before commit (git diff, ensure only intended files modified)
- [ ] T046 Update validation report status: mark feature as implemented
- [ ] T047 Create pull request with summary of changes and test results

---

## Dependencies & Parallel Execution

### Dependency Graph (Story Completion Order)

```
Phase 1 (Setup)
  ↓
Phase 2 (Foundational) ← BLOCKING - must complete before user stories
  ↓
  ├─→ Phase 3 (US1: English Default) ← MVP minimum
  ├─→ Phase 4 (US2: 5-Language Support) ← Can start after Phase 2
  └─→ Phase 5 (US3: Documentation) ← Can start after Phase 2
           ↓
       Phase 6 (Polish) ← Requires all user stories complete
```

### Parallel Execution Examples

**After Phase 2 completes, these can run in parallel:**

**Track A (User Story 1)**:
- T010-T015: English default implementation and test updates

**Track B (User Story 2)**:  
- T016-T022: Translation file completion
- T023-T027: Language selector updates

**Track C (User Story 3)**:
- T028-T033: Documentation updates

**Within User Story 2, these are parallel:**
- T016-T018: Key identification (can run simultaneously)
- T019-T020: Translation work (can run simultaneously)
- T028-T031: Documentation updates (can run simultaneously)

### MVP Scope (Minimum Viable Product)

**For immediate deployment, implement only:**
- Phase 1: Setup (T001-T003)
- Phase 2: Foundational (T004-T009) ← REQUIRED
- Phase 3: User Story 1 (T010-T015) ← MVP
- Phase 6: Selected polish tasks (T034-T037, T045-T047)

**This delivers**: English as default for new users, existing users unaffected, tests passing

**Defer to later**: Complete translation files (US2), documentation updates (US3)

---

## Implementation Strategy

### Incremental Delivery Approach

1. **Week 1 - MVP (User Story 1)**: English default + test updates
   - Delivers immediate value: international users see English
   - Risk: Minimal - only affects new users
   - Tasks: T001-T015 + basic polish
   
2. **Week 2 - Enhanced (User Story 2)**: Complete translations + language selector
   - Delivers: Full 5-language support without fallback
   - Risk: Low - translation quality via machine translation
   - Tasks: T016-T027
   
3. **Week 3 - Complete (User Story 3)**: Documentation alignment
   - Delivers: Developer guidance consistency
   - Risk: None - documentation only
   - Tasks: T028-T033

### Task Execution Guidelines

**Before Starting**:
- Read quickstart.md for verification procedures
- Read contracts/i18n-interface.md for technical specifications
- Ensure on feature branch `001-en-default-language`

**During Implementation**:
- Run tests after each phase completes
- Verify changes manually using quickstart test scenarios
- Check browser console for errors after each change
- Commit after each phase with descriptive messages

**Translation Quality**:
- Machine translation (DeepL/Google Translate) is acceptable
- Focus on consistency with existing translation style
- Flag any culturally sensitive terms for native speaker review
- Test translations in context (run app with language selected)

**Error Handling**:
- If test failures occur, update test fixtures first, preserve test logic
- If translation keys are missing, add to all 5 files to maintain parity
- If language loading fails, check import statements and resources registration

---

## Summary

**Total Tasks**: 53 (was 47, added 6 for coverage gaps and TDD compliance)  
**MVP Tasks**: 21 (was 18, includes new error handling and tests)  
**Parallel Opportunities**: 18 tasks can run in parallel (marked with [P])  
**Estimated Time**: 
- MVP: 3-4 hours (includes error handling)
- Full Feature: 5-7 hours (including translation completion)

**Critical Path**: Phase 1 → Phase 2 → (US1 || US2 || US3) → Phase 6

**Independent Test Criteria**:
- US1: New user sees English interface ✓
- US2: All 5 languages functional without fallback ✓
- US3: Documentation references English as default ✓

**Suggested MVP**: Complete Phases 1-3 (T001-T015 + error handling) for immediate deployment of English default, defer translation completion and documentation to follow-up PRs.

---

## Remediation Notes

**Added Tasks for Coverage & Compliance**:
- T009a: Language detection order verification (FR-009 coverage)
- T010a: Error handling implementation (FR-011 CRITICAL coverage)
- T010b: Error handling tests (test coverage for FR-011)
- T020a-T020b: Translation completeness tests (TDD compliance - tests before verification)
- T025a: Unsupported language fallback test (FR-012 coverage)

**Clarifications from Analysis**:
- T013: "Document failures" clarified to "create list in tasks.md comments or separate file"
- T016: Extraction method now specified: "using `jq 'keys' en.json` or create extraction script"

This brings requirement coverage to 13/13 (100%) and constitution compliance to 6/6 (100%).
