# saurabhshiral.github.io

Personal site — [saurabhshiral.github.io](https://saurabhshiral.github.io/)

Static HTML, CSS and vanilla JavaScript. No framework, no build step, no dependencies,
no tracking. Push to `main` and GitHub Pages serves it.

## Design

**Editorial Broadsheet** — typography as the primary interface, in the tradition of print
feature writing rather than the card-grid portfolio. Three grafts onto that spine:

| Element | Why |
| --- | --- |
| Long-form feature articles | The projects have stories worth more than a 40-word card |
| An expanding **index of works** | 20-second value for anyone who won't read prose — one row per project, opens in place, never navigates away |
| A **⌘K command palette** | Keyboard-first navigation; the index is built from the DOM so it can never drift from the content |

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
assets/js/main.js        progress, reveals, ledger rows, theme, ⌘K
assets/fonts/*.woff2     self-hosted variable fonts, latin subset
assets/img/              favicon.svg, og.png
```

## Run locally

No tooling required. Open `index.html` in a browser, or serve it to get correct font
paths and relative URLs:

```bash
python -m http.server 8000
# or
npx serve .
```

## Editing

- **Copy and projects** live directly in `index.html`. There is no data layer to keep in
  sync — the ⌘K palette and the section nav both read the DOM.
- **A new feature article**: copy an `<article class="feature">` block. The alternating
  gutter side is handled by `:nth-of-type(even)` in CSS, so ordering takes care of itself.
- **A new index row**: copy an `<li class="row">`. Give the `.row__panel` a unique `id` and
  point the button's `aria-controls` at it.
- **Colours or type**: change `assets/css/tokens.css` only. No colour or `font-family`
  value is hard-coded anywhere in `styles.css`.

## Accuracy note

LinkedIn blocks automated reading, so the career history here was assembled from public
search results and needs a once-over:

- [ ] Confirm role titles and the order of the five Accenture roles
- [ ] Add real start/end dates for the three intermediate roles in the `.ladder` list
      (currently rendered as "before that")
- [ ] Confirm degree names and institutions in the About margin notes

Everything about the projects came from their own repositories and READMEs, so that part is
accurate. No metrics are invented anywhere on the site — where a number isn't known, the
copy doesn't claim one.

## Accessibility & performance

- Semantic landmarks, skip link, visible `:focus-visible` on every interactive element
- Ledger rows are real `<button>`s with `aria-expanded` / `aria-controls`; panels carry
  `hidden` when collapsed so screen readers skip them
- ⌘K is a native `<dialog>` — focus trapping and Esc come free — wired as a
  `combobox`/`listbox` with `aria-activedescendant`
- Every animation sits behind `prefers-reduced-motion`
- Verified at 320 / 375 / 414 / 768 px with no horizontal scroll
- Print stylesheet expands all index rows and prints link targets, so ⌘P gives a usable CV
