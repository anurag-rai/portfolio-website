# Project Conventions

## Environment

- Node 22+ is required. Always run `nvm use 22` before npm commands.
- Use `npm ci` (not `npm install`) to install dependencies.
- All dependency versions are pinned (no `^` or `~`). When adding dependencies use `npm install --save-exact`.
- Always use `npm run <script>` instead of running tools directly with `npx`.
- `npm run test:unit` runs vitest. `npm run test` runs Playwright E2E. Don't confuse them.

## Astro Conventions

- `.astro` components do NOT support `client:load`, `client:media`, or other `client:` directives. Those only work with framework components (React, Svelte, etc.). Use inline `<script>` tags with dynamic `import()` for conditional loading.
- `define:vars` scripts are inline and cannot use ES module imports. Use CSS transitions or pass data via `data-` attributes for client-side behavior that needs config values.

## Performance

- Fonts are self-hosted in `public/fonts/` (Manrope variable woff2, Latin subset). Do NOT add Google Fonts `<link>` tags -- they are render-blocking and add ~800ms to mobile FCP.
- Three.js cannot be tree-shaken due to internal side effects. Named imports are used for readability but do not reduce bundle size. The hero-scene chunk is ~521KB raw / ~109KB brotli and is lazy-loaded via dynamic `import()`.
- Lighthouse CI runs on every push to main (mobile + desktop, median of 5 runs). Scores are auto-committed to `performance/lighthouse-history.json` and `performance/lighthouse-badge.svg`.
- `.lighthouseci/` and `lighthouse-results/` are temporary CI working directories -- they are in `.gitignore` and `.prettierignore`.
- CI auto-commit messages include `[skip ci]` to prevent infinite trigger loops.

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
- Before pushing, run `npm run spellcheck` and `npm run format:check` on the full repo. lint-staged (pre-commit) only checks staged files — CI checks everything, so these can diverge.
- After pushing changes that affect CI, monitor the run with `gh run watch` before moving on.
- The unit-tests and lighthouse jobs need `permissions: contents: write` for auto-commit steps.
- Auto-commit steps (coverage badge, lighthouse scores) require a `BADGE_PUSH_TOKEN` repository secret (Fine-grained PAT with `contents: write` for this repo) to bypass branch protection. Without it, auto-commits silently fail and badges must be committed manually.

## Git

- Commit messages must be a single line. No multi-line bodies, no `Co-Authored-By` trailers.
- The commit-msg hook only allows these prefixes: feat, fix, chore, docs, test.
- When configuring CI actions that create commits, use one of these prefixes.
- When committing unrelated changes, use separate commits (one logical change per commit).

## E2E Tests

- E2E tests run on port 4322 (not 4321) to avoid colliding with the dev server.
- If tests fail with "strict mode violation" on `<header>` or unexpected h1 counts, check if a dev server is running on 4321 and verify `devToolbar` is disabled in astro.config.mjs.

## Testing

- Use Playwright as a debugging tool, not just a test runner. For "X doesn't work in the browser" issues, write a diagnostic spec that inspects `elementFromPoint`, stacking context, and computed styles before attempting a fix.
- Tests assert on behavior (opacity, scroll position, text content, DOM presence), not implementation details (CSS class names, GSAP internals, Tailwind utilities).
