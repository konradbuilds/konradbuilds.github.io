/* Contact: one finite animation at a time. SVG attributes keep the facial rig
 * compatible with older engines; no CSS path morphing, 3D or idle render loop. */
(function () {
 'use strict';
 var section = document.getElementById('contact');
 if (!section) { return; }
 var form = section.querySelector('form');
 var bird = section.querySelector('.contact-bird');
 var status = section.querySelector('.contact-status');
 var button = form.querySelector('[type="submit"]');
 var reduced = matchMedia('(prefers-reduced-motion: reduce)');
 var finePointer = matchMedia('(hover: hover) and (pointer: fine)');
 var visible = false;
 var hovering = false;
 var dismissed = false;
 var busy = false;
 var mode = 'parked';
 var frame = 0;
 var focusTimer = 0;
 var gazeFrame = 0;
 var tracking = false;
 var eyeAnchor = null;
 var gazeTarget = { x: 0, y: 0 };
 var gazeTime = 0;
 var pose = { x: 108, y: 5, turn: 18, gaze: 1, gazeY: 0, near: .72, far: .46, brow: 1, smile: 0, cheek: 0 };
 var nodes = {};
 var cache = {};
 ['bird-pose', 'eye-near-aperture', 'eye-far-aperture', 'eye-near-outline',
  'eye-far-outline', 'pupil-near', 'pupil-far', 'brow-near', 'brow-far',
  'smile', 'cheek'].forEach(function (name) { nodes[name] = bird.querySelector('.chat-' + name); });

 function number(value) { return Math.round(value * 1000) / 1000; }
 function attribute(name, key, value) {
  var id = name + key;
  if (cache[id] === value) { return; }
  cache[id] = value;
  nodes[name].setAttribute(key, value);
 }
 function eyePath(open, far) {
  var shut = 1 - open;
  var left = far ? 219 : 145;
  var right = far ? 249 : 197;
  var middle = (left + right) / 2;
  var edge = number((far ? 114 : 127) + shut * (far ? 16 : 17));
  var top = number((far ? 70 : 74) + shut * (far ? 54 : 60));
  var bottom = number((far ? 155 : 187) - shut * (far ? 31 : 53));
  // The two curves meet at a closed lid; the pupil disappears naturally behind it.
  return 'M' + left + ' ' + edge + 'Q' + middle + ' ' + top + ' ' + right + ' ' + edge +
   'Q' + middle + ' ' + bottom + ' ' + left + ' ' + edge + 'Z';
 }
 function paint() {
  var transform = 'translate(' + number(pose.y) + 'px,' + number(pose.x) + '%)';
  if (cache.slide !== transform) { bird.style.transform = transform; cache.slide = transform; }
  attribute('bird-pose', 'transform', 'translate(15 4) rotate(' + number(pose.turn) + ' 230 200)');
  ['near', 'far'].forEach(function (side) {
   var path = eyePath(pose[side], side === 'far');
   attribute('eye-' + side + '-aperture', 'd', path);
   attribute('eye-' + side + '-outline', 'd', path);
  });
  attribute('pupil-near', 'cx', number(171 + pose.gaze * 10));
  attribute('pupil-far', 'cx', number(233 + pose.gaze * 5));
  attribute('pupil-near', 'cy', number(129 + pose.gazeY * 9));
  attribute('pupil-far', 'cy', number(121 + pose.gazeY * 5));
  attribute('brow-near', 'transform', 'translate(0 ' + number(-pose.brow) + ')');
  attribute('brow-far', 'transform', 'translate(0 ' + number(pose.brow * .25) + ')');
  attribute('smile', 'opacity', number(pose.smile));
  attribute('cheek', 'opacity', number(pose.cheek));
 }
 /* Bind tracking only while the head is out. Pointer events coalesce into one
  * finite easing chain; cached geometry is refreshed only after scroll/resize. */
 function invalidateEyes() { eyeAnchor = null; }
 function trackPointer(event) {
  if (!eyeAnchor) {
   var rect = bird.getBoundingClientRect();
   eyeAnchor = { x: rect.left + rect.width * .55, y: rect.top + rect.height * .32 };
  }
  // The original ink is mirrored: screen-right is SVG-left.
  gazeTarget.x = -Math.max(-.8, Math.min(.8, (event.clientX - eyeAnchor.x) / 180));
  gazeTarget.y = Math.max(-.7, Math.min(.7, (event.clientY - eyeAnchor.y) / 180));
  if (!gazeFrame) { gazeTime = 0; gazeFrame = requestAnimationFrame(easeGaze); }
 }
 function easeGaze(now) {
  gazeFrame = 0;
  if (!tracking || !active() || mode !== 'looking') { return; }
  var dt = gazeTime ? Math.min(50, now - gazeTime) : 16;
  gazeTime = now;
  var follow = 1 - Math.exp(-dt / 65);
  pose.gaze += (gazeTarget.x - pose.gaze) * follow;
  pose.gazeY += (gazeTarget.y - pose.gazeY) * follow;
  var settled = Math.abs(gazeTarget.x - pose.gaze) < .008 &&
   Math.abs(gazeTarget.y - pose.gazeY) < .008;
  if (settled) { pose.gaze = gazeTarget.x; pose.gazeY = gazeTarget.y; }
  paint();
  if (!settled) { gazeFrame = requestAnimationFrame(easeGaze); }
 }
 function untrack() {
  cancelAnimationFrame(gazeFrame); gazeFrame = 0;
  if (!tracking) { return; }
  tracking = false; eyeAnchor = null;
  window.removeEventListener('mousemove', trackPointer);
  window.removeEventListener('scroll', invalidateEyes, true);
  window.removeEventListener('resize', invalidateEyes);
 }
 function syncTracking() {
  var allowed = active() && mode === 'looking' && finePointer.matches && !reduced.matches;
  if (!allowed) { untrack(); return; }
  if (tracking) { return; }
  tracking = true; eyeAnchor = null;
  window.addEventListener('mousemove', trackPointer);
  window.addEventListener('scroll', invalidateEyes, true);
  window.addEventListener('resize', invalidateEyes);
 }
 function stop() {
  untrack();
  cancelAnimationFrame(frame);
  frame = 0;
 }
 function settle(nextMode, values) {
  stop();
  Object.keys(values).forEach(function (key) { pose[key] = values[key]; });
  mode = nextMode;
  bird.setAttribute('data-bird-state', mode);
  paint();
  syncTracking();
 }
 function park() {
  settle('parked', { x: 108, y: 5, turn: 18, gaze: 1, gazeY: 0, near: .72, far: .46, brow: 1, smile: 0, cheek: 0 });
 }
 function active() { return visible && !document.hidden; }
 function wanted() { return hovering || form.contains(document.activeElement); }
 function animate(nextMode, duration, tracks, done) {
  stop();
  mode = nextMode;
  bird.setAttribute('data-bird-state', mode);
  var start = null;
  var keys = Object.keys(tracks);
  keys.forEach(function (key) { tracks[key] = [[0, pose[key]]].concat(tracks[key]); });
  function tick(now) {
   frame = 0;
   if (!active()) { park(); return; }
   if (start === null) { start = now; }
   var elapsed = Math.min(duration, now - start);
   keys.forEach(function (key) {
    var points = tracks[key];
    var next = 1;
    while (next < points.length - 1 && elapsed > points[next][0]) { next++; }
    var a = points[next - 1];
    var b = points[next];
    var t = Math.max(0, Math.min(1, (elapsed - a[0]) / (b[0] - a[0])));
    var eased = t * t * (3 - 2 * t);
    pose[key] = a[1] + (b[1] - a[1]) * eased;
   });
   paint();
   if (elapsed < duration) { frame = requestAnimationFrame(tick); }
   else { done(); }
  }
  frame = requestAnimationFrame(tick);
 }
 function enter() {
  if (mode === 'entering' || mode === 'looking' || mode === 'celebrating') { return; }
  if (reduced.matches) {
   settle('looking', { x: 0, y: 0, turn: 0, gaze: 0, gazeY: 0, near: .88, far: .46, brow: 3, smile: 0, cheek: 0 });
   return;
  }
  // A quick rise, lateral arc and delayed head catch-up; each settles separately.
  animate('entering', 440, {
   x: [[220, -5], [320, 2], [440, 0]],
   y: [[115, -7], [265, 3], [425, 0]],
   turn: [[65, 8], [190, -19], [300, 5], [440, 0]],
   near: [[145, .98], [380, .88]], far: [[185, .62], [420, .46]],
   gaze: [[110, -.65], [235, .3], [410, 0]],
   gazeY: [[145, -.95], [245, -.65], [430, 0]], brow: [[180, 6], [410, 3]],
   smile: [[140, 0]], cheek: [[140, 0]]
  }, function () { mode = 'looking'; bird.setAttribute('data-bird-state', mode); reconcile(); });
 }
 function leave() {
  if (mode === 'parked' || mode === 'leaving' || mode === 'celebrating') { return; }
  if (reduced.matches) { park(); return; }
  animate('leaving', 480, {
   x: [[75, Math.min(pose.x, 0) - 3], [400, 108], [480, 108]],
   turn: [[90, -9], [315, 23], [480, 18]], y: [[120, -2], [400, 6], [480, 5]],
   gaze: [[175, .2], [480, 1]], gazeY: [[480, 0]], brow: [[480, 1]]
  }, park);
 }
 function reconcile() {
  bird.classList.toggle('is-visible', active());
  if (!active()) { park(); return; }
  if (mode === 'celebrating') { return; }
  if (wanted() && !dismissed) { enter(); } else { leave(); }
  syncTracking();
 }
 function celebrate() {
  dismissed = true;
  if (!active() || reduced.matches) { park(); return; }
  // Recognition → eye contact → cheek-led wink → held glance → reluctant exit.
  // Each channel has its own timing. The last 890ms keeps the successful-send retreat unhurried.
  animate('celebrating', 2540, {
   x: [[230, -3], [1000, -3], [1480, -1], [1650, 0], [2540, 108]],
   y: [[310, -2], [640, 1.5], [1040, -1], [1650, 0], [2540, 7]],
   turn: [[150, pose.turn], [420, -3], [760, -6], [1120, -1], [1740, 5], [2230, 18], [2540, 18]],
   gaze: [[190, 0], [1460, 0], [1990, -.45], [2540, .1]],
   gazeY: [[210, 0], [2540, 0]],
   near: [[310, .98], [530, .94], [655, 0], [805, 0], [1060, .94], [1400, .80]],
   far: [[300, .67], [680, .40], [1030, .52], [1540, .46]],
   brow: [[350, 5.5], [710, 1], [1080, 4], [1680, 2]],
   cheek: [[460, 0], [680, .9], [1020, .2], [1420, 0]],
   smile: [[400, 0], [870, .9], [1720, .9], [2420, 0]]
  }, park);
 }
 function engage() {
  dismissed = false;
  reconcile();
 }
 form.addEventListener('mouseenter', function () {
  if (finePointer.matches) { hovering = true; engage(); }
 });
 form.addEventListener('mouseleave', function () { hovering = false; reconcile(); });
 form.addEventListener('focusin', engage);
 form.addEventListener('focusout', function () {
  clearTimeout(focusTimer);
  focusTimer = setTimeout(reconcile, 0);
 });
 form.addEventListener('input', function () {
  // Typing a new message can interrupt a previous celebration.
  if (mode === 'celebrating') { stop(); mode = 'leaving'; }
  engage();
 });
 document.addEventListener('visibilitychange', function () {
  if (document.hidden) { hovering = false; clearTimeout(focusTimer); }
  reconcile();
 });
 function motionPreference() { park(); reconcile(); }
 if (reduced.addEventListener) { reduced.addEventListener('change', motionPreference); }
 else if (reduced.addListener) { reduced.addListener(motionPreference); }
 if (finePointer.addEventListener) { finePointer.addEventListener('change', syncTracking); }
 else if (finePointer.addListener) { finePointer.addListener(syncTracking); }
 if ('IntersectionObserver' in window) {
  new IntersectionObserver(function (entries) {
   visible = entries[0].isIntersecting;
   if (!visible) { hovering = false; clearTimeout(focusTimer); }
   reconcile();
  }).observe(section);
 } else { visible = true; }
 paint();
 reconcile();

 /* Keep the native POST as a no-JS/no-fetch fallback. Only confirmed delivery
  * earns the wink. Error responses preserve the message and offer direct email. */
 if (!window.fetch || !window.FormData) { return; }
 form.addEventListener('submit', function (event) {
  event.preventDefault();
  if (busy) { return; }
  busy = true;
  button.disabled = true;
  form.setAttribute('aria-busy', 'true');
  status.hidden = false;
  status.textContent = 'Sending…';
  var controller = window.AbortController ? new AbortController() : null;
  var requestTimer = controller ? setTimeout(function () { controller.abort(); }, 20000) : null;
  fetch(form.action, {
   method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' },
   signal: controller ? controller.signal : undefined
  }).then(function (response) {
   if (!response.ok) { throw new Error('Submission failed'); }
   form.reset();
   status.textContent = 'Thanks — your message has been sent.';
   celebrate();
  }).catch(function () {
   status.textContent = 'Could not send. Please try again, or use the email link below.';
  }).then(function () {
   clearTimeout(requestTimer);
   busy = false;
   button.disabled = false;
   form.removeAttribute('aria-busy');
  });
 });
}());
