# NXTGEN Rebrand & Restyle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebrand FUXA as "NXTGEN" (branding text, logo/favicon, package metadata) and apply a cyan/blue-accented light+dark visual restyle, without changing functionality.

**Architecture:** No structural changes. This is a text/asset/theme-value substitution across the existing Angular client (`client/`), Node.js server (`server/`), and Electron wrapper (`app/electron/`). The app already has a working CSS-custom-property theme system (`client/src/app/_config/theme.config.ts` + `ThemeService`) and Angular Material M2 palette theming (`client/src/theme.scss`) — this plan changes their *values*, not their mechanism.

**Tech Stack:** Angular 18 + Angular Material 18 (client), Node.js/Express (server), Electron (app/electron). No test framework covers UI copy/theme values, so each task's "test" is a `grep`/`node -e` assertion plus, for the theme task, an `ng build`.

## Global Constraints

- Brand name everywhere user-visible: **NXTGEN** (all caps, one word).
- Do NOT rename internal identifiers that are not user-visible: `fuxa-view` component/selector names, any `.fuxa-*` CSS classes, `window.fuxaScriptAPI` (public scripting API used by existing user widget scripts), `DeviceType.FuxaServer` enum string value (persisted in saved project JSON — renaming breaks loading existing projects), `kiosk-widgets.service.ts`'s `repoName = 'FUXA-SVG-Widgets'` (points at the real external GitHub repo of SVG widgets — functional, not branding).
- Do NOT modify `LICENSE` (MIT, frangoteam copyright) — required to be preserved in a derivative work.
- Do NOT touch files under `server/test/` — they contain `'FUXA'`/`'fuxa@example.com'` as literal test fixture data, not branding; changing them breaks the tests.
- Primary accent color: cyan `#0e7490` (used for active/selected UI states); Angular Material palette swaps use `mat.$m2-cyan-palette`.
- This directory is not currently a git repository. Task 0 initializes one so the rest of the plan can commit incrementally and be rolled back if needed.

---

### Task 0: Initialize git repository with a baseline commit

**Files:**
- Create: `.gitignore`

- [ ] **Step 1: Check there's no existing `.git`**

Run: `cd /Users/tjc/FUXA-master && git status`
Expected: `fatal: not a git repository (or any of the parent directories): .git`

- [ ] **Step 2: Create a `.gitignore`**

```
node_modules/
dist/
.angular/
server/_appdata/
server/_db/
server/_logs/
server/_images/
*.log
```

- [ ] **Step 3: Init and make the baseline commit**

```bash
cd /Users/tjc/FUXA-master
git init
git add -A
git commit -m "chore: baseline import of FUXA before NXTGEN rebrand"
```

Expected: commit succeeds; `git log --oneline -1` shows the commit.

---

### Task 1: Rebrand package metadata and NOTICE

**Files:**
- Modify: `client/package.json:2,6`
- Modify: `server/package.json:2,3`
- Modify: `app/electron/package.json:2,4,22,26`
- Modify: `server/main.js:600`
- Create: `NOTICE.md`

**Interfaces:** none (metadata only, no code consumes these strings programmatically except `process.title`, which is display-only in `ps`/task manager).

- [ ] **Step 1: Update `client/package.json`**

Change:
```json
  "name": "fuxa",
```
to:
```json
  "name": "nxtgen",
```
Change:
```json
  "description": "Web-based Process Visualization (SCADA/HMI/Dashboard) software",
```
to:
```json
  "description": "NXTGEN is a web-based Process Visualization (SCADA/HMI/Dashboard) software, based on FUXA.",
```

- [ ] **Step 2: Update `server/package.json`**

Change:
```json
  "name": "fuxa-server",
```
to:
```json
  "name": "nxtgen-server",
```
Change:
```json
  "description": "Web-based Process Visualization (SCADA/HMI/Dashboard) software",
```
to:
```json
  "description": "NXTGEN is a web-based Process Visualization (SCADA/HMI/Dashboard) software, based on FUXA.",
```

- [ ] **Step 3: Update `app/electron/package.json`**

Change:
```json
    "name": "fuxa",
    "version": "0.0.1",
    "description": "FUXA is a web-based Process Visualization (SCADA/HMI/Dashboard) software. With FUXA you can create modern process visualizations with individual designs for your machines and real-time data display.",
```
to:
```json
    "name": "nxtgen",
    "version": "0.0.1",
    "description": "NXTGEN is a web-based Process Visualization (SCADA/HMI/Dashboard) software, based on FUXA. Create modern process visualizations with individual designs for your machines and real-time data display.",
```
And change:
```json
        "appId": "com.frangoteam.fuxa",
        "productName": "FUXA",
```
to:
```json
        "appId": "com.nxtgen.app",
        "productName": "NXTGEN",
```

- [ ] **Step 4: Update process title in `server/main.js:600`**

Change:
```js
                process.title = 'FUXA';
```
to:
```js
                process.title = 'NXTGEN';
```

- [ ] **Step 5: Create `NOTICE.md`**

```markdown
# Notice

NXTGEN is based on [FUXA](https://github.com/frangoteam/FUXA), Copyright (c) 2019-2025 frangoteam,
licensed under the MIT License (see `LICENSE`).
```

- [ ] **Step 6: Verify**

Run: `cd /Users/tjc/FUXA-master && grep -rn "\"name\": \"fuxa" client/package.json server/package.json app/electron/package.json; grep -n "FUXA" app/electron/package.json server/main.js`
Expected: first grep prints nothing; second grep prints nothing (all instances replaced).

- [ ] **Step 7: Commit**

```bash
cd /Users/tjc/FUXA-master
git add client/package.json server/package.json app/electron/package.json server/main.js NOTICE.md
git commit -m "chore: rebrand package metadata to NXTGEN"
```

---

### Task 2: Rebrand client-side branding strings

**Files:**
- Modify: `client/src/index.html:8,84`
- Modify: `client/src/app/app.component.ts:53`
- Modify: `client/src/app/home/userinfo.dialog.html:15`
- Modify: `client/src/app/header/info.dialog.html:11`
- Modify: `client/src/app/maps/maps-view/maps-view.component.ts:81`
- Modify: `client/src/app/ar/ar-view/ar-view.component.html:6`
- Modify: `client/src/app/editor/app-settings/app-settings.component.ts:151`
- Modify: `client/src/app/reports/report-editor/report-editor.component.ts:143`
- Modify: `client/src/app/_models/device.ts:6`
- Modify: `client/src/app/_services/project.service.ts:109,148,1123,1140,1155`

**Interfaces:** none — these are literal UI/log strings, no other task depends on their exact value.

- [ ] **Step 1: `client/src/index.html`**

Change:
```html
    <title>FUXA</title>
```
to:
```html
    <title>NXTGEN</title>
```
Change:
```html
                <div style="display:block;font-size: 18px; font-weight: 600; text-align: center;">FUXA Loading...</div>
```
to:
```html
                <div style="display:block;font-size: 18px; font-weight: 600; text-align: center;">NXTGEN Loading...</div>
```

- [ ] **Step 2: `client/src/app/app.component.ts:53`**

Change:
```ts
		console.log(`FUXA v${environment.version}`);
```
to:
```ts
		console.log(`NXTGEN v${environment.version}`);
```

- [ ] **Step 3: `client/src/app/home/userinfo.dialog.html:15`**

Change:
```html
		FUXA powered by <span><b>frango</b>team</span>
```
to:
```html
		Powered by NXTGEN
```

- [ ] **Step 4: `client/src/app/header/info.dialog.html`**

Change:
```html
        <div style="display: block; font-size: 13px;margin-top: 10px;">
            powered by <span><b>frango</b>team</span>
        </div>
```
to:
```html
        <div style="display: block; font-size: 13px;margin-top: 10px;">
            Powered by NXTGEN
        </div>
```

- [ ] **Step 5: `client/src/app/maps/maps-view/maps-view.component.ts:81`**

Change:
```ts
                attribution: '&copy; FUXA'
```
to:
```ts
                attribution: '&copy; NXTGEN'
```

- [ ] **Step 6: `client/src/app/ar/ar-view/ar-view.component.html:6`**

Change:
```html
            <div class="ar-title">FUXA AR</div>
```
to:
```html
            <div class="ar-title">NXTGEN AR</div>
```

- [ ] **Step 7: `client/src/app/editor/app-settings/app-settings.component.ts:151`**

Change:
```ts
        let msg = <MailMessage>{ from: this.settings.smtp.mailsender || this.settings.smtp.username, to: this.smtpTestAddress, subject: 'FUXA', text: 'TEST' };
```
to:
```ts
        let msg = <MailMessage>{ from: this.settings.smtp.mailsender || this.settings.smtp.username, to: this.smtpTestAddress, subject: 'NXTGEN', text: 'TEST' };
```

- [ ] **Step 8: `client/src/app/reports/report-editor/report-editor.component.ts:143`**

Change:
```ts
            docDefinition['header'] = { text: 'FUXA by frangoteam', style:[{fontSize: 6}]};
```
to:
```ts
            docDefinition['header'] = { text: 'NXTGEN', style:[{fontSize: 6}]};
```

- [ ] **Step 9: `client/src/app/_models/device.ts:6`**

Change:
```ts
export const FuxaServer = {
    id: '0',
    name: 'FUXA'
};
```
to:
```ts
export const FuxaServer = {
    id: '0',
    name: 'NXTGEN'
};
```
(Only the display `name` changes. `FuxaServer.id` and the `DeviceType.FuxaServer` enum string are unchanged — matching logic elsewhere keys off those, not off `name`.)

- [ ] **Step 10: `client/src/app/_services/project.service.ts` console messages**

Change each of these four lines (found via `grep -n "console.error('FUXA" client/src/app/_services/project.service.ts` and `grep -n 'FUXA Error' client/src/app/_services/project.service.ts`):
```ts
                console.error('FUXA onRefreshProject error', err);
```
```ts
                console.error('FUXA load error', err);
```
```ts
        console.error('FUXA notifySaveError error', err);
```
```ts
        console.error('FUXA notifyServerError error');
```
```ts
                console.error(`FUXA Error: ${msg}`);
```
to (respectively):
```ts
                console.error('NXTGEN onRefreshProject error', err);
```
```ts
                console.error('NXTGEN load error', err);
```
```ts
        console.error('NXTGEN notifySaveError error', err);
```
```ts
        console.error('NXTGEN notifyServerError error');
```
```ts
                console.error(`NXTGEN Error: ${msg}`);
```

- [ ] **Step 11: Verify**

Run:
```bash
cd /Users/tjc/FUXA-master/client/src
grep -rn "FUXA" index.html app/app.component.ts app/home/userinfo.dialog.html app/header/info.dialog.html app/maps/maps-view/maps-view.component.ts app/ar/ar-view/ar-view.component.html app/editor/app-settings/app-settings.component.ts app/reports/report-editor/report-editor.component.ts app/_models/device.ts app/_services/project.service.ts
```
Expected: no output (zero matches) in all of these files/lines except none remain — `grep` exits with status 1 (no matches found) for each file, or prints nothing overall.

- [ ] **Step 12: Commit**

```bash
cd /Users/tjc/FUXA-master
git add client/src/index.html client/src/app/app.component.ts client/src/app/home/userinfo.dialog.html client/src/app/header/info.dialog.html client/src/app/maps/maps-view/maps-view.component.ts client/src/app/ar/ar-view/ar-view.component.html client/src/app/editor/app-settings/app-settings.component.ts client/src/app/reports/report-editor/report-editor.component.ts client/src/app/_models/device.ts client/src/app/_services/project.service.ts
git commit -m "feat: rebrand client-visible strings to NXTGEN"
```

---

### Task 3: Rebrand i18n locale files

**Files:**
- Modify: `client/src/assets/i18n/de.json`
- Modify: `client/src/assets/i18n/en.json`
- Modify: `client/src/assets/i18n/es.json`
- Modify: `client/src/assets/i18n/fr.json`
- Modify: `client/src/assets/i18n/ja.json`
- Modify: `client/src/assets/i18n/ko.json`
- Modify: `client/src/assets/i18n/pt.json`
- Modify: `client/src/assets/i18n/ru.json`
- Modify: `client/src/assets/i18n/sv.json`
- Modify: `client/src/assets/i18n/tr.json`
- Modify: `client/src/assets/i18n/ua.json`
- Modify: `client/src/assets/i18n/zh-cn.json`
- Modify: `client/src/assets/i18n/zh-tw.json`

**Interfaces:** none — translation values only, keys are unchanged so `TranslateService` lookups elsewhere are unaffected.

Each of these files embeds the literal substring `FUXA` inside otherwise-translated strings for the same handful of keys (`header.help`, `sidenav.title`, `tutorial.title`, `dlg.info-title`, `device.property-server`, and in `en.json` only, `ar.markers-notice-message`). A verbatim substring replace of `FUXA` → `NXTGEN` is safe here: it's a proper noun, not a word that changes with grammar in any of these languages' surrounding sentence structure.

- [ ] **Step 1: Confirm current occurrences (baseline count)**

Run:
```bash
cd /Users/tjc/FUXA-master/client/src/assets/i18n
grep -c "FUXA" de.json en.json es.json fr.json ja.json ko.json pt.json ru.json sv.json tr.json ua.json zh-cn.json zh-tw.json
```
Expected output (counts per file, matches the design's inventory):
```
de.json:5
en.json:6
es.json:5
fr.json:1
ja.json:2
ko.json:5
pt.json:5
ru.json:4
sv.json:5
tr.json:5
ua.json:5
zh-cn.json:5
zh-tw.json:5
```

- [ ] **Step 2: Replace `FUXA` with `NXTGEN` in every file**

```bash
cd /Users/tjc/FUXA-master/client/src/assets/i18n
for f in de.json en.json es.json fr.json ja.json ko.json pt.json ru.json sv.json tr.json ua.json zh-cn.json zh-tw.json; do
  sed -i '' 's/FUXA/NXTGEN/g' "$f"
done
```

- [ ] **Step 3: Verify each file is still valid JSON and has zero remaining `FUXA` occurrences**

```bash
cd /Users/tjc/FUXA-master/client/src/assets/i18n
for f in de.json en.json es.json fr.json ja.json ko.json pt.json ru.json sv.json tr.json ua.json zh-cn.json zh-tw.json; do
  node -e "JSON.parse(require('fs').readFileSync('$f','utf8')); console.log('$f OK')"
  grep -c "FUXA" "$f" || true
done
```
Expected: every file prints `<name>.json OK`, and every `grep -c` prints `0`.

- [ ] **Step 4: Commit**

```bash
cd /Users/tjc/FUXA-master
git add client/src/assets/i18n/*.json
git commit -m "feat: rebrand i18n locale strings to NXTGEN"
```

---

### Task 4: New NXTGEN logo and favicon

**Files:**
- Modify: `client/src/assets/images/logo.svg`
- Modify: `client/src/favicon.ico`

**Interfaces:** none — `logo.svg` is referenced only via CSS `background: url(assets/images/logo.svg)` in `client/src/styles.css:293` (the `.logo` class, unchanged), and `favicon.ico` only via the `<link rel="icon">` in `index.html` (unchanged path).

- [ ] **Step 1: Replace `client/src/assets/images/logo.svg`**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg width="128" height="128" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="nxtgenGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#06b6d4"/>
      <stop offset="100%" stop-color="#0e7490"/>
    </linearGradient>
  </defs>
  <rect x="2" y="2" width="60" height="60" rx="14" fill="url(#nxtgenGrad)"/>
  <path d="M20 44V20h4.8l14.4 18.2V20H44v24h-4.8L24.8 25.8V44Z" fill="#ffffff"/>
</svg>
```

- [ ] **Step 2: Render PNG and build the `.ico` from it**

```bash
cd /Users/tjc/FUXA-master
rsvg-convert -w 256 -h 256 client/src/assets/images/logo.svg -o /private/tmp/claude-501/-Users-tjc-FUXA-master/442a5996-a20a-4f46-be34-079939ba3d68/scratchpad/nxtgen-logo-256.png
python3 -c "
from PIL import Image
img = Image.open('/private/tmp/claude-501/-Users-tjc-FUXA-master/442a5996-a20a-4f46-be34-079939ba3d68/scratchpad/nxtgen-logo-256.png')
img.save('client/src/favicon.ico', sizes=[(16,16),(32,32),(48,48),(64,64)])
"
```

- [ ] **Step 3: Verify**

```bash
file client/src/favicon.ico
```
Expected: output mentions `MS Windows icon resource` with multiple image entries (e.g. `4 icons`).

- [ ] **Step 4: Commit**

```bash
cd /Users/tjc/FUXA-master
git add client/src/assets/images/logo.svg client/src/favicon.ico
git commit -m "feat: new NXTGEN logo and favicon"
```

---

### Task 5: Cyan/blue theme restyle (light + dark) and chrome polish

**Files:**
- Modify: `client/src/app/_config/theme.config.ts`
- Modify: `client/src/theme.scss:23-24,69-70,84-85,99-100,114-115`
- Modify: `client/src/styles.css` (append)

**Interfaces:** `theme.config.ts` exports `THEMES.default` and `THEMES.dark` objects consumed by `ThemeService.setTheme()` (`client/src/app/_services/theme.service.ts`) — key names must stay identical, only values change.

- [ ] **Step 1: Update `client/src/app/_config/theme.config.ts` accent values**

`toolboxItemActiveBackground: '#3059af',` and `chipSelectedBackground: '#3059AF',` appear verbatim in *both* the `default` and `dark` objects, so edits must include a neighboring line that differs between the two blocks to target the right one.

In the `default` theme object, change:
```ts
        sidenavBackground: '#f9f9f9',
        toolboxItemActiveBackground: '#3059af',
```
to:
```ts
        sidenavBackground: '#f9f9f9',
        toolboxItemActiveBackground: '#0e7490',
```
and change:
```ts
        chipsBackground: '#F1F1F1',
        chipSelectedBackground: '#3059AF',
```
to:
```ts
        chipsBackground: '#F1F1F1',
        chipSelectedBackground: '#0e7490',
```

In the `dark` theme object, change:
```ts
        sidenavBackground: '#252526',
        toolboxItemActiveBackground: '#3059af',
```
to:
```ts
        sidenavBackground: '#252526',
        toolboxItemActiveBackground: '#06b6d4',
```
and change:
```ts
        chipsBackground: '#242424',
        chipSelectedBackground: '#3059AF',
```
to:
```ts
        chipsBackground: '#242424',
        chipSelectedBackground: '#06b6d4',
```

- [ ] **Step 2: Swap Material palettes in `client/src/theme.scss` from blue/pink to cyan**

Change:
```scss
$my-header-accent: mat.m2-define-palette(mat.$m2-pink-palette);
```
to:
```scss
$my-header-accent: mat.m2-define-palette(mat.$m2-cyan-palette);
```

Change:
```scss
$my-button-primary: mat.m2-define-palette(mat.$m2-blue-palette, A200);
```
to:
```scss
$my-button-primary: mat.m2-define-palette(mat.$m2-cyan-palette, A200);
```

Change:
```scss
$my-slide-toggle-primary: mat.m2-define-palette(mat.$m2-blue-palette, 700);
```
to:
```scss
$my-slide-toggle-primary: mat.m2-define-palette(mat.$m2-cyan-palette, 700);
```

Change:
```scss
$my-slider-primary: mat.m2-define-palette(mat.$m2-blue-palette, 700);
```
to:
```scss
$my-slider-primary: mat.m2-define-palette(mat.$m2-cyan-palette, 700);
```

Change:
```scss
$dark-primary: mat.m2-define-palette(mat.$m2-blue-palette);
```
to:
```scss
$dark-primary: mat.m2-define-palette(mat.$m2-cyan-palette);
```

(`warn` palettes stay `$m2-red-palette`/`$m2-deep-orange-palette` — alarm/error semantics shouldn't shift with the rebrand. Grey-based primaries for header/checkbox/radio are left as-is; they're neutral chrome, not brand accent.)

- [ ] **Step 3: Append chrome polish to `client/src/styles.css`**

Add at the end of the file:
```css

/* NXTGEN visual polish: softer corners/elevation on dialogs and cards */
.mat-mdc-dialog-container .mdc-dialog__surface {
  border-radius: 12px !important;
}

.mat-mdc-card {
  border-radius: 10px !important;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08) !important;
}

.dark-theme .mat-mdc-card {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.35) !important;
}
```

- [ ] **Step 4: Build to verify no Sass/TypeScript errors**

```bash
cd /Users/tjc/FUXA-master/client
npm install --no-audit --no-fund
npx ng build --configuration development
```
Expected: build completes with `Application bundle generation complete` (or equivalent success message) and no new errors referencing `theme.scss`, `theme.config.ts`, or `styles.css`.

- [ ] **Step 5: Commit**

```bash
cd /Users/tjc/FUXA-master
git add client/src/app/_config/theme.config.ts client/src/theme.scss client/src/styles.css
git commit -m "feat: cyan/blue NXTGEN theme restyle for light and dark modes"
```

---

### Task 6: Manual verification pass

**Files:** none (verification only).

- [ ] **Step 1: Start the dev server**

```bash
cd /Users/tjc/FUXA-master/client
npx ng serve
```
Expected: serves on `http://localhost:4200`.

- [ ] **Step 2: Verify branding in the browser**

Open `http://localhost:4200` and confirm:
- Browser tab title reads "NXTGEN" and shows the new favicon.
- The initial loading screen (before Angular bootstraps) reads "NXTGEN Loading...".
- Login dialog appears correctly themed (rounded dialog corners visible).
- After login, the sidenav title reads "NXTGEN" (`sidenav.title` key) unless a custom project logo is configured.
- Header info dialog (ⓘ icon) shows "Powered by NXTGEN".
- User avatar/profile dialog shows "Powered by NXTGEN".

- [ ] **Step 3: Verify light/dark toggle**

Toggle the theme (dark-mode switch in settings/header). Confirm:
- Cyan accent (`#0e7490` light / `#06b6d4` dark) appears on active/selected toolbox items and chips.
- Buttons/sliders/toggles show cyan instead of the old blue.
- No layout breakage in either mode.

- [ ] **Step 4: Stop the dev server**

Press `Ctrl+C` in the terminal running `ng serve`.

- [ ] **Step 5: Final commit (if any manual-check fixups were made)**

```bash
cd /Users/tjc/FUXA-master
git status
```
If clean, no commit needed — the rebrand is complete as of Task 5's commit. If verification uncovered fixes, commit them with a message describing what was fixed.
