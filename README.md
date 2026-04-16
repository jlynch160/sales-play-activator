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

The live version is hosted on **Azure Static Web Apps**. Because the entire app is a single static `index.html` with no build step, it can be deployed to virtually any static host in under a minute. Pick whichever option fits your workflow.

### 1. Azure Static Web Apps (current production host)

**Option A — Azure Portal (fastest, no CLI):**
1. Azure Portal → **Create a resource** → **Static Web App**.
2. Source: **Other** (skip GitHub Actions) for a one-off upload, or **GitHub** to wire CI.
3. Build preset: **Custom**. App location: `/`. Output location: *(leave blank)*. API location: *(leave blank)*.
4. If using GitHub, point it at this repo / `main` branch — Azure commits a workflow file and deploys on push.

**Option B — SWA CLI (one command):**
```bash
npm install -g @azure/static-web-apps-cli
swa deploy ./ --env production
```
SWA CLI will prompt for your deployment token (found under the Static Web App resource → **Manage deployment token**).

**Option C — GitHub Actions (already scaffolded by the portal flow):**
Pushing to `main` triggers the `Azure/static-web-apps-deploy@v1` action and ships `index.html` automatically. No build command needed.

**Option D — Deploy into a different Azure tenant (copy-paste scripts):**

Use these if you need to stand this up in a *separate* Azure tenant/subscription (for example, a customer tenant or a sandbox). Both scripts (1) sign in to the target tenant, (2) create the resource group + Static Web App on the Free tier, (3) retrieve the deployment token, and (4) push `index.html` with the SWA CLI.

Prereqs (one time): `az` CLI *or* `Az` PowerShell module, Node.js ≥ 18, and the SWA CLI (`npm i -g @azure/static-web-apps-cli`).

**Bash / Azure CLI**
```bash
# --- edit these four values ---
TENANT_ID="00000000-0000-0000-0000-000000000000"
SUBSCRIPTION_ID="00000000-0000-0000-0000-000000000000"
RG="rg-sales-play-activator"
APP="sales-play-activator"
LOCATION="eastus2"   # SWA Free tier regions: westus2, centralus, eastus2, westeurope, eastasia

az login --tenant "$TENANT_ID"
az account set --subscription "$SUBSCRIPTION_ID"

az group create -n "$RG" -l "$LOCATION"

az staticwebapp create \
  -n "$APP" -g "$RG" -l "$LOCATION" \
  --sku Free

TOKEN=$(az staticwebapp secrets list -n "$APP" -g "$RG" \
  --query "properties.apiKey" -o tsv)

npx -y @azure/static-web-apps-cli deploy ./ \
  --deployment-token "$TOKEN" \
  --env production

az staticwebapp show -n "$APP" -g "$RG" \
  --query "defaultHostname" -o tsv
```

**PowerShell / Azure CLI** (works on Windows, cross-tenant friendly)
```powershell
# --- edit these four values ---
$TenantId       = "00000000-0000-0000-0000-000000000000"
$SubscriptionId = "00000000-0000-0000-0000-000000000000"
$Rg             = "rg-sales-play-activator"
$App            = "sales-play-activator"
$Location       = "eastus2"

az login --tenant $TenantId | Out-Null
az account set --subscription $SubscriptionId

az group create -n $Rg -l $Location | Out-Null

az staticwebapp create `
  -n $App -g $Rg -l $Location `
  --sku Free | Out-Null

$Token = az staticwebapp secrets list -n $App -g $Rg `
  --query "properties.apiKey" -o tsv

npx -y @azure/static-web-apps-cli deploy ./ `
  --deployment-token $Token `
  --env production

az staticwebapp show -n $App -g $Rg --query "defaultHostname" -o tsv
```

**PowerShell / Az module** (no Azure CLI required)
```powershell
# --- edit these four values ---
$TenantId       = "00000000-0000-0000-0000-000000000000"
$SubscriptionId = "00000000-0000-0000-0000-000000000000"
$Rg             = "rg-sales-play-activator"
$App            = "sales-play-activator"
$Location       = "eastus2"

# One-time: Install-Module Az -Scope CurrentUser -Repository PSGallery -Force
Connect-AzAccount -Tenant $TenantId -Subscription $SubscriptionId | Out-Null

if (-not (Get-AzResourceGroup -Name $Rg -ErrorAction SilentlyContinue)) {
    New-AzResourceGroup -Name $Rg -Location $Location | Out-Null
}

New-AzStaticWebApp -ResourceGroupName $Rg -Name $App `
  -Location $Location -SkuName Free | Out-Null

$Token = (Get-AzStaticWebAppSecret -ResourceGroupName $Rg -Name $App).Property.ApiKey

npx -y @azure/static-web-apps-cli deploy ./ `
  --deployment-token $Token `
  --env production

(Get-AzStaticWebApp -ResourceGroupName $Rg -Name $App).DefaultHostname
```

Run any of these from the repo root (where `index.html` lives). The final command prints the `*.azurestaticapps.net` URL of the new deployment. To tear it down: `az group delete -n $RG --yes --no-wait` (or `Remove-AzResourceGroup -Name $Rg -Force`).

### 2. GitHub Pages (free, tied to this repo)

```bash
gh repo edit jlynch160/sales-play-activator --visibility public   # Pages requires public OR GitHub Pro/Enterprise
gh api -X POST repos/jlynch160/sales-play-activator/pages -f source[branch]=main -f source[path]=/
```
Or via UI: **Settings → Pages → Source: `main` / root → Save**. Live at `https://jlynch160.github.io/sales-play-activator/` within ~60 seconds.

### 3. Netlify (drag-and-drop or CLI)

**Drag-and-drop:** go to https://app.netlify.com/drop and drop `index.html`. Done — you get a live URL instantly.

**CLI:**
```bash
npm install -g netlify-cli
netlify deploy --dir=. --prod
```

### 4. Vercel

```bash
npm install -g vercel
vercel --prod
```
Accept the defaults — Vercel auto-detects the static site and serves `index.html` from the root.

### 5. Cloudflare Pages

```bash
npm install -g wrangler
wrangler pages deploy . --project-name sales-play-activator
```
Or connect the GitHub repo in the Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**. Framework preset: **None**. Build command: *(leave blank)*. Build output directory: `/`.

### 6. AWS S3 + CloudFront (enterprise / custom domain)

```bash
aws s3 mb s3://sales-play-activator
aws s3 website s3://sales-play-activator --index-document index.html
aws s3 cp index.html s3://sales-play-activator/ --acl public-read
```
Front with CloudFront for HTTPS and a custom domain.

### 7. Any web server / intranet share

It's a single static file. Drop `index.html` onto IIS, nginx, Apache, a SharePoint document library, or an internal file share and open it. No server-side runtime is required.

### 8. Run entirely offline

Double-click `index.html` — it runs from `file://`. The only external dependency is Google Fonts; the page still works without them (fonts just fall back to system defaults).

### Redeploy checklist

1. Edit `index.html` locally.
2. `git add index.html && git commit -m "..." && git push`
3. Your chosen host picks up the change (instant for Netlify/Vercel/Cloudflare, ~30–60 s for Azure SWA and GitHub Pages).

## Repository contents

- `index.html` — the entire application (markup, styles, data, logic).
- `README.md` — this file.

## Notes for future changes

- Because everything lives in one file, diffs on `index.html` can be large. Prefer targeted edits to the `DATA` object or specific generator functions (`getOffering*`) rather than wholesale rewrites.
- The `DATA` object is the right place to add new industries, offerings, or talking-point libraries.
- New play tabs should be added alongside the existing tab system (`tab()` / `tabReset()`) and wired into `render()`.
- `localStorage` is used for the notes drawer only; there is no other persisted state.
