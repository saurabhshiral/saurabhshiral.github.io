/* ==========================================================================
   Saurabh Shiral — site behaviour
   No framework, no build step. Everything here is progressive enhancement:
   the page is complete and readable with this file blocked.
   ========================================================================== */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isApple = /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);

  /* Tells the inline head script that this file parsed and ran, so it does not
     strip the `.js` class and cancel the scroll reveals. */
  window.__siteReady = true;

  /* ── Small helpers ─────────────────────────────────────────────────── */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ── Footer year + platform-correct modifier key ───────────────────── */
  $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
  /* U+2009 THIN SPACE, not a normal space — HTML would collapse that away. */
  $$('[data-mod-key]').forEach(function (el) { el.textContent = isApple ? '⌘' : 'Ctrl '; });

  /* ── Reading progress ──────────────────────────────────────────────── */
  (function progress() {
    var bar = $('[data-progress]');
    if (!bar) return;
    var queued = false;

    function paint() {
      queued = false;
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var pct = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      bar.style.width = (pct * 100).toFixed(2) + '%';
    }
    function onScroll() {
      if (!queued) { queued = true; requestAnimationFrame(paint); }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    paint();
  })();

  /* ── Scroll reveals ────────────────────────────────────────────────── */
  (function reveals() {
    var items = $$('[data-reveal]');
    if (!items.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.06 });

    items.forEach(function (el) { io.observe(el); });
  })();

  /* ── Active section in the running head ────────────────────────────── */
  (function activeNav() {
    var links = $$('.runhead__nav a');
    if (!links.length || !('IntersectionObserver' in window)) return;

    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var targets = Object.keys(byId)
      .map(function (id) { return document.getElementById(id); })
      .filter(Boolean);

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = byId[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          links.forEach(function (a) { a.removeAttribute('aria-current'); });
          link.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-25% 0px -65% 0px' });

    targets.forEach(function (el) { io.observe(el); });
  })();

  /* ── Theme toggle ──────────────────────────────────────────────────── */
  var theme = (function () {
    var root = document.documentElement;
    var media = window.matchMedia('(prefers-color-scheme: dark)');

    function current() {
      var set = root.getAttribute('data-theme');
      if (set) return set;
      return media.matches ? 'dark' : 'light';
    }
    function apply(next) {
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) { /* private mode */ }
      var meta = $('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', next === 'dark' ? '#14120F' : '#FBF9F5');
    }
    function toggle() { apply(current() === 'dark' ? 'light' : 'dark'); }

    $$('[data-theme-toggle]').forEach(function (btn) {
      btn.addEventListener('click', toggle);
    });

    return { toggle: toggle, current: current };
  })();

  /* ── Disclosure: expanding ledger rows and prose units ─────────────────
     One implementation drives both. Any button carrying [data-disclose] with
     aria-controls pointing at a panel gets height-animated open/closed. */
  var disclosure = (function () {
    var rows = $$('[data-disclose]');

    var OPEN_MS = 320;
    var CLOSE_MS = 260;
    var seq = 0;               /* guards against a fast toggle finishing out of order */

    function panelOf(btn) {
      return document.getElementById(btn.getAttribute('aria-controls'));
    }

    /* Run `settle` when the height transition ends — or on a timer if
       `transitionend` never arrives (interrupted transition, a browser that
       skips it, reduced-motion overrides). The collapsed panel MUST end up
       with `hidden` set, otherwise screen readers keep announcing content that
       is visually gone. Never leave that to an event that might not fire. */
    function afterHeight(panel, ms, token, settle) {
      var done = false;
      function finish() {
        if (done || token !== seq) return;
        done = true;
        panel.removeEventListener('transitionend', onEnd);
        settle();
      }
      function onEnd(e) { if (e.propertyName === 'height') finish(); }
      panel.addEventListener('transitionend', onEnd);
      setTimeout(finish, ms + 80);
    }

    function open(btn) {
      var panel = panelOf(btn);
      if (!panel || btn.getAttribute('aria-expanded') === 'true') return;
      var token = ++seq;
      btn.setAttribute('aria-expanded', 'true');
      panel.hidden = false;

      if (reduceMotion) {
        panel.style.transition = '';
        panel.style.height = 'auto';
        panel.style.opacity = '1';
        return;
      }
      var target = panel.scrollHeight;
      panel.style.height = '0px';
      panel.style.opacity = '0';
      void panel.offsetHeight;   // reflow, so the transition has a start value
      panel.style.transition = 'height ' + OPEN_MS + 'ms cubic-bezier(0.22,0.61,0.36,1), opacity 260ms ease';
      panel.style.height = target + 'px';
      panel.style.opacity = '1';

      afterHeight(panel, OPEN_MS, token, function () {
        panel.style.transition = '';
        panel.style.height = 'auto';   // let it reflow freely from here
        panel.style.opacity = '';
      });
    }

    function close(btn) {
      var panel = panelOf(btn);
      if (!panel || btn.getAttribute('aria-expanded') !== 'true') return;
      var token = ++seq;
      btn.setAttribute('aria-expanded', 'false');

      function settle() {
        panel.style.transition = '';
        panel.style.height = '';
        panel.style.opacity = '';
        panel.hidden = true;
      }

      if (reduceMotion) { settle(); return; }
      panel.style.height = panel.scrollHeight + 'px';
      void panel.offsetHeight;
      panel.style.transition = 'height ' + CLOSE_MS + 'ms cubic-bezier(0.22,0.61,0.36,1), opacity 200ms ease';
      panel.style.height = '0px';
      panel.style.opacity = '0';

      afterHeight(panel, CLOSE_MS, token, settle);
    }

    rows.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.getAttribute('aria-expanded') === 'true') { close(btn); } else { open(btn); }
      });
    });

    return {
      /* Open the disclosure inside a given container (a ledger row, a unit). */
      openIn: function (containerEl) {
        var btn = $('[data-disclose]', containerEl);
        if (btn) open(btn);
      },
      openAll: function (selector) {
        $$(selector).forEach(function (el) {
          var btn = $('[data-disclose]', el);
          if (btn) open(btn);
        });
      }
    };
  })();

  /* ── Command palette ───────────────────────────────────────────────── */
  (function palette() {
    var dialog = $('[data-cmdk]');
    var input = $('[data-cmdk-input]');
    var list = $('[data-cmdk-list]');
    var empty = $('[data-cmdk-empty]');
    if (!dialog || !input || !list || typeof dialog.showModal !== 'function') return;

    /* Build the index from the DOM, so content and palette can never drift. */
    var items = [];

    $$('[data-nav]').forEach(function (sec) {
      items.push({
        name: sec.getAttribute('data-nav'),
        kind: 'Section',
        group: 'Sections',
        run: function () { goTo(sec); }
      });
    });

    $$('article[data-project]').forEach(function (art) {
      items.push({
        name: art.getAttribute('data-project'),
        kind: art.getAttribute('data-kind') || 'Project',
        group: 'Selected work',
        run: function () { goTo(art); }
      });
    });

    /* Ledger rows appear in two sections; keep them in separate palette
       buckets so an engagement never looks like a side project. */
    [['#index .row[data-project]', 'Index of works'],
     ['#practice .row[data-project]', 'The practice']
    ].forEach(function (pair) {
      $$(pair[0]).forEach(function (row) {
        items.push({
          name: row.getAttribute('data-project'),
          kind: row.getAttribute('data-kind') || 'Index',
          group: pair[1],
          run: function () { goTo(row); disclosure.openIn(row); }
        });
      });
    });

    items.push(
      {
        name: 'LinkedIn — in/saurabhshiral',
        kind: 'Link', group: 'Links',
        run: function () { window.open('https://www.linkedin.com/in/saurabhshiral/', '_blank', 'noopener'); }
      },
      {
        name: 'GitHub — @saurabhshiral',
        kind: 'Link', group: 'Links',
        run: function () { window.open('https://github.com/saurabhshiral', '_blank', 'noopener'); }
      },
      {
        name: 'Switch to light / dark theme',
        kind: 'Command', group: 'Commands',
        run: function () { theme.toggle(); }
      },
      {
        name: 'Expand every index row',
        kind: 'Command', group: 'Commands',
        run: function () {
          var idx = document.getElementById('index');
          if (idx) goTo(idx);
          disclosure.openAll('#index .row');
        }
      },
      {
        name: 'Expand everything on the page',
        kind: 'Command', group: 'Commands',
        run: function () { disclosure.openAll('.row, .unit--deep'); }
      },
      {
        name: 'Back to top',
        kind: 'Command', group: 'Commands',
        run: function () {
          window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
        }
      },
      {
        name: 'Print / save as PDF',
        kind: 'Command', group: 'Commands',
        run: function () { window.print(); }
      }
    );

    function goTo(el) {
      el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }

    /* Subsequence match — "dgp" finds "DR Grand Prix". Earlier, tighter
       matches and word-start hits score higher. */
    function score(query, text) {
      if (!query) return 1;
      var q = query.toLowerCase();
      var t = text.toLowerCase();
      var direct = t.indexOf(q);
      if (direct === 0) return 1000;
      if (direct > 0) return 700 - direct;

      var ti = 0, hits = 0, penalty = 0;
      for (var qi = 0; qi < q.length; qi++) {
        var found = -1;
        while (ti < t.length) {
          if (t[ti] === q[qi]) { found = ti; ti++; break; }
          ti++;
        }
        if (found === -1) return 0;
        if (found > 0 && /[\s\-—·(]/.test(t[found - 1])) { hits += 12; } else { hits += 3; }
        penalty += found;
      }
      return Math.max(1, 300 + hits - penalty * 0.4);
    }

    var results = [];
    var active = 0;

    function render(query) {
      results = items
        .map(function (it) { return { it: it, s: score(query, it.name + ' ' + it.kind) }; })
        .filter(function (r) { return r.s > 0; })
        .sort(function (a, b) { return b.s - a.s; })
        .map(function (r) { return r.it; });

      list.innerHTML = '';
      empty.hidden = results.length > 0;

      /* Group headers only in the unfiltered list, and only on the coarse
         `group` bucket — heading every distinct project kind produced ten
         headers for twenty rows, which read as noise rather than structure. */
      var lastGroup = null;
      results.forEach(function (it, i) {
        if (!query && it.group !== lastGroup) {
          var g = document.createElement('li');
          g.className = 'cmdk__group';
          g.setAttribute('role', 'presentation');
          g.textContent = it.group;
          list.appendChild(g);
          lastGroup = it.group;
        }
        var li = document.createElement('li');
        li.className = 'cmdk__item';
        li.id = 'cmdk-opt-' + i;
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', String(i === active));

        var name = document.createElement('span');
        name.className = 'cmdk__item-name';
        name.textContent = it.name;
        var kind = document.createElement('span');
        kind.className = 'cmdk__item-kind';
        kind.textContent = it.kind;

        li.appendChild(name);
        li.appendChild(kind);
        li.addEventListener('click', function () { choose(i); });
        li.addEventListener('mousemove', function () { if (active !== i) { active = i; mark(); } });
        list.appendChild(li);
      });
      mark();
    }

    function optionEls() { return $$('.cmdk__item', list); }

    function mark() {
      var els = optionEls();
      if (!els.length) { input.removeAttribute('aria-activedescendant'); return; }
      if (active >= els.length) active = els.length - 1;
      if (active < 0) active = 0;
      els.forEach(function (el, i) { el.setAttribute('aria-selected', String(i === active)); });
      var cur = els[active];
      input.setAttribute('aria-activedescendant', cur.id);
      if (cur.scrollIntoView) cur.scrollIntoView({ block: 'nearest' });
    }

    function move(delta) {
      var n = optionEls().length;
      if (!n) return;
      active = (active + delta + n) % n;
      mark();
    }

    function choose(i) {
      var it = results[typeof i === 'number' ? i : active];
      if (!it) return;
      close();
      // Let the dialog finish closing before scrolling, or the scroll is lost.
      requestAnimationFrame(function () { it.run(); });
    }

    function open() {
      if (dialog.open) return;
      dialog.showModal();
      input.value = '';
      active = 0;
      render('');
      input.focus();
    }
    function close() { if (dialog.open) dialog.close(); }

    $$('[data-cmdk-open]').forEach(function (btn) { btn.addEventListener('click', open); });

    input.addEventListener('input', function () { active = 0; render(input.value.trim()); });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === 'Home') { e.preventDefault(); active = 0; mark(); }
      else if (e.key === 'End') { e.preventDefault(); active = optionEls().length - 1; mark(); }
      else if (e.key === 'Enter') { e.preventDefault(); choose(); }
      else if (e.key === 'Tab') { e.preventDefault(); move(e.shiftKey ? -1 : 1); }
    });

    /* Click the backdrop to dismiss. */
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) close();
    });

    document.addEventListener('keydown', function (e) {
      var mod = isApple ? e.metaKey : e.ctrlKey;
      if (mod && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); dialog.open ? close() : open(); return; }
      if (e.key === '/' && !dialog.open) {
        var t = e.target;
        var typing = t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
        if (!typing) { e.preventDefault(); open(); }
      }
    });
  })();
})();
