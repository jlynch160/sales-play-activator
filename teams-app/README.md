# MajorKey Solution Plays - Teams App

**Ready to upload!** The zip file `SolutionPlays.zip` is already packaged and on your Desktop.

## What's in the zip

- `manifest.json` - App configuration (GUID: `6f1bc950-142a-4029-90ea-7f3920f8db82`)
- `icon-color.png` - 192x192 MajorKey-branded color icon (purple/green gradient with "MK")
- `icon-outline.png` - 32x32 outline icon (white "MK" with rounded border)

## Upload to Teams

### Option A - Test it yourself first (recommended)

1. Open **Microsoft Teams** (desktop or web)
2. Click **Apps** in the left sidebar (grid icon)
3. Click **Manage your apps** at the bottom
4. Click **Upload an app** button
5. Choose **Upload a custom app** (or "Upload a personal app")
6. Select `SolutionPlays.zip` from your Desktop
7. Click **Add** when Teams prompts you

The app will appear as "Solution Plays" in your Teams sidebar.

### Option B - Roll out to your team

1. Go to Teams Admin Center: https://admin.teams.microsoft.com
2. **Teams apps** -> **Manage apps** -> **Actions** -> **Upload new app**
3. Upload `SolutionPlays.zip`
4. Once approved, assign to users via **Setup policies** -> **App setup policies**
5. Pin to the app bar so sellers see it automatically

## What users will see

When a seller opens the app inside Teams:

1. The app loads from https://nice-grass-018e5aa0f.2.azurestaticapps.net/
2. Teams SDK automatically passes their identity (name, email, tenant)
3. A green user badge appears in the top-right showing their initials + name
4. All email templates auto-fill with their actual name and email in the signature
5. No separate login required

## If you want to regenerate

The icons were generated from this script: `gen_teams_icons.js` in Downloads folder. To re-create:

```bash
cd c:/Users/jlynch/Downloads
node gen_teams_icons.js
```

To re-zip:

```bash
cd c:/Users/jlynch/Downloads && node -e "
const fs=require('fs'),archiver=require('archiver');
const d='sales-play-activator-main/sales-play-activator-main/teams-app';
const o=fs.createWriteStream(d+'/SolutionPlays.zip');
const a=archiver('zip',{zlib:{level:9}}); a.pipe(o);
a.file(d+'/manifest.json',{name:'manifest.json'});
a.file(d+'/icon-color.png',{name:'icon-color.png'});
a.file(d+'/icon-outline.png',{name:'icon-outline.png'});
a.finalize();"
```

## Troubleshooting

**"Invalid manifest"** - Verify the app URL in manifest.json matches your deployed Static Web App URL.

**Icons look wrong** - Open the PNGs directly to verify they rendered correctly. They must be EXACTLY 192x192 and 32x32.

**App shows but no user badge** - Expected when accessed outside Teams (e.g. directly in a browser). The Teams JS SDK only activates inside Teams.

**Upload is blocked** - Your tenant may require admin approval for custom apps. Ask an M365 admin to enable "Allow custom apps" in Teams Admin Center -> Teams apps -> Manage apps -> Org-wide settings.

## To update the app

When you want to push changes:
1. Update `index.html` and redeploy to Azure (GitHub push auto-deploys)
2. If the manifest itself changed, bump `version` in manifest.json (e.g. "1.0.0" -> "1.0.1")
3. Re-zip and re-upload to Teams
4. Teams auto-updates the app for users
