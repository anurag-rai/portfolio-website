# Project Conventions

## Environment

- Node 22+ is required. Always run `nvm use 22` before npm commands.
- Use `npm ci` (not `npm install`) to install dependencies.
- All dependency versions are pinned (no `^` or `~`). When adding dependencies use `npm install --save-exact`.
- Always use `npm run <script>` instead of running tools directly with `npx`.

## Astro Conventions

- `.astro` components do NOT support `client:load`, `client:media`, or other `client:` directives. Those only work with framework components (React, Svelte, etc.). Use inline `<script>` tags with dynamic `import()` for conditional loading.
- `define:vars` scripts are inline and cannot use ES module imports. Use CSS transitions or pass data via `data-` attributes for client-side behavior that needs config values.

## Inline Styles

- When writing inline styles via `element.style.cssText`, use CSS property syntax (e.g. `pointer-events: none`), NOT Tailwind class names (e.g. `pointer-events-none`). Tailwind classes are only valid in HTML `class` attributes.

## Configuration

- All personal data lives in `src/config/site.ts`. Components import from here — never hardcode names, emails, or social links in components.
- All animation/interaction constants live in `src/config/theme.ts`. Scripts import from here — never hardcode timings, sizes, or easing in script files.

## CI

- CI runs on GitHub Actions (`.github/workflows/ci.yml`) on every push to main.
- E2E tests use Chromium only in CI (no WebKit). Mobile viewports are tested via Chromium device emulation.
- Playwright config uses `process.env.CI` — it is excluded from tsconfig to avoid needing `@types/node`.
- Pixel-position assertions in E2E tests need generous tolerance (80px+) for cross-environment rendering differences between macOS and Ubuntu CI runners.

## Git

- Commit messages must be a single line. No multi-line bodies, no `Co-Authored-By` trailers.

## Testing

- Use Playwright as a debugging tool, not just a test runner. For "X doesn't work in the browser" issues, write a diagnostic spec that inspects `elementFromPoint`, stacking context, and computed styles before attempting a fix.
- Tests assert on behavior (opacity, scroll position, text content, DOM presence), not implementation details (CSS class names, GSAP internals, Tailwind utilities).
