# Contributing

## Prerequisites

- **Node.js 22+** (required by Astro v6). Use `nvm use 22` if you manage versions with nvm.

## Setup

```bash
npm install
npm run dev
```

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

Husky runs the following checks on every commit via lint-staged:

- **ESLint** — lints and auto-fixes `.ts`, `.js`, `.mjs` files
- **Prettier** — formats all staged files (`.ts`, `.js`, `.astro`, `.css`, `.json`, `.md`)
- **cspell** — checks spelling in `.ts`, `.astro`, and `.md` files

If a hook fails, the commit is blocked. Fix the issue and try again.

## Scripts

| Command                | Description                                |
| ---------------------- | ------------------------------------------ |
| `npm run dev`          | Start local dev server at `localhost:4321` |
| `npm run build`        | Build for production to `dist/`            |
| `npm run preview`      | Preview the production build locally       |
| `npm run lint`         | Run ESLint                                 |
| `npm run lint:fix`     | Run ESLint with auto-fix                   |
| `npm run format`       | Format all files with Prettier             |
| `npm run format:check` | Check formatting without writing           |
| `npm run spellcheck`   | Run cspell on source and test files        |

## Testing

Tests use Playwright. Start the dev server, then run tests in a separate terminal:

```bash
# Terminal 1
npm run dev

# Terminal 2
npx playwright test
```

Tests run against three device viewports (Desktop Chrome, iPhone 14, iPad Mini). See `playwright.config.ts` to add more.

Tests are **behavior-based** — they assert on what the user sees (opacity, scroll position, text content), not on implementation details (CSS classes, animation library internals). This means tests survive framework or styling changes.

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
