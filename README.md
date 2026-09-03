# saurabhshiral.github.io

Personal site — [saurabhshiral.github.io](https://saurabhshiral.github.io/)

Static HTML, CSS and vanilla JavaScript. No framework, no build step, no dependencies,
no tracking. Push to `main` and GitHub Pages serves it.

## Design

**Editorial Broadsheet** — typography as the primary interface, in the tradition of print
feature writing rather than the card-grid portfolio. Three grafts onto that spine:

| Element | Why |
| --- | --- |
| Feature articles in **labelled units** | Each project reads in three tiers — deck (5s), labelled blocks (20s), then a disclosure for the deep detail. Undifferentiated prose is a wall; mono margin labels make the structure legible before a word is read |
| Two expanding **ledgers** | One for side projects, one for client engagements. Twenty-second value for anyone who won't read prose — one row each, opens in place, never navigates away |
| A **⌘K command palette** | Keyboard-first navigation. Its index is built from the DOM, so it cannot drift from the content |

Light is the canonical theme. Dark is a courtesy variant driven by
`prefers-color-scheme`, overridable by the toggle and remembered in `localStorage`.

- **Display type** — Fraunces (variable, `opsz` 9–144). The masthead animates along the
  optical-size axis on load, so the letterforms resolve into their display cut.
- **Body / UI** — Geist. **Metadata** — Geist Mono.
- **Palette** — warm paper `#FBF9F5`, ink `#16130F`, vermilion `#D6431F`. Body-size accent
  text uses `#A32F12` to hold 6.7:1 contrast.

All three fonts are self-hosted variable `woff2` files (~120 KB total) — no request to
Google Fonts, no third-party dependency at runtime.

## Layout

```
index.html               all content — semantic, crawlable, readable with JS off
assets/css/tokens.css    fonts + colour + type scale + motion tokens
assets/css/styles.css    everything else; references tokens only
assets/js/main.js        progress, reveals, disclosures, theme, ⌘K
assets/fonts/*.woff2     self-hosted variable fonts, latin subset
assets/img/              favicon.svg, og.png
```

Sections: masthead · About · Selected work (3 features) · Index of works (side projects) ·
The practice (6 client engagements + certifications) · What I reach for (two stacks) ·
Contact · colophon.

## Run locally

No tooling required. Open `index.html` in a browser, or serve it to get correct font
paths and relative URLs:

```bash
python -m http.server 8000
# or
npx serve .
```

## Editing

- **Copy, projects and engagements** live directly in `index.html`. There is no data layer
  to keep in sync — the ⌘K palette and the section nav both read the DOM.
- **A new feature article**: copy an `<article class="feature">` block. The alternating
  gutter side is handled by `:nth-of-type(even)` in CSS, so ordering takes care of itself.
- **A new index row or engagement**: copy an `<li class="row">`. Give the `.row__panel` a
  unique `id` and point the button's `aria-controls` at it.
- **Any new expander**: put `data-disclose` on the button and `aria-controls` on the panel —
  one implementation in `main.js` drives ledger rows and prose units alike.
- **Colours or type**: change `assets/css/tokens.css` only. No colour or `font-family`
  value is hard-coded anywhere in `styles.css`.

## Sources, and what is deliberately left out

Career history, education, sectors and the enterprise stack come from
`Saurabh_Shiral_Data_Analytics_2025.docx`. Scope for the current engagement comes from the
FY26 crib sheet. Project detail comes from each project's own repository.

**Client confidentiality.** Engagements are described by sector — "a Pacific Northwest
utility", "a global steel producer" — rather than named. Clients are Accenture's to
announce, not mine. Deliberately excluded from this public page, and belonging only in
Workday:

- revenue, ROM, deal and capitalization figures
- incident / RITM / ticket counts and SLA detail
- internal system, programme and vendor names
- every colleague name, and any other employee's performance or talent-cycle information

**No invented metrics.** Where a number isn't known or isn't publishable, the copy doesn't
claim one. Nothing on the page asserts an outcome that isn't in a source document.

## Accessibility & performance

- Semantic landmarks, skip link, visible `:focus-visible` on every interactive element
- Every disclosure is a real `<button>` with `aria-expanded` / `aria-controls`; panels carry
  `hidden` when collapsed so screen readers skip them. The collapse settles on
  `transitionend` **or** a timer, so an interrupted transition can never leave a
  visually-collapsed panel exposed to assistive tech
- ⌘K is a native `<dialog>` — focus trapping and Esc come free — wired as a
  `combobox`/`listbox` with `aria-activedescendant`
- Scroll reveals are opt-in via a `.js` class set before first paint, with a 2.5s timeout
  fallback, so failed or blocked JavaScript can never leave content invisible
- Every animation sits behind `prefers-reduced-motion`
- Verified at 320 / 375 / 414 / 768 / 1440 / 2275 px with zero overflowing elements
  (2275px is the layout viewport at 80% browser zoom on a wide monitor)
- Print stylesheet expands all rows and prints link targets, so ⌘P gives a usable CV
