
/* Returning visitors may bypass the intro. Storage is optional, never a dependency. */
(function () {
 'use strict';
 var nav = document.querySelector('.intro-shortcuts');
 var opening = document.querySelector('.opening');
 var link = document.querySelector('[data-quick-work]');
 var target = document.getElementById('projects');
 if (!nav || !opening || !link || !target) { return; }
 var returning = false;
 try {
  returning = localStorage.getItem('konrad-portfolio-visited') === '1';
  localStorage.setItem('konrad-portfolio-visited', '1');
 } catch (error) { /* Private or blocked storage keeps the first-visit experience. */ }
 nav.setAttribute('data-returning', returning ? 'true' : 'false');
 nav.hidden = !returning || opening.inert === true;
 opening.classList.toggle('has-return-shortcuts', returning);

 /* Two 2D transforms share the existing scroll paint; finished links stop updating. */
 if (returning) {
  var links = [link, nav.querySelector('.intro-cv')];
  var exits = [0, 0];
  var lastProgress = -1;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  function measureShortcuts() {
   // Browser controls can cover the bottom of a 100vh opening on mobile.
   // This offset affects controls only; animation geometry stays stable.
   opening.style.setProperty('--intro-toolbar-gap', (innerWidth <= 600 ? Math.max(0, opening.clientHeight - innerHeight) : 0) + 'px');
   var wasHidden = nav.hidden;
   nav.hidden = false;
   links.forEach(function (item, index) {
    item.style.transform = 'none';
    var box = item.getBoundingClientRect();
    exits[index] = index === 0 ? box.right + 20 : innerWidth - box.left + 20;
   });
   nav.hidden = wasHidden;
   lastProgress = -1;
  }
  function paintShortcuts(state) {
   var progress = Math.min(1, Math.max(0, state.y / 60));
   if (reduce.matches) { progress = state.y > 0 ? 1 : 0; }
   if (progress === lastProgress) { return; }
   lastProgress = progress;
   nav.hidden = progress === 1;
   links.forEach(function (item, index) {
    var eased = 1 - Math.pow(1 - progress, 3);
    var offset = exits[index] * eased * (index === 0 ? -1 : 1);
    item.style.transform = 'translateX(' + offset.toFixed(2) + 'px)';
   });
  }
  window.__portfolioMotion.measure(measureShortcuts);
  window.__portfolioMotion.add(null, paintShortcuts);
  measureShortcuts();
  paintShortcuts({y:window.pageYOffset || 0});
 }
 var skipping = false;
 function jump() {
  var top = target.getBoundingClientRect().top + (window.pageYOffset || 0) - 24;
  window.scrollTo(0, top);
  target.setAttribute('tabindex', '-1');
  try { target.focus({preventScroll:true}); } catch (error) { target.focus(); window.scrollTo(0, top); }
  if (history.replaceState) { history.replaceState(null, '', '#projects'); }
 }
 link.addEventListener('click', function (event) {
  if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button > 0) { return; }
  event.preventDefault(); event.stopPropagation();
  if (skipping) { return; }
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { jump(); return; }
  skipping = true;
  var cover = document.createElement('div');
  cover.className = 'project-skip-cover';
  cover.setAttribute('aria-hidden', 'true');
  document.body.appendChild(cover);
  requestAnimationFrame(function () {
   cover.classList.add('is-active');
   window.setTimeout(function () {
    jump();
    requestAnimationFrame(function () {
     requestAnimationFrame(function () {
      cover.classList.remove('is-active');
      window.setTimeout(function () { cover.remove(); skipping = false; }, 180);
     });
    });
   }, 180);
  });
 });
}());
