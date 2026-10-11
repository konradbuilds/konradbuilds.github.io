# Verification — v3.3.18

11 October 2026. Tests use generated standalone HTML.

- Chromium 153: contact interaction at 390, 1440 and 2560px; twenty interruption cycles per width. Mocked success/failure, preserved failed drafts, reduced motion, no JavaScript errors and no idle SVG mutations.
- Pupil tracking: correct mirrored direction; listeners detach offscreen and in a simulated hidden tab. Static eye contact on touch and reduced motion.
- Sidebar signals: original 2.6-second sonar, slow six-second bolt pulse, continued visible idle motion, paused hidden/offscreen motion, reduced-motion fallback.
- Visual review: phone and desktop contact spacing, ink outline, apricot button and success wink.
- Mobile address-bar regression: stable stage geometry, visible return links, full top-bird retraction. An optional baseline reproduces the earlier jump.

Contact requests were intercepted; no messages were sent. No new native Safari 13, Opera 75 or Firefox run was made for these revisions. Earlier browser compatibility work is preserved, but that is not certification of these builds in those exact browsers.

Run npm test, npm run test:contact, npm run test:gaze and npm run test:mobile. Install Playwright browser engines first. Optional environment variables select locally available engines/executables.

- Opening controls: nine hit-test points across the full arrow button, edge activation, first/return visits at 390/1440/2560px, hidden state after scrolling and 2px avatar border. The transparent return-link row no longer intercepts the middle gap.
