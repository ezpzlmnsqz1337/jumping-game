# CSS Best Practices

## Philosophy

This project uses **plain CSS** with **CSS Custom Properties (design tokens)** — no SCSS, no Tailwind, no CSS-in-JS. Every UI module loads its own CSS dynamically at runtime via `AbstractUI.loadCss()`. Only `src/style.css` is bundled by Vite.

CSS is a critical part of UX. Treat it with the same discipline as TypeScript.

---

## Design Token System

Tokens are defined in `src/style.css` on `body`. Always use tokens — never hardcode values.

### Color Tokens

| Token | Purpose |
|---|---|
| `--color-text-primary` | Main body text |
| `--color-text-secondary` | Muted/secondary text |
| `--color-surface-overlay` | Semi-transparent overlay backgrounds |
| `--color-surface-overlay-strong` | More opaque overlay backgrounds |
| `--color-brand-primary` | Primary interactive elements (buttons, links) |
| `--color-brand-primary-muted` | Muted brand elements |
| `--color-brand-primary-hover` | Hover state for brand elements |
| `--color-brand-divider` | Dividers and borders |
| `--color-brand-hover-overlay` | Hover highlight overlays |
| `--color-status-bg-soft` | Soft background for status info |
| `--color-status-positive` | Success/positive indicators |
| `--color-status-negative` | Error/negative indicators |
| `--blue`, `--red`, etc. | **Gameplay player colors only** — never for UI chrome |

### Typography Tokens

`--font-size-ui-xs` through `--font-size-ui-6xl` for all text sizing.

### Spacing Tokens

`--space-none` through `--space-5xl` for all padding, margin, and gap values.

### Missing Tokens You May Need

If you need a value that has no token, **add the token to `src/style.css` first**. Do not hardcode.

---

## Non-Negotiable Rules

### 1. No Hardcoded Values

This is the single biggest issue in the codebase today. Hardcoded values are found in several UI CSS files. They must use tokens where tokens exist, or a new token must be created.

**Bad:**
```css
.foo {
  gap: 0.5rem;
  margin-bottom: 1rem;
  border-radius: 0.3rem;
  height: 100px;
  z-index: 999;
}
```

**Good:**
```css
.foo {
  gap: var(--space-md);
  margin-bottom: var(--space-3xl);
  border-radius: var(--radius-md);
  height: var(--size-player-bar);
  z-index: var(--z-overlay);
}
```

#### Known Hardcoded Values Remaining

| File | Value | Should Be |
|---|---|---|
| `editor.css` | `top: 11rem` | Token or documented spacing value |
| `editor.css` | `max-width: 15rem` | `--size-editor-info-max-width` token |
| `editor.css` | `width: 5rem` (label) | Token for label width |
| `chat.css` | `bottom: 7rem` | Token or documented spacing — clears player-info HUD |
| `chat.css` responsive | `bottom: 11rem` | Token or documented spacing |
| `nickname input` in lobby | `border: 0.2rem solid` | `var(--border-width-thick)` (0.2rem ≈ 3.2px vs token's 2px) |

### 2. No Magic Numbers

Never use a value because "it just works". Every value must be explainable. If you can't explain why `-3px` fixes the layout, you have a broken layout. Fix the layout, not the symptom.

**Bad:**
```css
.foo {
  margin-left: -3px; /* "just works" */
}
```

### 3. No `!important` (Reactively)

`!important` may only be used **proactively** — for rules that must always win (e.g., error states, utility overrides). Never use it to paper over specificity problems.

### 4. No IDs in CSS

IDs have infinitely higher specificity than classes and can never be reused. Never use `#foo` as a CSS selector. Use classes.

### 5. No Inline Styles

Inline styles mix content and presentation. Use classes and CSS files for all styling. The only exception is dynamic show/hide toggling (`element.style.display`).

### 6. No Undoing Styles

CSS should only ever add styles, never take them away. If you find yourself writing:

```css
h2 {
  padding-bottom: 0.5em;
  border-bottom: 1px solid #ccc;
}
.no-border {
  padding-bottom: 0;
  border-bottom: none;
}
```

You added the styles too early. Move them to the appropriate class.

### 7. No Qualified Selectors

**Bad:** `ul.nav`, `a.button`, `div.header`
**Good:** `.nav`, `.button`, `.header`

Qualified selectors inhibit reusability, increase specificity, and decrease performance.

### 8. No Loose Class Names

Class names must clearly describe their purpose. `.board` and `.user` are too vague. Use BEM-like naming: `.level-list`, `.level-entry`, `.level-entry.selected`.

### 9. No Shorthand That Unspecifics

Shorthand properties (`background`, `font`, `margin`, `padding`, `border`) reset unspecified sub-properties. Prefer longhand when you only want to change one aspect:

**Bad:**
```css
.foo {
  background: var(--color-surface-overlay); /* resets background-image, background-repeat, etc. */
}
```

**Good:**
```css
.foo {
  background-color: var(--color-surface-overlay);
}
```

---

## Strongly Recommended Practices

### 1. Follow a Methodology

Use **BEM-like naming** (Block, Element, Modifier):
- `.block` — the component root
- `.block__element` — a child of the block
- `.block--modifier` or `.block.selected` — a state variant

The codebase already follows this convention loosely. Formalize it.

### 2. Alphabetize Properties

Organize properties alphabetically within each ruleset. This eliminates decision fatigue and makes scanning consistent.

### 3. Use Relative Units

Always use `rem`, `em`, `%`, `vh`, `vw`, `fr`. Never `px` for sizing. The only acceptable `px` use is for trivial pixel values like `border-width: 1px` or `border-radius` before tokens exist.

### 4. Write Descriptive Media Queries

Use a single responsive breakpoint at `1000px` for now. If more breakpoints are needed, define them as tokens.

### 5. Keep Selector Depth Shallow

Maximum **3 levels** of nesting (in terms of specificity depth, not preprocessor nesting). This keeps specificity low and components portable.

### 6. Separate Global vs Local Style

- `src/style.css` — resets, design tokens, global rules (`#render-canvas`)
- Module CSS files — component-specific styles only

### 7. Let Content Define Size

Prefer `padding` + `max-width`/`max-height` over fixed `width`/`height`. Let the content breathe.

### 8. Let Parent Position Children

A component should not set `position` or `margin` for layout positioning — its container should. Components define their own internal spacing only.

### 9. Comment Sections

Use comments to separate logical sections within a CSS file:

```css
/* Level list */
.level-list { ... }

/* Player setup */
.player-setup { ... }
```

### 10. Alphabetize Class Names in the `class` Attribute

When an element has multiple classes, order them consistently: component class first, then variant classes, then utility classes.

```html
<div class="level-entry selected highlight"></div>
```

---

## Poor Practices to Eliminate

### String Concatenation in Preprocessor `&`

Not applicable — this project doesn't use a preprocessor. But if one were added, avoid `&-bar` patterns because they break text search.

### `@mixin` and `@extend` Abuse

Not applicable — no preprocessor. If SCSS is ever added, use `@mixin` sparingly and never use `@extend`.

### Duplicated Key Selectors

Each class should have one clear definition. If `.btn` is defined in multiple places, extract a single source of truth.

### Reactive `!important`

Already covered above. Proactive only.

### Brute Forcing Layouts

`margin-left: -3px` is never acceptable. Understand box model and computed styles.

---

## CSS Organization Per Module

Each UI module's CSS file should follow this structure:

```
1. Component root selector (.chat, .editor, .timer, etc.)
2. Direct children (component > element)
3. Nested elements (component .child)
4. State variants (.component.state, .component .child.state)
5. Responsive overrides (media queries)
```

---

## Linting and Formatting

- **Prettier** formats all CSS automatically via `npm run format`.
- **No CSS-specific linter (stylelint) is installed yet.** This is a known gap. When adding stylelint, configure rules for:
  - Alphabetical property order
  - No duplicate selectors
  - No `!important` (proactive only, allow list)
  - No `id` selectors
  - No universal selectors as key selectors
  - Color naming (no named colors)
  - Unit validation (prefer rem)

---

## CSS Performance

- Minimize expensive properties: `box-shadow`, `border-radius`, `filter`, `position: fixed` in animations.
- Use `will-change` sparingly and as a last resort.
- The project already lazy-loads CSS per module via `AbstractUI.loadCss()` — maintain this pattern.
- No unused CSS should accumulate. When removing a component, remove its CSS.

---

## Code Review Checklist for CSS

- [ ] All values use design tokens (no hardcoded rem/px)
- [ ] No `!important` (or proactively justified)
- [ ] No IDs in selectors
- [ ] No qualified selectors (`ul.nav`)
- [ ] No magic numbers
- [ ] No inline styles (except display toggling)
- [ ] Selectors follow BEM-like naming
- [ ] Properties alphabetized
- [ ] Responsive breakpoints use existing tokens
- [ ] New tokens added to `src/style.css` before use
