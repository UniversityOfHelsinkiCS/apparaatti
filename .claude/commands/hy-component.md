# Implement a hy-design-system component imitation

Implement a native MUI component that visually matches the hy-design-system (`@uh-design-system/component-library`) version of `$ARGUMENTS`, without using the library's web component directly.

## Where to look in the library

All source material is in `node_modules/@uh-design-system/component-library/dist/`:

- `styles/variables.css` — all design tokens (palette, semantic: borderColor, bgColor, textColor, spacing, etc.) with their resolved values
- `collection/components/01-base-components/<component>/<component>.css` — the component's styles, written against those tokens
- `collection/components/01-base-components/<component>/<component>.js` — the component's rendered DOM structure (Stencil JSX); read this to understand what elements are created, what shapes are used, and how state (checked, disabled, hover, focus) is handled

Start by reading all three. Resolve every CSS variable you need by tracing through `variables.css`.

## Design token system

The library uses a two-level token hierarchy:

- **Palette tokens** (`--ds-palette-mainBlue-70`, `--ds-palette-black-50`, etc.) — raw color values
- **Semantic tokens** (`--ds-borderColor-default`, `--ds-bgColor-primary`, `--ds-bgColor-white-hover`, etc.) — reference palette tokens; these are what component CSS actually uses

Prefer semantic token names when naming constants, since they communicate intent and are what the component CSS references. Add any new resolved values to `src/client/components/common/hy/hyColors.ts` using the `hy.<category>.<token>` naming that mirrors the CSS variable hierarchy.

## File organisation

All imitation components live in `src/client/components/common/hy/`. Name them `Hy<Component>` (e.g. `HyRadio`, `HyCheckbox`). Keep each component self-contained in a single file — no separate styles file unless the styles are genuinely shared across multiple components.

## MUI customisation approach

MUI exposes `icon`, `checkedIcon` (and `indeterminateIcon` for Checkbox) props on form controls that accept any `ReactNode`. Use these to pass fully custom styled elements, giving complete visual control without fighting MUI's defaults. Both `Radio` and `Checkbox` use this same API.

For state-driven styling on icon elements, use CSS sibling selectors that target MUI's hidden `<input>` sibling:

```
input:hover ~ &      → hover state
input:active ~ &     → active/pressed state
input:disabled ~ &   → disabled state
.Mui-focusVisible &  → keyboard focus (use hy-ds focus ring: box-shadow + outline)
```

Add `disableRipple` and `sx={{ '&:hover': { backgroundColor: 'transparent' } }}` on the MUI component wrapper to suppress MUI's circular hover highlight so the icon's own hover styling shows through.

## Focus ring spec

The hy-ds focus ring is consistent across all interactive components:
```
box-shadow: 0 0 0 2px <hy.bgColor.white>      ← white gap
outline: 2px solid <hy.bgColor.black>          ← black ring
outline-offset: 1px
```

## What not to carry over from MUI defaults

- Remove any `color` prop if the component uses custom icons — the color prop controls MUI's SVG fill and has no effect on custom icon elements
- Remove row-background hover sx on `FormControlLabel` — hy-ds has no row-level hover

## Verification checklist

1. Read the hy-ds component JS to confirm the exact geometry (dimensions, border widths, circle radii, etc.)
2. Visually check all states: default, hover, active, focus-visible (tab to it), disabled
3. `npm run tsc` — clean
4. `npm run lint` — clean
