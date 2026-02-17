# Design: RacketBadge Component Tests

## Context

The RacketBadge component is a pure presentational component with no state, side effects, or external dependencies beyond React. It exports three items: PRESET_COLORS constant, RacketIcon component, and RacketBadge component (default export).

The project uses Vitest with React Testing Library, following patterns established in other component tests like PlayerProfileModal.test.jsx.

## Goals / Non-Goals

**Goals:**
- Verify color selection logic for all three priority paths
- Test both rendering modes (icon-only vs full badge)
- Validate conditional rendering (dual icons, text display)
- Test both exported components (RacketIcon and RacketBadge)
- Keep tests fast and maintainable

**Non-Goals:**
- Visual regression testing (snapshot tests)
- Testing inline styles pixel-perfectly
- Mocking React or SVG rendering
- Testing third-party libraries

## Decisions

### Decision 1: Direct Rendering Without Providers

Unlike PlayerProfileModal tests, RacketBadge doesn't need I18nextProvider or any context providers. Tests will render the component directly, keeping setup minimal.

**Rationale:** RacketBadge has no dependencies on i18n, contexts, or external state. Adding unnecessary providers would obscure the simplicity of the component and slow down tests.

### Decision 2: Test Structure by Requirement

Tests will be organized in describe blocks matching the spec requirements:
- Color Priority Logic
- Rendering Modes  
- Dual Icon Display
- Text Display
- RacketIcon Export

**Rationale:** This structure maps directly to the specs, making it easy to verify coverage and trace tests back to requirements.

### Decision 3: Query Strategy

Tests will primarily use:
- `container.querySelector()` for checking SVG elements and styled divs
- `screen.getByText()` for text content
- Direct inspection of rendered elements rather than test IDs

**Rationale:** RacketBadge renders based on inline styles and structure, not text content or ARIA roles. Querying the DOM structure directly is more appropriate than forcing test IDs onto a simple presentational component.

### Decision 4: Color Verification

Color tests will verify that the correct color value appears in the component output (via style attributes or props) without testing exact CSS computation.

**Rationale:** We care that the component receives and uses the correct color value, not how the browser renders it. Testing the prop/style values is sufficient and more maintainable.
