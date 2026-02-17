# Spec: RacketBadge Testing

## Purpose

This specification defines the test requirements for the RacketBadge component, ensuring comprehensive coverage of its color selection logic, rendering modes, icon display variations, and text display behavior.

## Requirements

### Requirement: Color Priority Logic

The RacketBadge component must correctly select colors based on the priority order: explicit colorHex prop takes precedence, then colorKey lookup from PRESET_COLORS, then gray fallback.

#### Scenario: Explicit color hex provided

- **WHEN** colorHex prop is provided
- **THEN** the badge uses the exact hex color value
- **AND** colorKey is ignored even if present

#### Scenario: Color key without hex

- **WHEN** colorKey prop is provided without colorHex
- **THEN** the badge uses the corresponding color from PRESET_COLORS
- **AND** the color matches the expected palette value

#### Scenario: No color props provided

- **WHEN** neither colorHex nor colorKey is provided
- **THEN** the badge defaults to gray (#888888)

### Requirement: Rendering Modes

The RacketBadge component must support two distinct rendering modes based on the onlyIcon prop.

#### Scenario: Icon-only mode

- **WHEN** onlyIcon is true
- **THEN** only the RacketIcon is rendered
- **AND** no badge container, text, or styling is shown

#### Scenario: Full badge mode

- **WHEN** onlyIcon is false or undefined
- **THEN** the full badge with border, shadow, and background is rendered
- **AND** the RacketIcon is displayed inside the badge container

### Requirement: Dual Icon Display

The RacketBadge component must optionally display two overlapping racket icons when in dual mode.

#### Scenario: Dual mode enabled

- **WHEN** isDual is true and onlyIcon is false
- **THEN** two RacketIcon components are rendered
- **AND** the second icon has reduced opacity and negative left margin for overlap

#### Scenario: Single icon mode

- **WHEN** isDual is false or undefined
- **THEN** only one RacketIcon is rendered

### Requirement: Text Display

The RacketBadge component must conditionally display text when provided.

#### Scenario: Text provided

- **WHEN** text prop contains a value
- **THEN** the text is displayed in the badge

#### Scenario: No text provided

- **WHEN** text prop is empty or undefined
- **THEN** no text element is rendered
