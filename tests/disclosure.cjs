/* Regression checks for concurrent disclosures. Run: node tests/disclosure.cjs */
'use strict';
const source = require('node:fs').readFileSync(require('node:path').join(__dirname, '../assets/js/main.js'), 'utf8');
const report = console.log;

function assert(value, label) { if (!value) throw Error(label); }
var panels = {};
var buttons = [];
var timers = new Map();
var timerId = 0;
function add(id) {
  var events = new Set();
  var panel = {id: id, hidden: true, style: {}, scrollHeight: 240, offsetHeight: 240,
    addEventListener: function (name, fn) { events.add(fn); },
    removeEventListener: function (name, fn) { events.delete(fn); },
    events: events
  };
  var attrs = {'aria-controls': id, 'aria-expanded': 'false'};
  var btn = {getAttribute: function(k) { return attrs[k]; },
    setAttribute: function(k,v) { attrs[k] = v; }, addEventListener: function(name, fn) { this[name] = fn; }};
  panels[id] = panel; buttons.push(btn);
  return {btn: btn, panel: panel};
}
var a = add('a'), b = add('b');
function flush() { var pending = Array.from(timers.values()); timers.clear(); pending.forEach(function (fn) { fn(); }); }
var code = source.slice(source.indexOf('  var disclosure = (function () {'), source.indexOf('  /* ── Command palette'));
var api = new Function('$$', '$', 'document', 'setTimeout', 'clearTimeout', 'reduceMotion', code + '\nreturn disclosure;')(
  function (selector) { return selector === '[data-disclose]' ? buttons : [a, b]; },
  function (selector, container) { return container.btn; },
  {getElementById: function(id) { return panels[id]; }},
  function(fn) { timers.set(++timerId, fn); return timerId; },
  function(id) { timers.delete(id); }, false);
api.openAll('.row'); flush();
assert(a.panel.style.height === 'auto' && b.panel.style.height === 'auto', 'Both concurrently opened panels must settle to auto height');
assert(a.panel.events.size === 0 && b.panel.events.size === 0, 'Transition listeners must be cleaned up');
a.btn.click(); b.btn.click(); b.btn.click(); flush();
assert(a.panel.hidden && !b.panel.hidden && b.panel.style.height === 'auto', 'Closing one panel while reopening another must settle independently');
api.openIn(a); a.btn.click(); a.btn.click(); flush();
assert(!a.panel.hidden && a.panel.style.height === 'auto', 'Rapid toggles must finish in the last requested state');
api.settleAll();
assert(!a.panel.hidden && !b.panel.hidden, 'Pausing motion preserves open panels');
a.btn.setAttribute('aria-expanded', 'false');
api.settleAll();
assert(a.panel.hidden && !b.panel.hidden, 'Pausing motion hides only collapsed panels');
a.btn.setAttribute('aria-expanded', 'false'); a.panel.hidden = true;
api.openIn(a);
a.btn.setAttribute('aria-expanded', 'false');
api.settleAll(); flush();
assert(a.panel.hidden && a.panel.style.height === '', 'Old completion cannot undo a newer settled state');
report('Disclosure concurrency, listener cleanup, pause state and stale callback checks passed.');
