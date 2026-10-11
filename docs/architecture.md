# Architecture and tradeoffs

The template keeps each script at its original position. The build inserts ordered JavaScript modules and the two stylesheet sources; no runtime loader, framework or bundler is added. CSS stays in its original cascade order: moving media queries or merging browser fallbacks across contexts risks breaking older engines. Obsolete AI section rules were removed.

Motion has one shared scheduler (04-motion-scheduler.js), one intro controller (06-intro-motion.js), and independent visibility hooks for the rooftop, decoration and bird. The existing 50px reading pause, curtain clearance, legacy CSS values, no-script layout and reduced-motion path are retained. On first visits, the only intro action is scrolling. Returning visits reveal edge-aligned project/CV links using one localStorage flag. Blocked storage or no JavaScript keeps them hidden. The project shortcut fades a temporary dark cover in, jumps immediately and moves keyboard focus, then fades the cover out and removes it. Reduced motion skips the cover. There are no perpetual timers; the fade uses only brief one-shot timers while clicked.

Offscreen decoration and inactive-tab work pause via the existing power/visibility controllers. Visible rooftop, clocks and ticker retain their existing behaviour. No CSS 3D effects, framework, large blur or new perpetual timer is added. The OpenAI symbol is the official white Blossom SVG, unmodified artwork from https://cdn.openai.com/brand/OpenAI-Logos-2025.zip. It is secondary to the personal identity and appears as a tool reference alongside Claude.

The single HTML still loads repository images, CV/reference PDFs and existing service integrations by URL; it is not a fully offline website. This remains a static portfolio, not a WordPress theme/plugin: WordPress Coding Standards tooling is not an applicable PHP certification here.

Regression checks should cover intro→curtain→work and back repeatedly; direct work access; reduced motion; no JavaScript; expanded case study; mobile and large-screen overflow. Playwright WebKit is a useful compatibility check but does not certify native Safari 13.1.3, Opera 75 or an unspecified Android Browser.

Returning shortcut motion uses two cached 2D transforms in the existing scroll scheduler: a 30px delay, a 5% viewport-width inward nudge, then an accelerating exit completed at 210px. Offscreen links are hidden and stop updating; scrolling back restores them. Reduced motion skips the travel. The live OG metadata points at the fresh 157 KB JPEG; the original PNG remains in the repository.

Shortcut motion revision: removed inward nudge and scroll delay. A cubic ease-out moves each link directly off its nearest edge within the first 60px of scrolling; returning to zero restores it. Reduced motion hides it on any positive scroll. Existing scheduler and cached 2D geometry retained.

## Contact bird (v3.3.06 preview)

The original homepage head artwork is reused in a mirrored pose, with a new
curved neck, shirt detail and articulated eyes. One requestAnimationFrame chain
runs only during the short entry, exit or success performance. Individual
channels (gaze, eyelid curves, brows, cheek, tilt and slide) have staggered timing.
A cache suppresses unchanged SVG attributes. There is no idle animation, filter,
3D transform or permanent compositor hint.

IntersectionObserver and document visibility cancel the current performance
offscreen. New movements replace the old frame chain; they never accumulate.
Keyboard focus and fine-pointer hover share the same state. Reduced motion
shows a static pose and retains the written submission status.

The original native Formspree action remains the no-JS fallback. Enhanced
submission uses that same endpoint, blocks duplicate sends while pending,
preserves the draft on failure and announces the result. Supported browsers
abort a stalled request after 20 seconds. Only confirmed HTTP success starts
the wink. A request in flight is independent of decorative visibility.

## Stable mobile intro geometry

The intro's SVG camera, zoom distance and curtain timing all use the measured
100vh sticky stage height. Mobile browser controls change the visible height,
but should not change the animation's coordinate system. Actual layout changes,
including width and orientation, still trigger measurement. Returning-visitor
controls use a separate toolbar inset to stay above the visible bottom edge.
