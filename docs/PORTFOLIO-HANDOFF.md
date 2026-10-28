# Portfolio handoff — start here

Updated 28 October 2026. Release **v3.3.20**. Owner: **Konrad Sroka**.

## Start a new session

Read this document, then inspect the latest repository and supplied files. Do not rebuild from an older screenshot, memory or HTML checkpoint. Preserve the approved design and change only the requested details. The repository is authoritative after publication; a newer explicitly supplied local file takes precedence for an edit.

- Live: https://konradbuilds.github.io/
- Repository: https://github.com/konradbuilds/konradbuilds.github.io
- Branch: `main`; GitHub Pages serves the repository root.
- Standalone page: root `index.html`. The matching downloadable file is `portfolio-v3.3.20.html`.
- Current source and assets: the latest `main` commit in this repository.
- This document: `docs/PORTFOLIO-HANDOFF.md`; also saved separately for easy discovery.
- Older bird demos and HTML versions are checkpoints, not additional production pages.

Suggested opening request: “Read PORTFOLIO-HANDOFF.md and the latest portfolio files. Continue from that build; preserve the approved motion and browser fallbacks.”

## What the site should feel like

Personal, indie, precise, organic and funny. Strong design/development work should carry the hiring story. Avoid inflated claims, defensive AI copy or effects that compete with reading. Keep the original scruffy bird identity, backwards cap and long beak; do not substitute a generic mascot. The footer trio is the approved owl/flamingo/rooster group, inline SVG.

Key colours: apricot `#ffb18c` for the opening and sky, purple background `#371858`, purple text `#361f54`, paper `#fbfaf8`, ink `#14161a`. Standard buttons use the existing apricot accent variables. Contact heading and bird are ink, not purple. Contact Send is apricot with ink text.

Preserve the first-fold dot zoom, purple hero, floating words, apricot curtain, clouds, rooftop birds and later sidebar. The title reaches zoom 1, holds for 50px of scrolling, then falls apart. The curtain follows with the approved overlap. The bubble's earlier gentler bend was restored; do not reintroduce the faster, stronger v3.3.06 bend.

First visits favour scrolling. Returning visits reveal edge shortcuts to client projects and Download CV. One localStorage flag controls this; blocked storage keeps shortcuts hidden. Both bottom shortcut links sit 20px above the visible screen bottom on desktop and mobile. Mobile adds only the browser toolbar gap, without extra safe-area padding. CV opens a new tab. Project skipping uses a brief dark fade, instant jump and keyboard-focus transfer. No imposed scroll-speed control.

## Current source and build

- `src/index.html`: markup and inline SVG, with BUILD placeholders.
- `src/styles.css`: ordered cascade and compatibility fallbacks.
- `src/js/`: ordered scripts. Inspect actual filenames before editing.
- `build.mjs`: inserts sources into standalone HTML and updates the displayed KB estimate.
- `dist/index.html`: generated output. Copy this to root `index.html` for publication.
- `assets/`: repository images and other assets; keep their paths intact.
- `tests/`: reproducible Playwright checks.
- `docs/architecture.md`, `docs/verification.md`: engineering notes and test limits.

Run `node build.mjs` after edits. The build itself has no dependencies or network requirement. Playwright is a development-only dependency. Do not hand-edit generated HTML and leave source out of sync. Avoid broad CSS reordering: older-browser fallbacks depend on the cascade.

## Motion and performance rules

The intro uses measured sticky-stage height, not the changing visible `innerHeight`, for zoom/curtain geometry. This prevents Chrome mobile's collapsing address bar from bouncing the zoom. Width/orientation/layout changes still remeasure. Returning shortcuts have a separate toolbar inset.

Keep the shared scheduler and cached DOM writes. Completed/invisible effects stop updating. Avoid forced 3D layers, enormous text raster surfaces, blur/shadow effects, repeated layout reads and permanent `will-change`. No Three.js or framework rewrite is needed.

The power controller pauses most decoration after 10 seconds idle and all decoration in hidden tabs. Visible rooftop interactions, clocks and ticker retain their approved idle behaviour. Sidebar sonar also keeps running while visible. Offscreen decoration pauses through visibility observers. Never queue a backlog to replay when a tab returns.

Sidebar availability LED retains `blink`/`sonar` at 2.6 seconds, with the original sonar delay of -0.65s. The bolt has a softer static 2px glow and a six-second opacity pulse. Its SVG overflow is visible. Hidden/offscreen and reduced-motion paths are preserved.

## Contact bird and form

`src/js/12-contact-bird.js` controls a local, finite animation. No permanent bird render loop.

- A small original head peeks vertically from behind the email field, clipped at the field's top edge.
- Window: 88px wide, 80px high, centred at 60% of the field width. Bird is lowered 30px inside that window.
- Final outline: ink. Section top padding: 64px. Form margin-top: 45px. Bottom padding: original responsive value plus 20px.
- Entry: 440ms, lateral arc, tilt and a few pixels of overshoot; retreat: 480ms.
- A brief eye-roll settles into centred eye contact. Desktop mouse tracking eases only the pupils.
- Tracking listeners attach only while looking, visible and using a fine pointer. They detach when parked, offscreen, reduced motion or tab hidden. After the pointer settles, frame updates stop.
- Touch retains eye contact. Reduced motion uses a static pose.
- Confirmed submission triggers the staggered wink and slower, unhurried exit; pointer tracking does not override it.
- New movement cancels the previous frame chain rather than accumulating work.

Formspree remains the existing native POST fallback. Enhanced submission prevents duplicate pending sends, announces status, preserves failed drafts and aborts stalled requests after 20 seconds where supported. Only HTTP success earns the wink. **Never send real contact messages during QA. Intercept/mock success and failure.**

## Browser and accessibility boundaries

Legacy Safari 13.1.3 and Opera 75 were important targets in earlier work. Preserve plain CSS fallbacks before `clamp`, explicit positioning/centering, native image selection and solid text paint. Photos use native `picture` WebP sources with JPEG `img` fallbacks. Keep width/height, alt text and lazy-loading priorities.

Latest tests are Chromium 153, not certification of every old browser. Playwright WebKit is not native Safari 13. Be precise about what actually ran. No new native Safari, Opera or Firefox certification was made for the contact revisions.

Keep semantic buttons, keyboard activation and focus outlines, reduced motion, no-JS content and form behaviour, accessible status messages, decoration aria-hidden, usable touch targets and no horizontal overflow. The opening arrow is a 54×54px button with 3px padding; SVG itself ignores pointer events. The transparent shortcut row ignores pointer events while its links remain clickable, so its middle gap cannot block the arrow. Avatar's opening apricot border is 2px.

Useful checks: `npm test`, `npm run test:contact`, `npm run test:gaze`, `npm run test:mobile`, `npm run test:images`. Install the Playwright engines being tested. Optional `TEST_CHROMIUM_PATH`, `TEST_CHROMIUM_ARGS` and `TEST_ENGINES` select available runtimes. Do not report an engine as passed if it was unavailable.

## Copy and content decisions

- Client tags describe concrete responsibilities; PCO support/Help Scout sentence has a separate, always-visible paragraph.
- PCO 41.9% opens refers to the full email sequence averaged over ten years. Do not invent new metrics.
- Mirror Mirror: Konrad led development/design with collaborators; the other developer wrote the term-matching code. Do not imply solo implementation or guarantee legal compliance.
- AI section is short, with Claude and ChatGPT named in plain text. No tool logos.
- “One hire instead of three” and the dream-team note are approved wording.
- Sustainability has no cigarette equivalences and no numeric global-average claim. Wholegrain Digital is credited as one of the pioneers, not the exclusive first.
- OG image is the existing lightweight baseline JPEG `assets/img/og-whatsapp-v3.jpg`, 1200×630, about 157KB. Do not revert to the larger PNG; WhatsApp may retain its own cache independently of the browser.

## How to work with Konrad

Replies should be short, direct and easy to scan. Show a usable file early when a task is staged. Give meaningful progress updates; do not burn a long turn on optional polishing before delivering anything.

Make surgical changes. Keep approved design/functionality unless an actual defect requires a fix. Explain a meaningful tradeoff briefly. Never bluff browser tests, live deployment, saved files or exact reproduction of artwork.

For each change: inspect the current source; edit the source; build; run checks proportionate to the risk; visually review affected phone/desktop layouts; deliver one full HTML clearly labelled. Local previews precede publication unless Konrad explicitly asks to push. When asked to push, update source and generated HTML together, preserve unrelated assets, use a branch-head lease, wait for Pages deployment and compare the live page with the intended bytes.

Save requested deliverables and handoff updates persistently. Explain where the usable result is and whether Konrad needs to do anything. Do not claim that a new chat will automatically read documents: point it to this handoff and the latest files.

## Session result and next work

Completed: contact bird identity/animation/gaze, form response behaviour, mobile intro stability, return controls, top-bird retraction, project pills and PCO paragraph, tightened contact spacing, restored sidebar sonar/softer bolt, opening arrow hit area and 2px avatar border. Latest root HTML and source are v3.3.20.

No pending redesign is implied. Future wording fine-tuning and any new technical case-study detail need a specific request and real information. A suggested, unbuilt idea was revealing one technical decision/tradeoff through project tags; do not silently add it.

## 14 October 2026 — mobile startup CLS investigation

The baseline was GitHub commit 0a6b8d78d5575b0a85ffef13141f0db5805624e7 (v3.3.18). Konrad reported PageSpeed mobile score 78 and CLS 0.545, and explicitly asked to preserve the design and timing.

A controlled Chromium 153 mobile run at 412×823 with 6× CPU slowdown reproduced CLS 0.383294593 from the opening avatar and its purple ::before blob: they first painted at the CSS fallback position and were then moved to the sidebar-aligned top-left position by 08-identity-alignment.js. No external web-font swap was involved.

The v3.3.19 fix hides only that unaligned block until the existing alignment function has applied its styles, then reveals it with an is-aligned class. The no-script stylesheet explicitly keeps it visible. Final start-screen screenshots were pixel-identical before/after, both normal and slow CPU. No animation geometry, durations, scroll distances, shader/filter, source images or timing changes. Geometry reads needed for the zoom were left intact; this does not claim to eliminate every forced-reflow warning.

Controlled mobile startup CLS became 0; regression tests covered 20 up/down cycles at 390/1440/2560px plus no-JS, reduced motion and blocked storage. tests/startup.mjs reproduces the throttled load checks and visibility fallbacks. No fresh Google PageSpeed/Lighthouse score or native Safari 13/Opera 75 result is claimed. Browser networking in this runtime could not load the public page, so the unchanged production HTML was served through an intercepted response with local assets for diagnosis. The source matched the verified current GitHub commit.

Konrad authorised publication after regression checks. The published build and repository bundle are v3.3.19.

Publication checks: Chromium 153, Firefox 153 and Playwright WebKit 26.5 matched v3.3.18 geometry at 0/100/300/650/900/1200/1600px scroll, at 390/1440/2560px viewport widths. Settled start-screen PNGs were pixel-identical at phone and desktop widths in each engine. WebKit's headless software runtime needed its existing 120ms RAF fallback to settle; comparisons waited 300ms per position. No application timing was changed. Konrad explicitly authorised publication after these checks. v3.3.19 is the published release.

## 28 October 2026 — v3.3.20: Frank and portfolio metadata

Baseline: commit `1095ab9efd0a03bc492235fbe9e9309f1d0a963e` (v3.3.19). The baseline root HTML and live homepage were byte-for-byte identical before editing.

Added one full-width Feral Frank entry above the existing two Just cooking cards. Desktop uses equal columns with image and text aligned at the top; narrower screens stack them. The image and View on GitHub button both open `https://github.com/konradbuilds/feral-frank` in a new tab. Konrad is publishing Frank separately; do not replace this destination because it temporarily returns 404.

New production assets (all required when updating the source-based site):
- `assets/img/frank-about.webp` and `assets/img/frank-about.jpg`: 1085 × 875, from the original artwork. Only the pupil areas were edited for direct eye contact. The head, body, expression, background and text are retained.
- `assets/img/favicon-bird.svg`: original upside-down bird vector.
- `assets/img/favicon-bird-32.png`: raster favicon fallback.
- `assets/img/favicon-bird-180.png`: Apple touch icon.

The existing page, Open Graph and Twitter title/description remain unchanged. Canonical URL, structured data and the 1200 × 630 share-image dimensions were checked. Both image alt tags now describe the existing share artwork. The share image remains `assets/img/og-whatsapp-v3.jpg`.

Validation: build and whitespace checks pass; Chrome desktop and embedded phone/tablet viewports were visually reviewed, including image decoding, equal desktop columns, top alignment and no horizontal overflow. All 11 picture images decoded in Chrome with WebP selected, and again with JPEG selected after marking WebP unsupported. The image regression helper was updated for the added picture and relative asset paths. The original JavaScript is unchanged. No new Firefox, WebKit, Safari 13 or Opera certification is claimed. Sharing-card previews are illustrative, not captures from social platforms.

Konrad authorised committing v3.3.20 to GitHub, including source, built root HTML and all five new production assets. GitHub Pages publishes the root of `main`.
