# Architecture and tradeoffs

The source template keeps scripts in their original order. The dependency-free build inserts the two stylesheet sources, structured metadata and ordered JavaScript into one standalone HTML page. Repository assets remain external files. There is no runtime framework or module loader.

CSS remains in cascade order because legacy fallbacks and media queries depend on it. Prefer local edits over broad reordering. This is a static site, not a WordPress theme/plugin; PHP WordPress Coding Standards certification does not apply.

The shared motion scheduler coordinates scroll reads and cached writes. The intro controller uses the measured sticky-stage height for camera geometry, keeping mobile browser toolbar changes from altering zoom progress. Controls separately account for the visible toolbar inset. Completed effects stop updating. Width/orientation/layout changes remeasure.

A power controller pauses idle/background work; visibility observers pause offscreen decoration. Approved visible clocks, ticker, rooftop interactions and sidebar availability signals retain their idle behaviour. Avoid huge rasterised zoom surfaces, forced 3D layers, large animated blur/shadows or permanent compositor hints.

First visits favour scrolling. Returning visits expose client-project/CV shortcuts through one localStorage flag. Storage failure keeps them hidden. A temporary dark cover masks the instant project jump; keyboard focus transfers to the project section. Reduced motion jumps directly. Shortcut motion exits toward the nearest screen edge within 60px of scroll. The transparent shortcut container does not intercept clicks between its links.

The contact bird reuses the original inline SVG head ink with articulated eyes. Entry, exit and confirmed-submit celebration are finite frame chains. Fine-pointer tracking attaches only while the head is visible, caches geometry between scroll/resize events, eases the pupils and stops when settled. New motion cancels old work. Offscreen/hidden and reduced-motion paths detach tracking. Touch retains eye contact.

The contact form keeps the native Formspree POST fallback. Enhanced submission blocks duplicate sends while pending, preserves failed drafts, announces status and aborts stalled requests where supported. Only HTTP success triggers the wink. Decorative cancellation does not abort the user's actual submission. Tests must mock requests.

Photos use native picture selection: WebP source and JPEG img fallback, with intrinsic dimensions and loading priorities. OG metadata references the existing small baseline JPEG. Historical PNGs remain in the repository but are not the current share image.

Playwright checks are useful regression evidence, not a claim that Chromium emulates Opera 75 or WebKit certifies native Safari 13. See verification.md for actual scope and PORTFOLIO-HANDOFF.md for approved design decisions.

Opening identity alignment uses the sidebar's real metrics. The avatar/blob stays invisible until that existing alignment finishes, then the is-aligned class reveals it. This avoids painting a temporary wrong position; the measured final geometry and intro timing are unchanged. The no-script stylesheet explicitly restores visibility.
