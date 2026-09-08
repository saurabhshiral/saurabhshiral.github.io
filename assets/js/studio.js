/* Original canvas illustration: scattered sources become a layered platform.
   All content and controls live in HTML. The canvas is decorative and optional. */
(function () {
  'use strict';
  // Print disclosure content even if the decorative canvas is unavailable.
  var printDetails = [];
  window.addEventListener('beforeprint', function () {
    printDetails = Array.from(document.querySelectorAll('details:not([open])'));
    printDetails.forEach(function (details) { details.open = true; });
  });
  window.addEventListener('afterprint', function () {
    printDetails.forEach(function (details) { details.open = false; });
    printDetails = [];
  });
  var scene = document.querySelector('[data-platform-scene]');
  var canvas = document.querySelector('[data-platform-canvas]');
  if (!scene || !canvas) return;
  var context = canvas.getContext('2d');
  if (!context) return;
  var viewport = scene.querySelector('.platform-scene__viewport');
  var controls = scene.querySelector('.platform-scene__controls');
  var buttons = Array.from(scene.querySelectorAll('[data-scene-mode]'));
  var caption = scene.querySelector('[data-scene-caption]');
  var media = window.matchMedia('(prefers-reduced-motion: reduce)');
  var captions = [
    'Start with a landscape of sources, systems, and dependencies.',
    'Bring structure to the data. Build a platform people can use.',
    'A platform is only finished when somebody can run it.'
  ];
  var width = 1, height = 1, ratio = 1;
  var visible = false, manual = false, frame = null, previous = 0;
  var elapsed = 0, mode = 0, formation = 0;
  var pointer = { x: 0, y: 0 }, angle = { x: 0, y: 0 };
  var points = [];
  var side = 7;
  for (var layer = 0; layer < 3; layer++) {
    for (var row = 0; row < side; row++) {
      for (var column = 0; column < side; column++) {
        var id = points.length;
        points.push({ x: (column - 3) * 40, y: (layer - 1) * 85, z: (row - 3) * 40,
          sx: Math.sin(id * 15.73) * 210, sy: Math.sin(id * 8.11) * 150,
          sz: Math.cos(id * 5.37) * 200, layer: layer, row: row, column: column });
      }
    }
  }
  function paused() { return media.matches || document.documentElement.dataset.motion === 'off'; }
  function setMode(next, byVisitor) {
    mode = next;
    if (byVisitor) manual = true;
    buttons.forEach(function (button, i) { button.setAttribute('aria-pressed', String(i === mode)); });
    caption.textContent = captions[mode];
    if (paused()) { formation = mode === 0 ? 0 : 1; draw(); }
  }
  function project(x, y, z) {
    var yaw = -0.62 + angle.x * 0.14;
    var pitch = 0.64 + angle.y * 0.09;
    var x1 = x * Math.cos(yaw) - z * Math.sin(yaw);
    var z1 = x * Math.sin(yaw) + z * Math.cos(yaw);
    var y1 = y * Math.cos(pitch) - z1 * Math.sin(pitch);
    var depth = y * Math.sin(pitch) + z1 * Math.cos(pitch);
    var perspective = 700 / (700 + depth);
    var scale = Math.min(width / 430, height / 345);
    return { x: width * 0.5 + x1 * perspective * scale, y: height * 0.51 + y1 * perspective * scale, depth: depth, scale: scale * perspective };
  }
  function line(a, b, color, lineWidth) {
    context.beginPath(); context.moveTo(a.x, a.y); context.lineTo(b.x, b.y);
    context.strokeStyle = color; context.lineWidth = lineWidth || 1; context.stroke();
  }
  function draw() {
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    var time = elapsed * 0.001;
    // A faint construction grid grounds the floating planes.
    for (var grid = -4; grid <= 4; grid++) {
      line(project(grid * 40, 125, -160), project(grid * 40, 125, 160), '#71e0cd13');
      line(project(-160, 125, grid * 40), project(160, 125, grid * 40), '#71e0cd13');
    }
    if (formation > 0.02) {
      for (var floor = 2; floor >= 0; floor--) {
        var y = (floor - 1) * 85;
        var corners = [[-130,y,-130],[130,y,-130],[130,y,130],[-130,y,130]].map(function (p) { return project(p[0],p[1],p[2]); });
        context.beginPath();
        corners.forEach(function (p, i) { if (i) context.lineTo(p.x,p.y); else context.moveTo(p.x,p.y); });
        context.closePath();
        context.fillStyle = 'rgba(40, 84, 99, ' + (0.14 * formation) + ')'; context.fill();
        context.strokeStyle = 'rgba(113, 224, 205, ' + (0.35 * formation) + ')'; context.lineWidth = 1; context.stroke();
      }
    }
    var plotted = points.map(function (p, i) {
      var drift = Math.sin(time * 0.6 + i) * 6 * (1 - formation);
      return project(p.sx * (1 - formation) + p.x * formation + drift,
        p.sy * (1 - formation) + p.y * formation,
        p.sz * (1 - formation) + p.z * formation);
    });
    if (formation > 0.1) {
      points.forEach(function (p, i) {
        var color = 'rgba(113, 224, 205, ' + (0.12 * formation) + ')';
        if (p.column < side - 1) line(plotted[i], plotted[i + 1], color, 0.6);
        if (p.row < side - 1) line(plotted[i], plotted[i + side], color, 0.6);
        if (p.layer < 2 && p.row === 3 && p.column === 3) line(plotted[i], plotted[i + side * side], '#ff795e99', 1.2);
      });
    }
    // Paint points back to front so the sculpture keeps its depth.
    plotted.map(function (p, i) { return { p: p, i: i }; }).sort(function (a,b) { return b.p.depth - a.p.depth; }).forEach(function (item) {
      var point = item.p;
      var accent = item.i % 11 === 0;
      context.beginPath(); context.arc(point.x, point.y, Math.max(0.8, (accent ? 2.4 : 1.25) * point.scale), 0, Math.PI * 2);
      context.fillStyle = accent ? '#ff957b' : 'rgba(153, 239, 225, ' + (0.45 + (point.depth + 250) / 1100) + ')';
      context.fill();
    });
    if (mode === 2 && formation > 0.8) {
      for (var signal = 0; signal < 9; signal++) {
        var t = (time * 0.19 + signal / 9) % 1;
        var signalLayer = signal % 3;
        var sx = -120 + t * 240;
        var sz = ((signal * 3) % 7 - 3) * 40;
        var center = project(sx, (signalLayer - 1) * 85, sz);
        var tail = project(sx - 17, (signalLayer - 1) * 85, sz);
        line(tail, center, signalLayer === 1 ? '#ff795e' : '#71e0cd', 2);
        context.beginPath(); context.arc(center.x, center.y, 2.8, 0, Math.PI * 2);
        context.fillStyle = '#f5f8ff'; context.fill();
      }
    }
  }
  function tick(timestamp) {
    frame = null;
    if (!visible || document.hidden || paused()) { previous = 0; return; }
    if (previous && timestamp - previous < 30) { frame = requestAnimationFrame(tick); return; }
    var delta = previous ? Math.min(80, timestamp - previous) : 33;
    previous = timestamp;
    elapsed += delta;
    if (!manual) {
      var next = elapsed < 650 ? 0 : elapsed < 2400 ? 1 : 2;
      if (next !== mode) setMode(next, false);
    }
    var target = mode === 0 ? 0 : 1;
    formation += (target - formation) * Math.min(1, delta * 0.004);
    angle.x += (pointer.x - angle.x) * 0.06;
    angle.y += (pointer.y - angle.y) * 0.06;
    draw();
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    if (frame !== null) { cancelAnimationFrame(frame); frame = null; }
    previous = 0;
    if (paused()) {
      if (!manual) setMode(2, false);
      formation = mode === 0 ? 0 : 1;
      angle.x = 0; angle.y = 0; draw();
    } else if (visible && !document.hidden) frame = requestAnimationFrame(tick);
  }
  function resize() {
    width = viewport.clientWidth; height = viewport.clientHeight;
    ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
    draw();
  }
  buttons.forEach(function (button, i) {
    button.addEventListener('click', function () { setMode(i, true); sync(); });
  });
  viewport.addEventListener('pointermove', function (event) {
    if (event.pointerType !== 'mouse' || paused()) return;
    var rect = viewport.getBoundingClientRect();
    pointer.x = (event.clientX - rect.left) / rect.width * 2 - 1;
    pointer.y = (event.clientY - rect.top) / rect.height * 2 - 1;
  }, { passive: true });
  viewport.addEventListener('pointerleave', function () { pointer.x = 0; pointer.y = 0; });
  if ('ResizeObserver' in window) new ResizeObserver(resize).observe(viewport);
  else window.addEventListener('resize', resize, { passive: true });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; sync(); }).observe(scene);
  } else { visible = true; }
  if (media.addEventListener) media.addEventListener('change', sync);
  new MutationObserver(sync).observe(document.documentElement, { attributes: true, attributeFilter: ['data-motion'] });
  document.addEventListener('visibilitychange', sync);
  controls.hidden = false;
  setMode(paused() ? 2 : 0, false);
  resize(); scene.classList.add('is-ready'); sync();

})();
