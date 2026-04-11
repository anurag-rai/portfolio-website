# Performance Audit — 2026-04-11

## Methodology

### Before/After measurement

GitHub Actions is the single source of truth for before/after comparison:

- **Before** = the CI Lighthouse run on the commit that adds the Lighthouse CI job (no site changes)
- **After** = the CI Lighthouse run on the commit with performance improvements
- Same Ubuntu runner, same Chrome, same localhost — perfectly controlled

Supplementary local/live-site tests are informational only.

### Tools

| Tool                        | What it measures                          | Where it runs                                       |
| --------------------------- | ----------------------------------------- | --------------------------------------------------- |
| Lighthouse CI (`@lhci/cli`) | Performance score, FCP, LCP, TBT, CLS, SI | GitHub Actions (mobile + desktop, median of 3 runs) |
| Build analysis              | Per-chunk sizes (raw + brotli)            | Local (deterministic)                               |
| curl + HTTP headers         | CDN behavior, compression, cache policy   | Against live site                                   |

### Metrics tracked

Lighthouse (from CI):
Performance score, First Contentful Paint (FCP), Largest Contentful Paint (LCP),
Total Blocking Time (TBT), Cumulative Layout Shift (CLS), Speed Index (SI)

Static analysis (deterministic):
Total JS/CSS transfer size (brotli), total page weight, request count, per-chunk build sizes

### CrUX (field data)

Not available. CrUX requires sufficient traffic volume to report data. As a personal portfolio,
`anuragrai.in` does not meet the threshold.

---

## Infrastructure

| Property    | Value                                                       |
| ----------- | ----------------------------------------------------------- |
| Hosting     | DigitalOcean App Platform (static)                          |
| CDN         | Cloudflare (edge PoPs worldwide)                            |
| Compression | Brotli (via Cloudflare, confirmed)                          |
| HTTP/2      | Yes (`HTTP/2 200` in response headers)                      |
| Framework   | Astro 6.0.6 (static SSG, zero client-side JS by default)    |
| Styling     | Tailwind CSS v4 via Vite plugin                             |
| Animation   | GSAP 3.14.2 + ScrollTrigger + Lenis 1.3.19                  |
| 3D          | Three.js 0.183.2 (lazy-loaded after WebGL check)            |
| Fonts       | Google Fonts — Manrope, 6 weights (300–800), `display=swap` |

---

## Baseline: Lighthouse CI scores

CI run: `24282941348` (commit `45cef66`, 2026-04-11)

### Mobile (median of 3 runs)

| Metric      | Score   | Notes                                           |
| ----------- | ------- | ----------------------------------------------- |
| Performance | **85**  | Yellow range (75-89)                            |
| FCP         | 2,286ms | First paint delayed by render-blocking font CSS |
| LCP         | 2,286ms | Same element as FCP (text-based LCP)            |
| TBT         | 421ms   | Three.js parse/compile on throttled mobile CPU  |
| CLS         | 0.003   | Excellent — near zero layout shift              |
| Speed Index | 2,581ms | Consistent with FCP delay                       |

### Desktop (median of 3 runs)

| Metric      | Score  | Notes                               |
| ----------- | ------ | ----------------------------------- |
| Performance | **99** | Near-perfect on unthrottled desktop |
| FCP         | 638ms  | Fast — no CPU/network throttling    |
| LCP         | 638ms  | Same element as FCP                 |
| TBT         | 33ms   | Minimal blocking — fast CPU         |
| CLS         | 0.003  | Same as mobile — layout is stable   |
| Speed Index | 788ms  | Fast visual progression             |

---

## Baseline: Build output (static analysis)

Build date: 2026-04-11. Astro 6.0.6, Node 22.

### JavaScript chunks

| Chunk                 | Contents                               |         Raw |      Brotli | % of total JS |
| --------------------- | -------------------------------------- | ----------: | ----------: | ------------: |
| `hero-scene.*.js`     | Three.js + hero scene                  |     521,066 |     109,423 |         77.6% |
| `index.*.js`          | GSAP core                              |      69,893 |      24,824 |         10.4% |
| `ScrollTrigger.*.js`  | GSAP ScrollTrigger plugin              |      43,193 |      16,248 |          6.4% |
| `Layout.*.js`         | Lenis + smooth scroll + animation init |      17,813 |       4,676 |          2.7% |
| `Preloader.*.js`      | Preloader logic + GSAP import          |       3,344 |       1,290 |          0.5% |
| `FooterGrass.*.js`    | Procedural grass canvas                |       2,131 |       1,008 |          0.3% |
| `toast.*.js`          | Toast notification system              |       2,086 |         814 |          0.3% |
| `HeroScene.*.js`      | Dynamic import loader for Three.js     |       1,694 |         768 |          0.3% |
| `animations.*.js`     | Generic scroll-triggered reveals       |       1,556 |         504 |          0.2% |
| `theme.*.js`          | Theme config module                    |       1,053 |         540 |          0.2% |
| `Hero.*.js`           | Hero section script                    |       1,512 |         509 |          0.2% |
| `CustomCursor.*.js`   | Dot + circle cursor                    |       1,487 |         536 |          0.2% |
| `Experience.*.js`     | Timeline section                       |       1,390 |         477 |          0.2% |
| `MobileMenu.*.js`     | Full-screen menu                       |       1,343 |         487 |          0.2% |
| `Navbar.*.js`         | Sticky nav                             |         959 |         451 |          0.1% |
| `Contact.*.js`        | Email copy + social links              |         651 |         343 |          0.1% |
| `About.*.js`          | About section                          |         472 |         284 |          0.1% |
| `ScrollProgress.*.js` | Scroll progress bar                    |         244 |         167 |         <0.1% |
| **Total JS**          |                                        | **671,887** | **163,349** |      **100%** |

### CSS

| File                                    |    Raw | Brotli |
| --------------------------------------- | -----: | -----: |
| `index@_@astro.*.css` (Tailwind output) | 21,877 |  4,504 |

### HTML

| File         |    Raw | Brotli |
| ------------ | -----: | -----: |
| `index.html` | 29,244 |  5,416 |

### Total page weight (first load)

| Category                     | Brotli transfer |         Raw |
| ---------------------------- | --------------: | ----------: |
| HTML                         |           5,416 |      29,244 |
| CSS                          |           4,504 |      21,877 |
| JS (initial, excl. Three.js) |          53,926 |     150,821 |
| JS (Three.js, lazy)          |         109,423 |     521,066 |
| **Total**                    |     **173,269** | **723,008** |

Note: Three.js is dynamically imported after WebGL check — it does not block initial render.
The "initial JS" figure is the sum of all chunks except `hero-scene.*.js` and `theme.*.js` (loaded with it).

### Request count

| Type                                  |     Count |
| ------------------------------------- | --------: |
| HTML                                  |         1 |
| CSS                                   |         1 |
| JS (initial)                          |        16 |
| JS (lazy, Three.js + theme)           |         2 |
| Google Fonts CSS                      |         1 |
| Font files (woff2, varies by browser) |       1–6 |
| **Total**                             | **22–27** |

---

## CDN and caching audit

### Cache headers

```
cache-control: public,max-age=10,s-maxage=86400
```

**Problem:** All assets — including content-hashed `/_astro/*.js` and `/_astro/*.css` files — have
`max-age=10` (browser cache: 10 seconds). This means every return visit re-validates every asset.

Content-hashed assets are safe to cache forever because the hash changes when the content changes.
The correct header for hashed assets would be `max-age=31536000, immutable`.

This is likely a DigitalOcean App Platform default. Fixing it requires either:

- Configuring custom headers in DO App Platform (if supported)
- Adding a Cloudflare Page Rule or Transform Rule to override `Cache-Control` for `/_astro/*` paths

**Impact:** High for repeat visitors. No impact on first visit (Lighthouse).

### Compression

Brotli is active via Cloudflare (`content-encoding: br`). This is optimal — no action needed.

### HTTP/2

Active. Multiplexed connections eliminate the need to worry about request count
for assets on the same domain.

---

## Font loading analysis

### Current setup

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap"
  rel="stylesheet"
/>
```

### Issues

1. **Render-blocking CSS**: The Google Fonts `<link rel="stylesheet">` is render-blocking.
   The browser must download and parse the CSS before first paint.

2. **Third-party dependency**: Loading fonts from `fonts.googleapis.com` adds:
   - DNS lookup for `fonts.googleapis.com`
   - TLS handshake for `fonts.googleapis.com`
   - CSS download from `fonts.googleapis.com`
   - DNS lookup for `fonts.gstatic.com`
   - TLS handshake for `fonts.gstatic.com`
   - Font file downloads from `fonts.gstatic.com`

   Even with preconnect, this is 2 extra origins vs self-hosted (0 extra origins).

3. **6 weights loaded**: The site loads weights 300–800 (6 weights). Each weight is a
   separate woff2 file for the Latin subset. Only the subsets the browser needs are
   downloaded (good), but 6 weight files for Latin is ~75KB total.

### Recommendation

Self-host the font: download Manrope woff2 files into `public/fonts/`, write `@font-face` rules in CSS,
and `<link rel="preload">` the most critical weight (400 or 800). This eliminates all third-party
overhead and the render-blocking external stylesheet.

Reduce weight range if possible. Check which weights are actually used:

| Weight | Usage                                    | Verdict                          |
| ------ | ---------------------------------------- | -------------------------------- |
| 300    | Subtitle, dates, timestamps, clock       | Keep                             |
| 400    | Body text, nav links                     | Keep (primary)                   |
| 500    | Skill pills, tech tags, buttons, toast   | Consider merging with 400 or 600 |
| 600    | Nav logo, mobile menu links, role titles | Keep                             |
| 700    | Section headings, project titles         | Keep                             |
| 800    | Hero name, preloader counter             | Keep                             |

Reducing from 6 to 4-5 weights would save 12-25KB. However, all 6 are actively used in the design,
so this should be a design decision.

---

## Issues ranked by impact

### 1. Three.js bundle size — HIGH

**Problem:** `hero-scene.*.js` is 521KB raw / 109KB brotli — 77.6% of all JavaScript.

**Why it matters:** Even though it's lazy-loaded (good), it still:

- Competes for bandwidth with other resources during/after initial load
- Must be fully downloaded before the hero 3D scene renders
- The preloader waits up to 5 seconds for it

**Options:**

- **Tree-shake Three.js imports**: Only import what the scene uses (WebGLRenderer, Scene, Camera,
  geometry classes, materials). Astro/Vite should already tree-shake, but Three.js has historically
  been hard to tree-shake due to side effects. Verify with `import { ... } from 'three'` only.
- **Use a lighter 3D alternative**: Libraries like `ogl` (~30KB) can render wireframe polyhedra.
  This would be a significant rewrite of `hero-scene.ts`.
- **Reduce geometry complexity**: Fewer polyhedra or simpler shapes = less code.
- **Accept it**: 109KB brotli for a 3D scene is not unreasonable. It only loads when WebGL is available
  and does not block initial render.

**Estimated impact:** Reducing Three.js to a minimal import could save 200-400KB raw.

### 2. Cache headers for hashed assets — HIGH

**Problem:** `max-age=10` on `/_astro/*` content-hashed files.

**Why it matters:** Every return visit re-downloads everything. With proper caching, repeat visits
would transfer 0 bytes for unchanged assets.

**Fix:** Configure Cloudflare or DO App Platform to serve `/_astro/*` with
`Cache-Control: public, max-age=31536000, immutable`.

**Estimated impact:** Eliminates all asset transfer on repeat visits (~170KB brotli saved).

### 3. Font loading — MEDIUM

**Problem:** External, render-blocking Google Fonts stylesheet.

**Fix:** Self-host fonts in `public/fonts/`, replace external `<link>` with inline `@font-face`,
add `<link rel="preload">` for primary weight.

**Estimated impact:** Eliminates 2 third-party origins, removes render-blocking CSS, saves ~100-200ms
on FCP in real-world conditions.

### 4. No performance CI — MEDIUM (being fixed in this audit)

**Problem:** No automated performance tracking. Regressions go unnoticed.

**Fix:** Lighthouse CI in GitHub Actions (implemented as part of this audit).

### 5. GSAP + ScrollTrigger bundle — LOW

**Problem:** GSAP core (70KB) + ScrollTrigger (43KB) = 113KB raw / 41KB brotli.

**Why it's low priority:** GSAP is essential for the animation pipeline (scroll-driven reveals,
timeline coordination, character stagger). There is no lighter alternative that provides
equivalent functionality. The bundle size is reasonable for what it delivers.

**No action recommended** unless animations are simplified.

---

## Before vs After comparison

> This section will be filled in after Phase 2 improvements are implemented and the CI runs.

### Lighthouse CI scores

| Metric      | Before (mobile) | After (mobile) | Delta |
| ----------- | --------------- | -------------- | ----- |
| Performance | 85              |                |       |
| FCP         | 2,286ms         |                |       |
| LCP         | 2,286ms         |                |       |
| TBT         | 421ms           |                |       |
| CLS         | 0.003           |                |       |
| Speed Index | 2,581ms         |                |       |

| Metric      | Before (desktop) | After (desktop) | Delta |
| ----------- | ---------------- | --------------- | ----- |
| Performance | 99               |                 |       |
| FCP         | 638ms            |                 |       |
| LCP         | 638ms            |                 |       |
| TBT         | 33ms             |                 |       |
| CLS         | 0.003            |                 |       |
| Speed Index | 788ms            |                 |       |

### Build output

| Metric                     | Before  | After | Delta |
| -------------------------- | ------- | ----- | ----- |
| Total JS (brotli)          | 163,349 |       |       |
| Total CSS (brotli)         | 4,504   |       |       |
| Total page weight (brotli) | 173,269 |       |       |
| hero-scene chunk (brotli)  | 109,423 |       |       |
| Request count              | 22–27   |       |       |
