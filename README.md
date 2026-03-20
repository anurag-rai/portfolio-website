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

Requires **Node.js 22+**. See [CONTRIBUTING.md](CONTRIBUTING.md) for full setup, scripts, testing, and development workflow.

```bash
npm ci
npm run dev
```

Open [http://localhost:4321](http://localhost:4321).

## Architecture

The site is a single-page Astro application that outputs fully static HTML at build time. There is zero client-side JavaScript by default -- scripts are only loaded when their corresponding component's `<script>` tag is reached during hydration.

**Islands architecture.** Each component owns its own script block. There is no global client-side router or framework runtime. Animations, the 3D scene, and interactive behaviors are isolated to the components that need them.

**Animation pipeline.** Lenis provides smooth scroll, synced to GSAP's ticker via `gsap.ticker.add()`. ScrollTrigger observes scroll position and drives all reveal animations. This avoids fighting between the scroll library and the animation library -- Lenis controls the scroll, GSAP controls the visuals, and they stay in sync through the shared ticker.

**Three.js lazy-loading.** The hero's 3D wireframe scene is loaded via dynamic `import()` only after a WebGL capability check passes. The preloader waits for a `hero-scene-ready` custom event (with a 5-second timeout fallback) before dismissing, so the 3D scene is guaranteed to be rendered before the user sees the hero.

**Character split animation.** Instead of using GSAP's commercial SplitText plugin, the codebase includes a manual character-splitting implementation in `animations.ts`. Elements with `data-split` have their text content replaced with individual `<span>` elements, each animated with staggered GSAP tweens.

## Project Structure

```
├── astro.config.mjs              # Astro config with Tailwind v4 Vite plugin
├── playwright.config.ts          # Test device matrix (Desktop Chrome, iPhone 14, iPad Mini)
├── tsconfig.json                 # Extends astro/tsconfigs/strict
├── package.json
├── public/
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
└── tests/                        # Playwright E2E tests (see CONTRIBUTING.md)
```

## Design System

All personal data (name, email, social links, bio, skills, timezone) lives in `src/config/site.ts`. Animation and interaction tuning (scroll duration, stagger delays, cursor sizes, preloader timing) lives in `src/config/theme.ts`. Components import from these files rather than hardcoding values.

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
| `Navbar`         | Fixed header that appears after scrolling past the hero (ScrollTrigger). Tracks active section and highlights the corresponding link. Smooth scrolls on click.                                                             | `src/config/site.ts`                             |
| `MobileMenu`     | Full-screen overlay triggered by hamburger button. Animates links with stagger. Closes on link click, Escape key, or overlay click. Locks body scroll while open.                                                          | `src/config/site.ts`                             |
| `About`          | Bio section with paragraphs (character split reveal) and a grid of skill pills (staggered fade-in). Photo placeholder.                                                                                                     | `src/config/site.ts`                             |
| `Experience`     | Vertical timeline powered by `src/data/experience.ts`. Renders `TimelineNode` for each entry. Scroll-synced progress line tracks reading position.                                                                         | `ExperienceEntry[]`                              |
| `TimelineNode`   | Single timeline entry. Shows role, company, formatted date range with calculated duration. Expands to reveal description and tech tags when scrolled into the viewport center.                                             | Props: `entry: ExperienceEntry`, `index: number` |
| `Projects`       | Renders `ProjectCard` for each entry in `src/data/projects.ts`. Cards alternate slide direction (left/right) with parallax on the image placeholder.                                                                       | `ProjectEntry[]`                                 |
| `ProjectCard`    | Single project with title, description, tech tags, and optional Live Site / GitHub links. Even-indexed cards have image on the left; odd-indexed have it on the right.                                                     | Props: `project: ProjectEntry`, `index: number`  |
| `Contact`        | CTA section with "Get In Touch" button that copies email to clipboard (with textarea fallback for older browsers). Shows a toast notification with expanding ring animation. Social icons for GitHub, LinkedIn, and email. | `src/config/site.ts`                             |
| `Footer`         | Copyright line (year set at build time) and live clock. Separated by a gradient `--gradient-earth` line.                                                                                                                   | `Clock` child component                          |
| `Clock`          | Displays current time in the configured timezone, formatted with `Intl.DateTimeFormat`, updated every second.                                                                                                              | `src/config/site.ts`                             |
| `CustomCursor`   | Creates a dot and circle that follow the mouse. Only activates on `pointer: fine` devices. Scales up on hover over links, buttons, and project cards. Hides the native cursor.                                             | `src/scripts/cursor.ts`                          |
| `ScrollProgress` | A 3px-high fixed bar at the top of the viewport with `--gradient-earth` background. Width is scrubbed from 0% to 100% via ScrollTrigger as the user scrolls.                                                               | ScrollTrigger scrub                              |

## Accessibility

- **`prefers-reduced-motion`** -- All animations, transitions, and smooth scroll are disabled when the user's OS setting requests reduced motion.
- **Skip-to-content link** -- A visually hidden link appears at the top of the page on Tab press.
- **Semantic HTML** -- Proper landmark elements and heading hierarchy (single `<h1>`, `<h2>` per section, `<h3>` for entries).
- **WCAG AA contrast** -- All text/background combinations meet WCAG AA contrast ratios.
- **Keyboard navigation** -- All interactive elements are focusable with visible focus rings. The mobile menu closes on Escape.
- **ARIA labels** -- Character-split text preserves the original string in `aria-label`. Social icons and the hamburger button have descriptive labels.
- **External link security** -- All `target="_blank"` links include `rel="noopener noreferrer"`.

## Design Decisions

### Why Astro over Next.js

This is a single-page portfolio with no dynamic data, no API routes, and no client-side routing. Astro outputs static HTML with zero JavaScript by default. Next.js would ship a React runtime, a client-side router, and hydration logic that this site does not need.

### Why GSAP over CSS animations

The site needs scroll-triggered reveals, timeline-coordinated sequences, character-level stagger animation, and scrub-linked progress bars. CSS animations cannot express scroll-position-driven timing or coordinate sequences across multiple elements.

### Why Lenis for smooth scroll

Lenis provides a smooth, momentum-based scroll feel that native `scroll-behavior: smooth` cannot replicate. It syncs with GSAP through the shared ticker, preventing jitter between scroll position and animation state.

### Why Three.js for just the hero

The hero's seven wireframe polyhedra add 3D differentiation to an otherwise 2D page. The performance cost is contained: lazy-loaded via dynamic `import()`, only after a WebGL check, with pixel ratio capped at 2.

### Why CSS custom properties for theming

All colors are defined as CSS custom properties in `global.css`. This keeps the design system framework-agnostic -- the tokens work in Tailwind, inline styles, and raw CSS equally.

### Why behavior-based Playwright tests

Tests assert on observable outcomes (opacity, scroll position, text content), not implementation details (CSS class names, animation library internals). This makes them resilient to CSS refactors or animation library swaps.
