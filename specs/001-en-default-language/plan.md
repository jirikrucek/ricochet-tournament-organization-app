# Implementation Plan: English as Default Language

**Branch**: `001-en-default-language` | **Date**: 2026-02-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-en-default-language/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Refactor the internationalization (i18n) system to use English as the default/fallback language instead of Polish. This involves: (1) updating i18n configuration to set `fallbackLng: 'en'`, (2) loading all 5 language files (en, pl, nl, de, cs) instead of current 3, (3) ordering languages with English first in the selector, (4) completing German and Czech translation files with ~162 additional keys each to match the ~220 keys in English/Polish/Dutch, and (5) updating documentation and tests to reflect the new default. The feature ensures existing users with stored Polish preference are unaffected while new users see English by default.

## Technical Context

**Language/Version**: JavaScript ES2020+ with React 19.2  
**Primary Dependencies**: i18next 25.8.0, react-i18next 16.5.3, i18next-browser-languagedetector 8.2.0  
**Storage**: localStorage for language preference persistence, Supabase (optional) for data  
**Testing**: Vitest with jsdom, @testing-library/react  
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge), supports ES2020+ 
**Project Type**: Single-page web application (SPA) with React + Vite  
**Performance Goals**: Language switching <100ms, file loading synchronous (no async delays)  
**Constraints**: Must preserve existing user language preferences, zero breaking changes for current users  
**Scale/Scope**: 5 language files (~220 keys each, ~1100 total keys), ~10 affected files (config, components, docs, tests)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Required Principles Compliance

- [x] **DDD**: Does the feature respect bounded contexts? ✓ YES - This is purely UI/presentation layer (i18n), no impact on tournament management, match tracking, or player profile domains
- [x] **TDD**: Are test requirements identified? ✓ YES - Priority 3 (components: LanguageSelector), test fixtures need updates for new default
- [x] **SOLID**: Does the design follow single responsibility? ✓ YES - i18n config handles language loading, LanguageSelector handles UI, no mixing of concerns
- [x] **Dual-Mode**: Does the feature work with BOTH Supabase and localStorage? ✓ YES - Language preference uses i18next's localStorage, independent of tournament data storage mode
- [x] **i18n**: Will UI changes require updates to all 5 language files? ✓ YES - German and Czech files require ~162 new keys each to match English/Polish/Dutch
- [x] **Domain Integrity**: Does the feature affect bracket logic, match IDs, or drop patterns? ✓ NO - Pure UI translation, zero impact on tournament domain logic

### Technology Stack Verification

- [x] Uses React 19.2 functional components (no new class components except ErrorBoundary) - ✓ YES, LanguageSelector is functional
- [x] Uses Context API for state (not Redux or other libraries) - ✓ N/A, i18next handles language state
- [x] Custom hooks for data operations (not direct database access) - ✓ N/A, no database operations
- [x] File organization follows `pages/`, `components/`, `hooks/`, `utils/`, `contexts/` structure - ✓ YES, LanguageSelector in `components/`, config in `i18n/`

### Code Standards Gates

- [x] ESLint compliance confirmed - ✓ YES, no new linting rules needed
- [x] Import ordering: external libs → internal modules → styles - ✓ YES, existing pattern maintained
- [x] File extension: `.jsx` for components, `.js` for utilities - ✓ YES, LanguageSelector.jsx, config.js
- [x] localStorage keys use `ricochet_*` prefix if applicable - ✓ N/A, i18next manages its own localStorage keys

**GATE STATUS**: ✅ PASS - All principles satisfied, no violations to justify

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── i18n/
│   ├── config.js           # Update fallbackLng, import de/cs
│   ├── en.json             # Reference for complete key set (~220 keys)
│   ├── pl.json             # Reference for complete key set (~220 keys)
│   ├── nl.json             # Reference for complete key set (~220 keys)
│   ├── de.json             # ADD ~162 missing keys
│   └── cs.json             # ADD ~162 missing keys
├── components/
│   └── LanguageSelector.jsx  # Update LANGUAGES array order
├── setupTests.js           # Update test i18n config if needed
└── test-utils.jsx          # Update test i18n config if needed

.github/
└── copilot-instructions.md  # Update fallback language docs

agent-os/standards/i18n/
├── language-support.md     # Update supported languages list
└── (other i18n docs)       # Verify consistency

tests/
└── (various test files)    # Update expected values from 'pl' to 'en'
```

**Structure Decision**: Single project web application structure. All changes are within existing `src/` directory, primarily in `src/i18n/` and `src/components/`. No new directories needed. Documentation updates in `.github/` and `agent-os/standards/`.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations** - All constitution principles satisfied. This is a straightforward i18n configuration refactoring with no architectural complexity additions.

## Phase 0: Research Findings ✅

**Status**: COMPLETE - See [research.md](./research.md)

**Key Decisions Made**:
1. Change  from 'pl' to 'en' in i18n configuration
2. Import and register all 5 language files (en, pl, nl, de, cs)
3. Complete de.json and cs.json with ~162 missing keys each
4. Order languages as [en, cs, de, nl, pl] in selector
5. Update tests: fixtures/expected values only, preserve logic
6. Update all documentation references to fallback language

**All uncertainties resolved** - No NEEDS CLARIFICATION markers remain.

---

## Phase 1: Design

- Pure UI configuration changes only (i18n configuration: `fallbackLng`, supported languages, language detector order)
- **Test-Driven Development (TDD)**: Define the unit and integration tests that will drive changes to the i18n initialization (fallback behavior, language persistence, and initial load), to be implemented in later phases.

---

## Implementation Files

### Files to Modify

| File | Change Type | Description |
|------|-------------|-------------|
|  | MODIFY | Change fallbackLng to 'en', import de/cs, register all 5 languages |
|  | MODIFY | Add ~162 missing translation keys |
|  | MODIFY | Add ~162 missing translation keys |
|  | MODIFY | Update LANGUAGES array order to [en, cs, de, nl, pl] |
|  | MODIFY | Update fallback language documentation |
|  | MODIFY | Update language support documentation |
|  | MODIFY (if exists) | Update test i18n config fallback |
|  | MODIFY (if exists) | Update test i18n config fallback |
| Various test files | MODIFY | Update expected values from Polish to English |

### Files Created (Artifacts)

- ✅ 
- ✅ specs/001-en-default� specs/001-enguage/- ✅ specs/001-en-default-l- ✅tra- ✅ specs/001-en-default-l- ✅ - ecs- ✅ sRisk L- ✅ specs/001-en-default� specs/001-en-default-l- ✅ - ecs- f translations have issues

2. **Test Coverage for Language Changes**
   - Risk Level: Low
   - Mitigation:    - Mitigation:    - Mitigation:    - Mitigation:    - Mitigation:    - Mitigation:  st   - Mitigation:    - Mitigation:    - Mitigation:    - Mitigation:    - Mitigatio Mitigation: localStorage preference takes precedence, fallback only affects new users
   - Verification: Manual test scenario confirms Polish users unaffected

################################################################################b#########################git ch################################################re################################################################################b#########################git ch################################################re################################################################################b#########################git ch################################################re################################################################################b#########################git ch####i18####################################ct
3. Proceed with task-by-3. Proceed with task-by-3. Proceed with task-by-3. Proceed with task-by-3. Proceed with task-by-3. Proceed with task-by-3. Proceed with task-by-3. Proceed with task-by-3. Proceed with task-by-3. Proceed with task-by-3. Proceed with task-by-3. Proceed with task-by-3. Proc--|3. Proceed with task-by-3. Proceed with task-by-3. Proceed with task-byied |
| Technology Stack | ✅ PASS | No new dependencies, React 19.2 patterns maintained |
| Code Standards | ✅ PASS | ESLint compliant, file extensions correct |
| Testing Strategy | ✅ DEFINED | Update fixtures, preserve logic |
| Documentation | ✅ DEFINED | Files identified for updates |
| Backward Compatibility | ✅ GUARANTEED | Existing users unaffected |

**PLANNING STATUS**: ✅ COMPLETE - All phases executed, ready for task generation
## Phase 0: Research Findings ✅

**Status**: COMPLETE - See [research.md](./research.md)

**Key Decisions Made**:
1. Change `fallbackLng` from 'pl' to 'en' in i18n configuration
2. Import and register all 5 language files (en, pl, nl, de, cs)
3. Complete de.json and cs.json with ~162 missing keys each
4. Order languages as [en, cs, de, nl, pl] in selector
5. Update tests: fixtures/expected values only, preserve logic
6. Update all documentation references to fallback language

**All uncertainties resolved** - No NEEDS CLARIFICATION markers remain.

---

## Phase 1: Design Artifacts ✅

**Status**: COMPLETE

**Artifacts Created**:
- [data-model.md](./data-model.md) - No database changes, configuration-only
- [contracts/i18n-interface.md](./contracts/i18n-interface.md) - i18n system interface contract
- [quickstart.md](./quickstart.md) - Developer verification guide

**Agent Context**: ✅ Updated via update-agent-context.sh

**Design Validation**:
- No new entities or database schemas
- Configuration changes only (fallbackLng, language imports)
- Zero impact on data persistence or tournament logic  
- Backward compatible for existing users with stored preferences

---

## Phase 1 Post-Design Constitution Revalidation

### Design Impact Analysis

**Domain-Driven Design (DDD)**: ✅ CONFIRMED
- Design maintains separation between presentation (i18n) and domain logic
- No impact on tournament, match, or player bounded contexts
- Pure UI configuration changes only

**Test-Driven Development (TDD)**: ✅ CONFIRMED  
- Test strategy defined: update fixtures/expected values only
- Test priority identified: Priority 3 (components)
- Test files identified for updates

**SOLID Principles**: ✅ CONFIRMED
- Single Responsibility maintained: i18n config vs UI selector
- No new dependencies or abstractions needed
- Existing architecture fully supports changes

**Dual-Mode Architecture**: ✅ CONFIRMED
- Language preference uses i18next localStorage (independent of data storage)
- No impact on Supabase vs localStorage data mode
- Works identically in both modes

**Internationalization (i18n)**: ✅ CONFIRMED
- All 5 language files will be complete (~220 keys each)
- Translation completeness requirement explicitly addressed
- Consistent key structure across all files

**Domain Integrity**: ✅ CONFIRMED
- Zero impact on bracket logic, match IDs, or drop patterns
- No tournament domain rules affected
- Pure presentation layer changes

**FINAL GATE STATUS**: ✅✅ PASS - All principles revalidated post-design

---

## Implementation Files

### Files to Modify

| File | Change Type | Description |
|------|-------------|-------------|
| src/i18n/config.js | MODIFY | Change fallbackLng to en, import de/cs, register all 5 languages |
| src/i18n/de.json | MODIFY | Add ~162 missing translation keys |
| src/i18n/cs.json | MODIFY | Add ~162 missing translation keys |
| src/components/LanguageSelector.jsx | MODIFY | Update LANGUAGES array order |
| .github/copilot-instructions.md | MODIFY | Update fallback language documentation |
| agent-os/standards/i18n/*.md | MODIFY | Update language support documentation |
| src/setupTests.js | MODIFY | Update test i18n config fallback if exists |
| src/test-utils.jsx | MODIFY | Update test i18n config fallback if exists |
| Various test files | MODIFY | Update expected values from Polish to English |

### Files Created (Artifacts)

- ✅ specs/001-en-default-language/research.md
- ✅ specs/001-en-default-language/data-model.md
- ✅ specs/001-en-default-language/quickstart.md
- ✅ specs/001-en-default-language/contracts/i18n-interface.md

---

## Risk Mitigation

### Identified Risks & Mitigations

1. **Translation Quality for German/Czech**
   - Risk Level: Medium
   - Mitigation: Use machine translation + manual review
   - Fallback: English fallback still available

2. **Test Coverage for Language Changes**
   - Risk Level: Low
   - Mitigation: Full test suite execution
   - Verification: All tests must pass before merge

3. **Existing User Disruption**
   - Risk Level: Very Low
   - Mitigation: localStorage preference takes precedence
   - Verification: Manual test scenario confirms Polish users unaffected

---

## Next Steps

**Planning Complete** ✅ - Ready for task breakdown

**To Generate Tasks**: Run /speckit.tasks command

**Estimated Implementation Time**: 2-3 hours

---

## Compliance Summary

| Requirement | Status |
|-------------|--------|
| Constitution Principles | ✅ PASS |
| Technology Stack | ✅ PASS |
| Code Standards | ✅ PASS |
| Testing Strategy | ✅ DEFINED |
| Documentation | ✅ DEFINED |
| Backward Compatibility | ✅ GUARANTEED |

**PLANNING STATUS**: ✅ COMPLETE
