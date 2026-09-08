/* One reading position drives the page thread, chapter map and section stops.
   Normal browser scrolling stays in charge; no animation loop or scroll lock. */
(function () {
  'use strict';
  var main = document.getElementById('main');
  var header = document.querySelector('.runhead');
  var svg = document.querySelector('[data-reading-thread]');
  var sections = Array.from(document.querySelectorAll('main > [data-nav]'));
  var links = Array.from(document.querySelectorAll('.chapter-nav a'));
  if (!main || !header || !svg || !sections.length) return;

  var track = svg.querySelector('[data-thread-track]');
  var ink = svg.querySelector('[data-thread-ink]');
  var stops = svg.querySelector('[data-thread-stops]');
  var cursor = svg.querySelector('[data-thread-cursor]');
  var chapterProgress = document.querySelector('[data-chapter-progress]');
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var geometry;
  var dirty = true;
  var queued = false;
  var circles = sections.map(function () {
    var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('r', '4');
    stops.appendChild(circle);
    return circle;
  });

  function measure() {
    var rect = main.getBoundingClientRect();
    var first = sections[0];
    var gutter = parseFloat(getComputedStyle(first).paddingLeft);
    var x = first.offsetLeft + gutter / 2;
    var points = sections.map(function (section) {
      // offsetTop ignores entrance transforms on the section headings.
      return section.offsetTop + section.querySelector('.section__head').offsetTop + 12;
    });
    var start = Math.max(0, points[0] - 100);
    var end = main.offsetHeight - parseFloat(getComputedStyle(sections[sections.length - 1]).paddingBottom);
    geometry = { top: rect.top + window.scrollY, x: x, points: points, start: start, end: end };
    svg.setAttribute('viewBox', '0 0 ' + main.clientWidth + ' ' + main.offsetHeight);
    svg.setAttribute('width', main.clientWidth);
    svg.setAttribute('height', main.offsetHeight);
    var path = 'M ' + x + ' ' + start + ' V ' + end;
    track.setAttribute('d', path);
    ink.setAttribute('d', path);
    ink.style.strokeDasharray = String(end - start);
    circles.forEach(function (circle, i) {
      circle.setAttribute('cx', x);
      circle.setAttribute('cy', points[i]);
    });
    cursor.setAttribute('cx', x);
    document.documentElement.style.setProperty('--reading-offset', (header.offsetHeight + 24) + 'px');
    dirty = false;
  }

  function paint() {
    queued = false;
    if (dirty) measure();
    var g = geometry;
    var readingY = window.scrollY + Math.max(header.offsetHeight + 40, window.innerHeight * 0.35) - g.top;
    var atEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
    var y = atEnd ? g.end : Math.max(g.start, Math.min(g.end, readingY));
    var paused = motion.matches || document.documentElement.dataset.motion === 'off';
    // Reduced motion keeps the complete static thread and discrete chapter state.
    ink.style.strokeDashoffset = String(paused ? 0 : g.end - y);
    cursor.setAttribute('cy', y);
    cursor.style.display = paused || readingY < g.start ? 'none' : '';
    var active = -1;
    g.points.forEach(function (point, i) { if (readingY >= point || atEnd) active = i; });
    sections.forEach(function (section, i) {
      section.classList.toggle('is-current-chapter', i === active);
      circles[i].classList.toggle('is-passed', i <= active);
      if (!links[i]) return;
      links[i].classList.toggle('is-passed', i <= active);
      if (i === active) links[i].setAttribute('aria-current', 'location');
      else links[i].removeAttribute('aria-current');
    });
    var segment = Math.max(0, active);
    var part = active < 0 || active === g.points.length - 1 ? 0 :
      Math.max(0, Math.min(1, (readingY - g.points[active]) / (g.points[active + 1] - g.points[active])));
    var progress = (segment + (paused ? 0 : part)) / (g.points.length - 1);
    chapterProgress.style.transform = 'scaleX(' + Math.min(1, progress) + ')';
  }

  function schedule() {
    if (!queued) { queued = true; requestAnimationFrame(paint); }
  }
  function resize() { dirty = true; schedule(); }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pageshow', resize);
  if ('ResizeObserver' in window) {
    var observer = new ResizeObserver(resize);
    observer.observe(main);
    observer.observe(header);
  }
  if (document.fonts) document.fonts.ready.then(resize);
  if (motion.addEventListener) motion.addEventListener('change', schedule);
  new MutationObserver(schedule).observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
  paint();
  svg.classList.add('is-ready');
})();
