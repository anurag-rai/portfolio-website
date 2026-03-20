# Contributing

## Prerequisites

- **Node.js 22+** (required by Astro v6). Use `nvm use 22` if you manage versions with nvm.

## Setup

```bash
npm ci           # install exact pinned versions from lock file
npm run dev      # start dev server at localhost:4321
```

## Dependency Management

All dependency versions in `package.json` are **pinned** (no `^` or `~` ranges). This ensures every contributor and CI environment uses the exact same versions.

- Use `npm ci` (not `npm install`) to install. This installs from the lock file and fails if it's out of sync with `package.json`.
- When adding a new dependency, pin it: `npm install --save-exact <package>` or `npm install --save-exact -D <package>`.
- When upgrading, update the exact version in `package.json` and run `npm install` to regenerate the lock file.

## Scripts

Always use `npm run <script>` instead of running tools directly with `npx`.

| Command                | Description                                       |
| ---------------------- | ------------------------------------------------- |
| `npm run dev`          | Start local dev server at `localhost:4321`        |
| `npm run build`        | Build for production to `dist/`                   |
| `npm run preview`      | Preview the production build locally              |
| `npm run typecheck`    | Run TypeScript type checking (no emit)            |
| `npm run lint`         | Run ESLint on TypeScript/JS files                 |
| `npm run lint:fix`     | Run ESLint with auto-fix                          |
| `npm run format`       | Format all files with Prettier                    |
| `npm run format:check` | Check formatting without writing                  |
| `npm run spellcheck`   | Run cspell on source, test, and markdown files    |
| `npm run test`         | Run all Playwright tests (all devices)            |
| `npm run test:headed`  | Run tests with a visible browser window           |
| `npm run test:debug`   | Run tests in Playwright debug mode (step-through) |

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

Keep the subject line under 72 characters. Use the imperative mood ("add", not "added" or "adds").

## Pre-commit Hooks

Husky runs the following checks on every commit:

1. **TypeScript** -- `tsc --noEmit` on the full project (a change in one file can break types in another)
2. **ESLint** -- lints and auto-fixes staged `.ts`, `.js`, `.mjs` files
3. **Prettier** -- formats all staged files (`.ts`, `.js`, `.astro`, `.css`, `.json`, `.md`)
4. **cspell** -- checks spelling in staged `.ts`, `.astro`, and `.md` files

If a hook fails, the commit is blocked. Fix the issue and try again.

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

### Device Matrix

Tests run against three device profiles defined in `playwright.config.ts`:

| Device         | Viewport   | Type                   |
| -------------- | ---------- | ---------------------- |
| Desktop Chrome | 1280 x 720 | Desktop, pointer: fine |
| iPhone 14      | 390 x 844  | Mobile, touch          |
| iPad Mini      | 768 x 1024 | Tablet, touch          |

To add a new device, add an entry to `TEST_DEVICES` in `playwright.config.ts`. All test files automatically run against it.

### Test Design

Tests are **behavior-based** -- they assert on what the user sees (opacity, scroll position, text content), not on implementation details (CSS classes, animation library internals). This means tests survive framework or styling changes.

## Code Style

- **Formatting**: Prettier handles all formatting. Editor "format on save" and `npm run format` produce identical output.
- **Linting**: ESLint with TypeScript support. Prettier-conflicting rules are disabled via `eslint-config-prettier`.
- **Spelling**: cspell catches typos. Add project-specific terms to the `words` array in `cspell.json`.
- **Types**: Use `import type` for type-only imports (enforced by `verbatimModuleSyntax` in tsconfig).
