# Contributing

## Prerequisites

- **Node.js 22+** (required by Astro v6). Use `nvm use 22` if you manage versions with nvm.

## Setup

```bash
npm ci           # install exact pinned versions from lock file
npm run dev      # start dev server
```

## Dependency Management

All dependency versions in `package.json` are **pinned** (no `^` or `~` ranges). This ensures every contributor and CI environment uses the exact same versions.

- Use `npm ci` (not `npm install`) to install. This installs from the lock file and fails if it's out of sync with `package.json`.
- When adding a new dependency, pin it: `npm install --save-exact <package>` or `npm install --save-exact -D <package>`.
- When upgrading, update the exact version in `package.json` and run `npm install` to regenerate the lock file.

## Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/). Every commit message must use one of these prefixes:

| Prefix      | When to use                                             |
| ----------- | ------------------------------------------------------- |
| `feat:`     | New feature or functionality                            |
| `fix:`      | Bug fix                                                 |
| `chore:`    | Maintenance, dependency updates, config changes         |
| `perf:`     | Performance improvement                                 |
| `refactor:` | Code change that neither fixes a bug nor adds a feature |
| `docs:`     | Documentation only                                      |
| `test:`     | Adding or updating tests                                |
| `style:`    | Formatting, whitespace, semicolons (no logic change)    |
| `ci:`       | CI/CD configuration changes                             |

Examples:

```
feat: add experience timeline with scroll-triggered expansion
fix: keep custom cursor visible over text elements
chore: increase preloader minimum duration to 2s
perf: lazy-load Three.js only on desktop with WebGL support
docs: add architecture section to README
test: add Playwright tests for contact section clipboard copy
```

Keep the subject line under 72 characters. Use the imperative mood ("add", not "added" or "adds").

## Pre-commit Hooks

Husky runs the following checks on every commit:

- **TypeScript** -- `tsc --noEmit` on the full project (a change in one file can break types in another)
- **ESLint** -- lints and auto-fixes staged `.ts`, `.js`, `.mjs` files
- **Prettier** -- formats all staged files (`.ts`, `.js`, `.astro`, `.css`, `.json`, `.md`)
- **cspell** -- checks spelling in staged `.ts`, `.astro`, and `.md` files

If a hook fails, the commit is blocked. Fix the issue and try again.

## Scripts

Always use `npm run <script>` instead of running tools directly with `npx`.

| Command                | Description                                |
| ---------------------- | ------------------------------------------ |
| `npm run dev`          | Start local dev server at `localhost:4321` |
| `npm run build`        | Build for production to `dist/`            |
| `npm run preview`      | Preview the production build locally       |
| `npm run typecheck`    | Run TypeScript type checking (no emit)     |
| `npm run lint`         | Run ESLint                                 |
| `npm run lint:fix`     | Run ESLint with auto-fix                   |
| `npm run format`       | Format all files with Prettier             |
| `npm run format:check` | Check formatting without writing           |
| `npm run spellcheck`   | Run cspell on source and test files        |
| `npm run test`         | Run all Playwright tests (all devices)     |
| `npm run test:headed`  | Run tests with a visible browser window    |
| `npm run test:debug`   | Run tests in Playwright debug mode         |

## Testing

Start the dev server, then run tests in a separate terminal:

```bash
# Terminal 1
npm run dev

# Terminal 2
npm run test
```

Run a single test file:

```bash
npm run test -- tests/contact.spec.ts
```

Run a single test by name:

```bash
npm run test -- -g "copies email to clipboard"
```

Run tests for a specific device only:

```bash
npm run test -- --project="iPhone 14"
```

Tests run against three device viewports (Desktop Chrome, iPhone 14, iPad Mini). See `playwright.config.ts` to add more.

Tests are **behavior-based** -- they assert on what the user sees (opacity, scroll position, text content), not on implementation details (CSS classes, animation library internals). This means tests survive framework or styling changes.

## Code Style

- **Formatting**: Prettier handles all formatting. Editor "format on save" and Prettier CLI produce identical output.
- **Linting**: ESLint with TypeScript support. Prettier-conflicting rules are disabled via `eslint-config-prettier`.
- **Spelling**: cspell catches typos in code and docs. Add project-specific terms to `cspell.json` `words` array.

## Project Configuration

- **Personal data** (name, email, social links): `src/config/site.ts`
- **Animation/interaction tuning** (timings, easing, sizes): `src/config/theme.ts`
- **Experience entries**: `src/data/experience.ts`
- **Project entries**: `src/data/projects.ts`

See the README for full documentation.
