# MajorKey Solution Plays - Teams App

This folder contains the Teams app manifest to deploy Solution Plays as a personal tab inside Microsoft Teams.

## What you get

- Sellers access Solution Plays directly inside Teams (no separate login)
- User identity (name, email) auto-populates email signatures via Teams SSO
- Theme automatically matches Teams (light/dark/high-contrast)

## One-time setup

### 1. Generate a GUID for the app ID

Open PowerShell and run:
```powershell
[guid]::NewGuid()
```

Copy the GUID and paste it into `manifest.json` where it says `REPLACE-WITH-NEW-GUID`.

### 2. Create the two icon files

Teams requires two PNG icons in this folder:

- **icon-color.png** — 192x192px, full color MajorKey logo on any background
- **icon-outline.png** — 32x32px, white outline logo on transparent background

Use any of these to create them:
- Figma/Sketch/Photoshop with the MajorKey logo SVG
- Online converter: https://cloud.microsoft/designer (built into M365)
- Microsoft's icon generator: https://developer.microsoft.com/en-us/microsoft-teams/app-icon-generator

Drop both files into this folder.

### 3. Package the app

Create a zip containing these 3 files (at the root, not in a subfolder):
- `manifest.json`
- `icon-color.png`
- `icon-outline.png`

Name it `SolutionPlays.zip`.

### 4. Upload to Teams

**Option A — Personal upload (test first):**
1. Open Teams
2. Click the `...` (Apps) in the left sidebar → **Manage your apps** → **Upload an app**
3. Choose **Upload a custom app** → select `SolutionPlays.zip`
4. Add to Teams

**Option B — Organization-wide deploy:**
1. Go to Teams Admin Center: https://admin.teams.microsoft.com
2. **Teams apps** → **Manage apps** → **Upload new app**
3. Upload `SolutionPlays.zip`
4. Once approved, assign to users via **Setup policies**

## What happens when a user opens it

1. Teams loads the Static Web App URL in an iframe
2. Teams JS SDK initializes automatically
3. Your name, email, and tenant are passed to the app via `microsoftTeams.app.getContext()`
4. The app populates your email signature with your real name/email
5. No separate login required

## Troubleshooting

- **App loads but shows no user badge:** Check browser console - Teams SDK may have failed to init. Happens in the standalone app URL (outside Teams) which is expected.
- **Icons missing:** They must be PNG (not JPG/SVG), exactly 192x192 and 32x32, named exactly as specified.
- **"Invalid manifest" error:** The GUID must be a valid v4 UUID, the URL must be HTTPS and not localhost.
