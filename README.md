# Portfolio

A single-page developer portfolio with cinematic scroll animations, a dark monochrome theme with earthy accent colors, and an experience-focused layout. Built with Astro, GSAP, and Three.js.

## Tech Stack

| Tool                                                 | Role                                                     |
| ---------------------------------------------------- | -------------------------------------------------------- |
| [Astro v6](https://astro.build)                      | Static site generator with islands architecture          |
| [Tailwind CSS v4](https://tailwindcss.com)           | Utility-first styling via Vite plugin                    |
| [GSAP](https://gsap.com) + ScrollTrigger             | Scroll-driven animations and timeline coordination       |
| [Lenis](https://lenis.darkroom.engineering)          | Smooth scroll with GSAP ticker sync                      |
| [Three.js](https://threejs.org)                      | 3D wireframe polyhedra in the hero section (lazy-loaded) |
| [Playwright](https://playwright.dev)                 | End-to-end behavior-based testing                        |
| [Manrope](https://fonts.google.com/specimen/Manrope) | Geometric sans-serif typeface (300--800 weights)         |

## Quick Start

### Prerequisites

- **Node.js 22+** (required by Astro v6). If using nvm: `nvm use 22`

### Install and Run

```bash
npm ci           # install exact pinned versions from lock file
npm run dev      # start dev server at localhost:4321
```

Open [http://localhost:4321](http://localhost:4321).

### Build for Production

```bash
npm run build    # outputs to dist/
npm run preview  # preview the production build locally
```

### Scripts Reference

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

To run a single test file:

```bash
npm run test -- tests/contact.spec.ts
```

To run a single test by name:

```bash
npm run test -- -g "copies email to clipboard"
```

To run tests for a specific device only:

```bash
npm run test -- --project="iPhone 14"
```

## Architecture

The site is a single-page Astro application that outputs fully static HTML at build time. There is zero client-side JavaScript by default -- scripts are only loaded when their corresponding component's `<script>` tag is reached during hydration.

**Islands architecture.** Each component owns its own script block. There is no global client-side router or framework runtime. Animations, the 3D scene, and interactive behaviors are isolated to the components that need them.

**Animation pipeline.** Lenis provides smooth scroll, synced to GSAP's ticker via `gsap.ticker.add()`. ScrollTrigger observes scroll position and drives all reveal animations. This avoids fighting between the scroll library and the animation library -- Lenis controls the scroll, GSAP controls the visuals, and they stay in sync through the shared ticker.

**Three.js lazy-loading.** The hero's 3D wireframe scene is loaded via dynamic `import()` only after a WebGL capability check passes. The preloader waits for a `hero-scene-ready` custom event (with a 5-second timeout fallback) before dismissing, so the 3D scene is guaranteed to be rendered before the user sees the hero.

**Character split animation.** Instead of using GSAP's commercial SplitText plugin, the codebase includes a manual character-splitting implementation in `animations.ts`. Elements with `data-split` have their text content replaced with individual `<span>` elements, each animated with staggered GSAP tweens.

## Project Structure

```
portfolio/
├── astro.config.mjs              # Astro config with Tailwind v4 Vite plugin
├── playwright.config.ts          # Test device matrix (Desktop Chrome, iPhone 14, iPad Mini)
├── tsconfig.json                 # Extends astro/tsconfigs/strict
├── package.json
├── public/
│   ├── favicon.ico
│   └── favicon.svg
├── src/
│   ├── config/
│   │   ├── site.ts               # Personal data: name, title, email, social links, nav items
│   │   └── theme.ts              # Animation timings, scroll behavior, cursor settings
│   ├── layouts/
│   │   └── Layout.astro          # Base HTML shell, meta tags, font loading, global script init
│   ├── pages/
│   │   └── index.astro           # Single page composing all section components
│   ├── components/
│   │   ├── Preloader.astro       # Counter 0-100% tracking real asset loading, screen wipe
│   │   ├── Hero.astro            # Full-viewport hero with character stagger animation
│   │   ├── HeroScene.astro       # Three.js mount point with WebGL check and lazy import
│   │   ├── Navbar.astro          # Sticky nav with backdrop blur, active section tracking
│   │   ├── MobileMenu.astro      # Full-screen overlay menu with GSAP-animated hamburger
│   │   ├── About.astro           # Bio paragraphs with text split reveal + skill pills
│   │   ├── Experience.astro      # Vertical timeline with scroll-synced progress bar
│   │   ├── TimelineNode.astro    # Individual timeline entry with expand/collapse on scroll
│   │   ├── Projects.astro        # Project cards with alternating slide-in + parallax images
│   │   ├── ProjectCard.astro     # Individual project card with tech tags and links
│   │   ├── Contact.astro         # CTA button (copies email), social icons, toast notification
│   │   ├── Footer.astro          # Copyright + gradient separator + live clock
│   │   ├── Clock.astro           # Live IST time display, updates every second
│   │   ├── CustomCursor.astro    # Dot + circle cursor, only on pointer:fine devices
│   │   └── ScrollProgress.astro  # Gradient progress bar fixed at top of viewport
│   ├── scripts/
│   │   ├── animations.ts         # Generic data-animate reveal + manual character split
│   │   ├── smooth-scroll.ts      # Lenis init + GSAP ticker sync + ScrollTrigger bridge
│   │   ├── hero-scene.ts         # Three.js scene: 7 wireframe polyhedra with drift + avoidance
│   │   └── cursor.ts             # Custom cursor with hover state scaling
│   ├── styles/
│   │   └── global.css            # CSS custom properties, reset, accessibility utilities
│   └── data/
│       ├── experience.ts         # ExperienceEntry[] with date formatting helpers
│       └── projects.ts           # ProjectEntry[] with optional live/repo URLs
└── tests/
    ├── helpers.ts                # Shared utilities: waitForPreloader, scrollToSection, etc.
    ├── preloader.spec.ts         # Counter display, completion, persistence across reloads
    ├── hero.spec.ts              # Name/subtitle display, viewport height, 3D mount/canvas
    ├── navigation.spec.ts        # Navbar show/hide, link scrolling, mobile menu lifecycle
    ├── about.spec.ts             # Heading, bio, skill pills, photo placeholder
    ├── experience.spec.ts        # Timeline nodes, date formatting, expand on scroll
    ├── projects.spec.ts          # Card rendering, tech tags, external link security
    ├── contact.spec.ts           # Email copy, toast appear/dismiss, social icon labels
    ├── footer.spec.ts            # Copyright year, IST clock format, gradient separator
    ├── scroll-progress.spec.ts   # Width at top/middle/bottom of page
    ├── animations.spec.ts        # Reveal on scroll, replay on scroll back
    ├── accessibility.spec.ts     # Skip link, heading hierarchy, landmarks, keyboard focus
    ├── responsive.spec.ts        # Section presence, layout direction, nav visibility
    └── custom-cursor.spec.ts     # Dot/circle presence on fine pointer, absence on touch
```

## Configuration

Configuration is split into two files under `src/config/`.

### `src/config/site.ts` -- Personal Data

Contains all personal/content data that you would change when forking this for your own portfolio: name, job title, email address, social media URLs, navigation link labels, and meta tag defaults. Components import from this file rather than hardcoding values.

### `src/config/theme.ts` -- Animation and Interaction Tuning

Contains animation timings, scroll behavior parameters, cursor settings, and other visual tuning values. This is where you adjust how the site feels without touching component code. Examples include Lenis scroll duration, GSAP stagger delays, preloader minimum display time, and cursor hover scale factors.

## Design System

### Color Tokens

Defined as CSS custom properties in `src/styles/global.css`. Dark monochrome base with an earthy accent palette.

| Token                | Hex             | Role                                  |
| -------------------- | --------------- | ------------------------------------- |
| `--bg`               | `#0f0f0f`       | Page background                       |
| `--surface`          | `#1a1a1a`       | Cards, nav, elevated surfaces         |
| `--border`           | `#2a2a2a`       | Borders, dividers                     |
| `--text-primary`     | `#ffffff`       | Headings, primary text                |
| `--text-muted`       | `#888888`       | Body text, descriptions               |
| `--text-dim`         | `#808080`       | Subtle text, timestamps, icons        |
| `--accent`           | `#cb997e`       | Primary accent (terracotta)           |
| `--accent-secondary` | `#ddbea9`       | Hover states (peach)                  |
| `--accent-highlight` | `#ffe8d6`       | Emphasis (cream)                      |
| `--accent-sage`      | `#b7b7a4`       | Duration labels (sage)                |
| `--accent-olive`     | `#a5a58d`       | Muted accent (olive)                  |
| `--accent-dark`      | `#6b705c`       | Tag/pill backgrounds (dark olive)     |
| `--gradient-earth`   | linear-gradient | Scroll progress bar, footer separator |

The full gradient: `linear-gradient(to right, #cb997e, #ddbea9, #ffe8d6, #b7b7a4, #a5a58d, #6b705c)`.

### Typography

The site uses [Manrope](https://fonts.google.com/specimen/Manrope), a geometric sans-serif, loaded via Google Fonts with `display=swap`.

| Weight | Usage                                             |
| ------ | ------------------------------------------------- |
| 300    | Subtitle, dates, timestamps, clock                |
| 400    | Body text, nav links                              |
| 500    | Skill pills, tech tags, buttons, toast text       |
| 600    | Nav logo, mobile menu links, timeline role titles |
| 700    | Section headings (h2), project titles (h3)        |
| 800    | Hero name (h1), preloader counter                 |

Font stack: `'Manrope', system-ui, sans-serif`.

### Component Patterns

**`data-animate`** -- Add this attribute to any element for a generic scroll-triggered reveal (fade up from 40px, 0.8s duration). Handled by `initScrollAnimations()` in `animations.ts`.

**`data-split`** -- Add alongside `data-animate` for character-level split text reveal. Each character gets its own `<span>` with staggered opacity and y-position animation. The original text is preserved in an `aria-label` for accessibility.

## Components

| Component        | Purpose                                                                                                                                                                                                                    | Data Source                                      |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `Preloader`      | Tracks real asset loading (fonts, images, window load, Three.js scene) and displays an animated 0-100 counter. Wipes upward on completion and dispatches `preloader-complete` event.                                       | Internal asset tracking                          |
| `Hero`           | Full-viewport intro with character-stagger animation on name and subtitle. Waits for `preloader-complete` before animating. Includes scroll indicator.                                                                     | `src/config/site.ts`                             |
| `HeroScene`      | Mounts a `<canvas>` for Three.js. Checks WebGL support before lazy-importing `hero-scene.ts`. Dispatches `hero-scene-ready` when loaded.                                                                                   | `src/scripts/hero-scene.ts`                      |
| `Navbar`         | Fixed header that appears after scrolling past the hero (ScrollTrigger). Tracks active section and highlights the corresponding link. Smooth scrolls on click.                                                             | Nav links array (frontmatter)                    |
| `MobileMenu`     | Full-screen overlay triggered by hamburger button. Animates links with stagger. Closes on link click, Escape key, or overlay click. Locks body scroll while open.                                                          | Nav links array (frontmatter)                    |
| `About`          | Bio section with two paragraphs (character split reveal) and a grid of skill pills (staggered fade-in). Photo placeholder.                                                                                                 | Skills array (frontmatter)                       |
| `Experience`     | Vertical timeline powered by `src/data/experience.ts`. Renders `TimelineNode` for each entry. Scroll-synced progress line tracks reading position.                                                                         | `ExperienceEntry[]`                              |
| `TimelineNode`   | Single timeline entry. Shows role, company, formatted date range with calculated duration. Expands to reveal description and tech tags when scrolled into the viewport center.                                             | Props: `entry: ExperienceEntry`, `index: number` |
| `Projects`       | Renders `ProjectCard` for each entry in `src/data/projects.ts`. Cards alternate slide direction (left/right) with parallax on the image placeholder.                                                                       | `ProjectEntry[]`                                 |
| `ProjectCard`    | Single project with title, description, tech tags, and optional Live Site / GitHub links. Even-indexed cards have image on the left; odd-indexed have it on the right.                                                     | Props: `project: ProjectEntry`, `index: number`  |
| `Contact`        | CTA section with "Get In Touch" button that copies email to clipboard (with textarea fallback for older browsers). Shows a toast notification with expanding ring animation. Social icons for GitHub, LinkedIn, and email. | Email constant, `src/config/site.ts`             |
| `Footer`         | Copyright line (year set at build time) and live IST clock. Separated by a gradient `--gradient-earth` line.                                                                                                               | `Clock` child component                          |
| `Clock`          | Displays current time in IST (`Asia/Kolkata`), formatted with `Intl.DateTimeFormat`, updated every second.                                                                                                                 | Client-side `Date`                               |
| `CustomCursor`   | Creates a 6px dot and 36px circle that follow the mouse. Only activates on `pointer: fine` devices. Scales up on hover over links, buttons, and project cards. Hides the native cursor.                                    | `src/scripts/cursor.ts`                          |
| `ScrollProgress` | A 3px-high fixed bar at the top of the viewport with `--gradient-earth` background. Width is scrubbed from 0% to 100% via ScrollTrigger as the user scrolls.                                                               | ScrollTrigger scrub                              |

## Customizing Content

To use this as your own portfolio:

1. **Update personal data** in `src/config/site.ts` -- your name, job title, email, and social links.

2. **Replace experience entries** in `src/data/experience.ts`. Each entry follows the `ExperienceEntry` interface:

   ```ts
   {
     role: "Your Job Title",
     company: "Company Name",
     startDate: "2023-05",        // YYYY-MM format
     endDate: null,                // null for "Present"
     description: "What you did.",
     technologies: ["TypeScript", "React"],
   }
   ```

3. **Replace project entries** in `src/data/projects.ts`. Each entry follows the `ProjectEntry` interface:

   ```ts
   {
     title: "Project Name",
     description: "What it does.",
     image: "/images/project-1.jpg",
     technologies: ["TypeScript", "Node.js"],
     liveUrl: "https://example.com",    // optional
     repoUrl: "https://github.com/...", // optional
   }
   ```

4. **Add project images** to `public/images/`. The `image` field in each project entry should reference the path relative to `public/`.

5. **Replace the photo placeholder** in `About.astro` with an actual `<img>` tag or remove it.

6. **Update meta tags** -- the `Layout.astro` component accepts `title` and `description` props. Defaults come from `src/config/site.ts`.

7. **Update the clock timezone** if you are not in IST -- edit the `timeZone` value in `Clock.astro`.

## Adding New Devices to Tests

The device matrix is defined at the top of `playwright.config.ts` in the `TEST_DEVICES` object. To add a new viewport:

```ts
const TEST_DEVICES = {
  "Desktop Chrome": { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 720 } },
  "iPhone 14": devices["iPhone 14"],
  "iPad Mini": devices["iPad Mini"],
  // Add your device:
  "Pixel 7": devices["Pixel 7"],
};
```

Playwright provides built-in device descriptors for common phones and tablets. You can also specify a custom viewport:

```ts
"Custom Laptop": { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
```

After adding a device, all test files automatically run against it -- no other changes needed. The config maps each entry to a Playwright project via `Object.entries(TEST_DEVICES).map(...)`.

## Accessibility

The following accessibility features are built in:

- **`prefers-reduced-motion`** -- All animations, transitions, and smooth scroll are disabled when the user's OS setting requests reduced motion. Lenis is not initialized. GSAP animations are skipped. Content is shown immediately without animation.
- **Skip-to-content link** -- A visually hidden link (`a[href="#main-content"]`) appears at the top of the page on Tab press, allowing keyboard users to bypass the navigation.
- **Semantic HTML** -- Proper landmark elements (`<header>`, `<nav>`, `<main>`, `<footer>`) and heading hierarchy (single `<h1>`, `<h2>` per section, `<h3>` for entries).
- **WCAG AA contrast** -- All text/background combinations meet WCAG AA contrast ratios.
- **Keyboard navigation** -- All interactive elements are focusable with visible `2px solid var(--accent)` focus rings via `:focus-visible`. The mobile menu closes on Escape. Tab order follows document flow.
- **ARIA labels** -- Character-split text preserves the original string in `aria-label` with individual spans marked `aria-hidden="true"`. Social icons and the hamburger button have descriptive `aria-label` attributes. The hamburger toggle uses `aria-expanded`.
- **External link security** -- All `target="_blank"` links include `rel="noopener noreferrer"`.

## Performance

- **Static output** -- Astro builds to fully static HTML/CSS/JS. No server runtime. No client-side framework shipped by default.
- **Three.js lazy-loading** -- The hero scene (Three.js + wireframe geometry) is loaded via dynamic `import()` only after a WebGL capability check. If WebGL is unavailable, the import never fires.
- **Pixel ratio capping** -- The Three.js renderer caps `devicePixelRatio` at 2 to avoid rendering at 3x on high-DPI mobile screens.
- **Font loading** -- Manrope is loaded from Google Fonts with `display=swap` and `<link rel="preconnect">` for both `fonts.googleapis.com` and `fonts.gstatic.com`.
- **Scroll animation efficiency** -- All scroll-triggered animations use GSAP ScrollTrigger with `toggleActions: "restart reverse restart reverse"`, meaning animations reverse when scrolled away rather than accumulating.
- **Custom cursor guard** -- The custom cursor only initializes on devices with `pointer: fine` (mice/trackpads), avoiding unnecessary DOM and rAF overhead on touch devices.

## Testing

### Setup

```bash
npm ci
npx playwright install chromium
```

### Running Tests

Start the dev server, then run tests in a separate terminal:

```bash
# Terminal 1
npm run dev

# Terminal 2
npm run test
```

See the Scripts Reference section above for running single tests, specific devices, and debug mode.

### Device Matrix

Tests run against three device profiles defined in `playwright.config.ts`:

| Device         | Viewport   | Type                   |
| -------------- | ---------- | ---------------------- |
| Desktop Chrome | 1280 x 720 | Desktop, pointer: fine |
| iPhone 14      | 390 x 844  | Mobile, touch          |
| iPad Mini      | 768 x 1024 | Tablet, touch          |

### What's Tested

| Test File                 | Coverage                                                                                                                                    |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `preloader.spec.ts`       | Counter display and completion, persistence across reloads                                                                                  |
| `hero.spec.ts`            | Name/subtitle visibility, full-viewport height, 3D canvas mount                                                                             |
| `navigation.spec.ts`      | Navbar show/hide on scroll, link scrolling to sections, Home link, mobile menu open/close/Escape, link navigation + close, body scroll lock |
| `about.spec.ts`           | Section heading, bio paragraphs, skill pill count and content, photo placeholder                                                            |
| `experience.spec.ts`      | Timeline node count, role/date/duration format, progress bar, expand on scroll                                                              |
| `projects.spec.ts`        | Card count, title/description/tech tags, external link `rel` attributes                                                                     |
| `contact.spec.ts`         | Email copy to clipboard, toast appear/dismiss timing, social icon labels and SVGs                                                           |
| `footer.spec.ts`          | Copyright year, IST clock format and update, gradient separator                                                                             |
| `scroll-progress.spec.ts` | Width at top (near 0), growth on scroll, near-full at bottom                                                                                |
| `animations.spec.ts`      | Elements animate in on scroll, animations replay when scrolling back                                                                        |
| `accessibility.spec.ts`   | Skip link, heading hierarchy, semantic landmarks, keyboard focus progression, image alt attributes, external link `rel` security            |
| `responsive.spec.ts`      | All sections present, About layout direction change, desktop nav vs hamburger visibility                                                    |
| `custom-cursor.spec.ts`   | Dot/circle presence on fine-pointer devices, absence on touch, native cursor hidden                                                         |

Tests are behavior-based -- they assert on visible outcomes (opacity, position, text content, DOM presence) rather than implementation details (CSS class names, animation library internals). This makes them resilient to CSS refactors or animation library swaps.

## Deployment

The site builds to static files in `dist/` and works with any static hosting provider.

### Vercel

```bash
npx vercel --prod
```

Or connect the repository in the Vercel dashboard. Astro is auto-detected. No configuration needed.

### Netlify

Connect the repository in the Netlify dashboard with these build settings:

| Setting           | Value                                                  |
| ----------------- | ------------------------------------------------------ |
| Build command     | `npm run build`                                        |
| Publish directory | `dist`                                                 |
| Node version      | `22` (set in environment variables or `.node-version`) |

### Other Providers

Any provider that can run `npm run build` and serve the `dist/` directory will work (Cloudflare Pages, GitHub Pages, AWS S3 + CloudFront, etc.).

## Design Decisions

### Why Astro over Next.js

This is a single-page portfolio with no dynamic data, no API routes, and no client-side routing. Astro outputs static HTML with zero JavaScript by default. Scripts are only loaded where components explicitly include `<script>` tags (islands architecture). Next.js would ship a React runtime, a client-side router, and hydration logic that this site does not need.

### Why GSAP over CSS animations

The site needs scroll-triggered reveals, timeline-coordinated sequences (preloader finishes, then hero text staggers, then scroll indicator fades in), character-level stagger animation, and scrub-linked progress bars. CSS animations cannot express scroll-position-driven timing or coordinate sequences across multiple elements. GSAP's ScrollTrigger and timeline API handle all of these with a single, consistent programming model.

### Why Lenis for smooth scroll

Lenis provides a smooth, momentum-based scroll feel that the browser's native `scroll-behavior: smooth` cannot replicate. Critically, Lenis syncs with GSAP through `gsap.ticker.add()`, ensuring that Lenis's interpolated scroll position and GSAP's ScrollTrigger calculations use the same frame timing. Without this sync, scroll-driven animations would jitter or lag behind the actual scroll position.

### Why Three.js for just the hero

The hero section uses seven wireframe polyhedra (tetrahedron through icosahedron) that drift with sine-wave idle motion and respond to cursor position (desktop) or device tilt (mobile). This adds 3D differentiation to an otherwise 2D page. The performance cost is contained: Three.js is lazy-loaded via dynamic `import()`, only after a WebGL check passes, and the renderer caps pixel ratio at 2. The rest of the site is pure CSS and GSAP.

### Why CSS custom properties for theming

All colors are defined as CSS custom properties (`--bg`, `--accent`, etc.) in `global.css`. This keeps the design system framework-agnostic -- the tokens work in Tailwind utility classes (`text-[var(--accent)]`), inline styles, and raw CSS equally. Extracting to a theme config file is straightforward because the source of truth is the CSS layer, not a JavaScript theme object.

### Why behavior-based Playwright tests

Tests assert on observable outcomes: "the navbar has opacity >= 0.9 after scrolling past the hero", not "the navbar has class `is-visible`". This means the tests survive CSS refactors, animation library swaps, and markup restructuring as long as the user-facing behavior stays the same. The test device matrix (Desktop Chrome, iPhone 14, iPad Mini) catches responsive breakpoint issues without duplicating test logic -- the same specs run on all viewports with conditional branches for mobile-specific behavior.
