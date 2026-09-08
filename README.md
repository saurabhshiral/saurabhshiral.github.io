# saurabhshiral.github.io

Personal site: [saurabhshiral.github.io](https://saurabhshiral.github.io/).
Static HTML, CSS and vanilla JavaScript. No build step, runtime libraries, tracking,
or third-party font requests. GitHub Actions publishes pushes to `main` to Pages.

## Design

A navy, coral and mint opening leads into visual project stories, a biography,
project index, career timeline, technology stack and contact section. Geist handles
body text and headings, Fraunces the display accent, and Geist Mono the metadata.
All fonts are self-hosted.

The original Canvas 2D illustration projects a three-dimensional data field: 147
points assemble into three platform layers, followed by moving signals. Ingest,
Build and Run buttons let visitors explore the stages. Pointer movement adds a
small change in perspective. Content and actions are available immediately.

The canvas caps pixel density at 1.5 and updates at approximately 30 frames per
second. It stops outside the viewport, in background tabs, when paused, or when
reduced motion is requested. A static SVG remains available without JavaScript
or a canvas context. The animation is an illustration, not live telemetry.

The six-stop header navigator and continuous margin thread follow native scrolling
in both directions. Their positions update after font loading, viewport changes
and disclosure resizing. One scheduled frame updates the thread and chapter state.
Reduced motion shows the complete static line with discrete chapter updates.

Project cards provide a short summary and visual preview before a native HTML
`details` element containing the full case study. Other index and career rows use
button disclosures. The command palette indexes the HTML and can expand all detail.
Light and dark themes and the motion preference are remembered locally.

## Files

```text
index.html                semantic content and decorative SVG fallback
assets/css/tokens.css     base fonts, type scale and motion tokens
assets/css/styles.css     base layout and shared components
assets/css/journey.css    connected chapter navigation and margin thread
assets/css/studio.css     current palette, opening scene and visual project layout
assets/js/main.js         disclosures, theme, pause, reveals and command palette
assets/js/journey.js      reading position, thread geometry and chapter state
assets/js/studio.js       interactive canvas illustration and print disclosures
assets/fonts/             self-hosted variable fonts
assets/img/               favicon, social image and project previews
```

## Preview provenance

- `pse-preview.png`: screenshot of the public PSE Intel interface populated with
  the project's existing archived August 2026 JSON. The preview caption identifies
  the archive; it is not presented as current news.
- `vatavaran-preview.png`: screenshot of the public Vatavaran interface using its
  own built-in demo dataset. The caption explicitly identifies the demo data.
- DR Grand Prix: original inline SVG workflow illustration, explicitly labelled
  as an illustration because the project is private.

## Reference study

Reviewed [Bruno Simon's portfolio repository](https://github.com/brunosimon/folio-2019),
[Cuberto's particles repository](https://github.com/Cuberto/particles),
[pmndrs/drei](https://github.com/pmndrs/drei), [Lusion](https://lusion.co/), and
[Dennis Snellenberg](https://dennissnellenberg.com/) for interactive openings and
visual storytelling. Earlier navigation study included
[Brittany Chiang](https://brittanychiang.com/) and [Rauno Freiberg](https://rauno.me/).
The design and canvas implementation here are original; no source code or artwork
was copied from these references. X searches did not provide usable post content.

## Run and edit

Serve the repository, for example with `python -m http.server 8000`.
Copy, project summaries and career details live directly in `index.html`.
Current colours and layout overrides live in `assets/css/studio.css`.
New native disclosures use `details` and `summary`. For ledger disclosures, provide
`data-disclose` and `aria-controls` on a button pointing to a unique panel ID.

## Sources and confidentiality

Career history, education, sectors and the enterprise stack come from
`Saurabh_Shiral_Data_Analytics_2025.docx`. Scope for the current engagement comes
from the FY26 crib sheet. Project detail comes from each project's own repository.

Engagements are described by sector rather than client name. Excluded from the
public site: revenue, ROM, deal and capitalization figures; incident and ticket
counts and SLA detail; internal system, programme and vendor names; colleague
names and other employees' performance information. No invented outcome metrics.

## Accessibility and validation

Semantic landmarks, skip link, visible keyboard focus, native detail disclosures,
and a native dialog command palette. Custom disclosures expose `aria-expanded`
and `aria-controls`, with hidden panels removed from the accessibility tree.
Interrupted transitions settle through a completion listener or fallback timer.

The header pause control covers continuous and entrance motion. The OS reduced
motion setting takes precedence. Canvas controls stay usable in reduced motion.
The page remains navigable and readable without JavaScript; print opens the full
case studies and restores disclosure state afterwards.

Validation for this edition: Chromium at 320x740, 375x812, 768x1024, 1009x640,
1440x900 and 1920x1080; horizontal overflow and visible hero actions on landscape
screens; canvas intro and keyboard stage selection; pause and reduced-motion
stability; chapter state after resizing and scrolling; disclosure/thread resizing;
project image loading; dark theme; printing; JavaScript-disabled content; and
browser runtime errors. Browser scripts and screenshots live in ignored `_review/`.
The disclosure regression suite is retained in the repository:

```bash
node tests/disclosure.cjs
```
