# AGENTS.md

Static portfolio site. No build, no package manager, no tests, no lint, no CI.

## Structure

- `index.html`, `about.html`, `projects.html`, `contact.html` — standalone pages, no templating. Header/nav/footer markup is duplicated in each file; any change to it must be repeated in all 4.
- `404.html`, `favicon.svg`, `robots.txt` — error page, brand mark, crawler allow. Keep asset refs relative.
- `public/` — project screenshots with semantic names (`agendia-desktop.png`, `ctrlx-mobile.png`, …) + profile photos (`foto_perfil*.png`: original, 3D, blocos, papel) shown in the `cycler`. Shown only on `projects.html`/`index.html`/`about.html` as dossiers/portraits. Keep paths relative; add `loading="lazy"` (eager only for first paint) + descriptive `alt` to new images.
- `public/*semfundo.webp` — the 4 background-removed cutouts cycled in the `index.html` hero. **Never edit these directly**: they are derived, not authored. Source of truth is the matching full-background photo (`foto_perfil.png`, `foto_perfil_3d.png`, `foto_perfil_bloco.png`, `foto_perfil_papel.png`). To regenerate after changing a source: take the old `*semfundo.png` alpha channel, `Lanczos`-resize it to the target square, and merge it onto the RGB source — then save WebP `quality=88, alpha_quality=100`, capped at the source's native size (never upscale the photo). Target `min(1600, native)` because the hero renders the photo up to 840px CSS wide (2× for retina). The hero's `aspect-ratio: 353/409` assumes the subject bbox stays at x 27–97%, y 20–100% — re-measure if a source photo changes.
  - `foto_perfil_semfundo.webp` needs a baked-in tone grade — the raw `foto_perfil.png` only spans luminance 26–216 (no true black or white), so it reads washed out next to the other three. Grade it with a **levels stretch + soft S-curve, not a per-channel offset LUT**: an offset LUT (`R +7.4, G −4.9, B −14.2`) pushes blue down and turns skin orange-red while *lifting* the black point (red channel 51→62), which is the "perdeu o preto" failure. Correct order: `levels(black=14, white=218)` → `S-curve(amplitude 0.20)` → `ImageEnhance.Color(1.30)` → `UnsharpMask(radius=0.9, percent=95, threshold=2)` → WebP `quality=94`. Saturation must be applied around luminance (not per channel) so it doesn't shift the white balance. Result: shadows 30→16, highlights 210→214, dynamic range 181→198, saturation 18.4%→34% — in line with `3d` (31.7%) and `bloco` (36.6%). **Bake tone into the file; a CSS `filter:` would also work but adds a per-frame compositing cost.**
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
