# Sales Play Activator

A single-file, self-contained B2B sales enablement web app that turns raw discovery-call notes into a targeted, ready-to-execute "sales play." The seller pastes in conversation notes, the app scores the notes against six offering categories, and then generates talking points, openers, next steps, objection handling, an email template, a LinkedIn message, and a downloadable "Seller Packet."

The entire application — HTML, CSS, data, and JavaScript logic — lives in a single `index.html` file (~300 KB, ~4,250 lines). No build step, no backend, no external dependencies beyond Google Fonts.

**Live deployment:** https://witty-tree-0635f2e10.2.azurestaticapps.net/ (Azure Static Web Apps)

## Parity with the live app

The `index.html` in this repo is **byte-identical** to the version currently served at the Azure Static Web Apps URL above (verified via MD5: `705e1bcfe23c5d7f56827843affdb133`, 307,862 bytes, 4,249 lines). This repo is a snapshot of the production build.

## What the app does

The flow is broken into three visual steps:

1. **Step 1 — Discovery.** A large textarea accepts raw call notes. A "Use this example" button (`useExample()`) drops in reference call notes for quick demos. An editable "prompt" panel is accessible throughout the flow.
2. **Step 2 — Offering match.** `scoreOfferings()` analyzes the text and surfaces a ranked set of offering cards with industry and partner context, win rates, typical deal duration, and ACV ranges. The seller picks one (`selectOff()`), which unlocks the play.
3. **Step 3 — Play results.** A six-tab interface renders the generated play: talking points, opener, next steps, competitive positioning, email/LinkedIn outreach, and fallback handling. Each tab is populated by a family of offering-specific generator functions (`getOfferingTPs`, `getOfferingOpener`, `getOfferingNext`, `getOfferingFallback`, `getOfferingPlayName`).

Supporting UI:

- **Seller Packet modal** (`openPacket()` / `openPacketFromPlay()`) renders downloadable asset bundles per offering.
- **Persistent notes drawer** — a right-side slide-out panel with tabbed notes, persisted to `localStorage` via `saveNotes()` / `loadNotes()`.
- **Copy play** button (`doCopy()`) copies the generated play to clipboard.
- **Full reset** (`fullReset()`) clears state and returns to Step 1.
- **ACR metric popup** explains the headline metric inline.

## Architecture

- **Single-file SPA.** `index.html` contains the markup, a large `<style>` block using CSS custom properties for theming (dark purple/teal gradient), and an embedded `<script>` block with all behavior.
- **Embedded data model.** A `const DATA = { ... }` object (starting around line 2095) holds industry segments (Financial Services, Healthcare, Retail, etc.), offering definitions (win rates, ACV, duration), talking-point libraries, and customer-journey content. No fetches — everything ships with the page.
- **Core logic functions:**
  - `analyse()` — kicks off scoring from the discovery textarea.
  - `scoreOfferings(text)` — matches notes to offerings.
  - `renderOfferings(txt)` — builds the Step 2 card grid.
  - `buildPlay()` / `render()` — assembles the Step 3 tabs from the selected offering plus industry/partner context.
  - `goTo(n)` / `setProgress(step)` — step navigation and progress bar.
  - `tab(el,id)` / `tabReset()` — tab switching inside the play view.
  - `showLoad(msg, fn)` — simulated loading state between steps.
  - `openPacket(id)` — dynamic seller-packet modal, also exposed as `window.openPacket` for inline handlers.
- **Styling.** CSS custom properties (`--bg`, `--card`, `--purple`, `--teal`, `--green`, radii `--r` / `--rl` / `--rxl`, borders `--b1`) drive a consistent gradient-heavy dark theme. Outfit + Literata + JetBrains Mono are loaded from Google Fonts.
- **Responsiveness.** Mobile breakpoints at 768, 600, 580, 520, and 400 px collapse the two-column grids and hide non-essential chrome.

## Running locally

It's a static file — no tooling required:

```bash
# Option 1: open directly
start index.html     # Windows
open index.html      # macOS

# Option 2: serve it
python -m http.server 8080
# then visit http://localhost:8080
```

## Deployment

The live version is hosted on **Azure Static Web Apps**. To redeploy a new version, replace `index.html` and push — Azure's default static build picks up the root `index.html` with no build configuration needed.

## Repository contents

- `index.html` — the entire application (markup, styles, data, logic).
- `README.md` — this file.

## Notes for future changes

- Because everything lives in one file, diffs on `index.html` can be large. Prefer targeted edits to the `DATA` object or specific generator functions (`getOffering*`) rather than wholesale rewrites.
- The `DATA` object is the right place to add new industries, offerings, or talking-point libraries.
- New play tabs should be added alongside the existing tab system (`tab()` / `tabReset()`) and wired into `render()`.
- `localStorage` is used for the notes drawer only; there is no other persisted state.
