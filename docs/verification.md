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

## v3.3.19 — 14 October

The production v3.3.18 source was reproduced with intercepted HTML/local assets because direct browser networking was unavailable. Chromium 153 at 412×823 and 6× CPU slowdown recorded CLS 0.383294593 from the opening identity/blob alignment. The fixed load recorded zero, with pixel-identical settled start-screen screenshots. Additional throttled checks at 360/390/412px passed, as did 20-cycle Chromium regression at 390/1440/2560px, no-JS, reduced motion and blocked storage. The Google-reported score 78 and CLS 0.545 were not directly recreated or rescored with Lighthouse. No claim of newly measured Safari/Firefox/Opera support. Geometry reads needed for the existing zoom remain unchanged.

Before/after engine comparison passed: Chromium 153.0.8010.0, Firefox 153.0 and Playwright WebKit 26.5. At 390/1440/2560px, seven scroll positions matched exact geometry, SVG camera transforms, curtain paths, arrow visibility and overflow state. Phone/desktop settled start PNGs were pixel-identical per engine. WebKit comparisons waited for the existing headless frame fallback; no app timing changes. Native Safari 13 and Opera 75 cannot be certified by these engine tests.
