# AGENTS.md

Static portfolio site. No build, no package manager, no tests, no lint, no CI.

## Structure

- `index.html`, `about.html`, `projects.html`, `contact.html` — standalone pages, no templating. Header/nav/footer markup is duplicated in each file; any change to it must be repeated in all 4.
- `404.html`, `favicon.svg`, `robots.txt` — error page, brand mark, crawler allow. Keep asset refs relative.
- `public/` — project screenshots with semantic names (`agendia-desktop.png`, `ctrlx-mobile.png`, …) + 4 profile photos (`foto_perfil*.png`: original, 3D, blocos, papel) shown in the `cycler`. Shown only on `projects.html`/`index.html`/`about.html` as dossiers/portraits. Keep paths relative; add `loading="lazy"` (eager only for first paint) + descriptive `alt` to new images.
- `styles.css` — single shared design system (tokens → base → layout → components). Identity: poster-style young/soft (`#141414` + vivid red `#EE2B2B` + white), Anton condensed display + Inter body, red disc behind portraits, red pill buttons; photo `cycler` (`data-cycler`, 3s auto + click, pauses on hover/focus, still with `prefers-reduced-motion`); all motion expo-out `cubic-bezier(0.16, 1, 0.3, 1)`.
- `script.js` — single shared script, loaded via `<script src="script.js"></script>` at end of `<body>` on every page.
- `README.md` — profile content, not site content. Site copy lives in the HTML files.

## Run / preview

No dev server configured. Preview with any static server, e.g. `python3 -m http.server` in repo root. Open via `http://localhost:8000/index.html`, not `file://` (nav-active logic in `script.js` uses `window.location.pathname`).

## Conventions (script.js ↔ HTML contract)

- `data-reveal` — element starts hidden and `script.js` adds `.visible` via IntersectionObserver (skipped when `prefers-reduced-motion`). Safety net: a 1.5s timer force-reveals leftovers, and a `<noscript>` style in each page reveals everything with JS off. New sections must include `data-reveal` or pair with a visible fallback.
- `data-year` — footer year auto-filled by `script.js`. Keep the `<span data-year>` in footers.
- `data-copy` — copy-to-clipboard button value (contact page). JS restores the label after ~1.6s.
- Carousel (`projects.html`): `data-carousel-track` + 3 `carousel-slide`s (web / `#ia` / `#laboratorio`), `data-carousel-prev/next/dot`, `data-carousel-current` counter. Deep anchors map to slides (`#ia`→1, `#laboratorio`→2, dossiers→0); keyboard ←/→ works when focus is inside.
- Nav active state is set two ways: hardcoded `class="is-active"` in each page's `.main-nav` link AND runtime matching in `script.js` (`href` vs URL filename, applied to `.main-nav a` and `.mobile-nav a`). When adding a page, set the hardcoded class and use a plain relative `href` (`page.html`) so the JS matches.
- `.mobile-nav` + `.menu-toggle` must stay paired (`aria-controls="menu-mobile"`); `script.js` wires them by class name and closes on link click / Escape.
- Header scroll style depends on `.site-header` + `.is-scrolled`.
- Responsive breakpoints: `900px` (nav → hamburger, grids → 1 col), `560px` (stacked buttons). Check both when touching layout.
- Pages are `lang="pt-BR"`. Keep copy in Portuguese.

## Deploy

Static hosting via GitHub Pages (see badge link in `README.md`). Push to `main` serves from repo root; keep all asset paths relative (`styles.css`, `script.js`, `*.html`) with no leading `/`.

## Git

Never run `git commit`, `git push`, or any other git command on your own. Only run git commands when the user explicitly asks.
