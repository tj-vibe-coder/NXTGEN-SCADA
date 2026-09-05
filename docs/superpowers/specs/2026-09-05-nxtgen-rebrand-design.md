# NXTGEN Rebrand & Restyle — Design

## Goal

Rebrand FUXA as **NXTGEN**: same Angular frontend and Node.js backend, same feature set, but with NXTGEN branding (name, logo, favicon, package metadata) and a refreshed cyan/blue-accented visual theme (light + dark).

## Scope

**In scope**
- User-visible "FUXA" text → "NXTGEN": page title, loading screen, sidenav title, header/info/tutorial dialogs, locale strings (`client/src/assets/i18n/*.json`), `name`/`description` in `client/package.json` and `server/package.json`.
- "Powered by frangoteam" → "Powered by NXTGEN" in the info dialog.
- New logo (`client/src/assets/images/logo.svg`) and favicon (`client/src/favicon.ico`), cyan-accented mark.
- New light + dark palette in `client/src/app/_config/theme.config.ts` (CSS custom properties, drives the existing `ThemeService` toggle) and `client/src/theme.scss` (Angular Material M2 palettes — menu, checkbox, radio, button, etc.).
- Modest visual polish (corner radius, elevation, spacing) on shared chrome: header, sidenav, login, dialogs. SCADA editor canvas/widget rendering stays neutral (it renders user projects, not app chrome).
- `NOTICE.md` noting NXTGEN is based on FUXA (MIT).

**Out of scope**
- Renaming internal identifiers: `fuxa-view` component/selector, `.fuxa-*` CSS classes, `window.fuxaScriptAPI` (public scripting API — renaming breaks existing user widget scripts). These aren't user-visible and touching them is pure churn/regression risk.
- Rewriting the frontend on a different framework, or migrating `theme.scss` to Angular Material's M3 token API (bigger lift, disproportionate to a restyle, higher regression risk across every themed component).
- Docker image name / `compose.yml` image reference (`frangoteam/fuxa`) — left as-is unless/until NXTGEN publishes its own image.
- The `LICENSE` file and its copyright notice — unchanged (MIT requires preserving it in derivative works).

## Approach

Palette swap + light polish (not a full Material 3 migration): lowest regression risk while still delivering a visibly different look, since the app already has a working CSS-custom-property theme system (`theme.config.ts` + `ThemeService`) and Material M2 palette theming (`theme.scss`) to build on.

## Verification

- `ng build` succeeds with no new errors.
- Dev server: title bar, loading screen, login, sidenav, header info dialog all show NXTGEN branding.
- Light/dark toggle applies the new cyan/blue palette correctly in both modes.
- Spot-check a couple of non-English locale files to confirm the app-name string swap didn't break JSON structure.

## License note

FUXA is MIT-licensed (frangoteam, 2019–2025). Rebranding/forking is permitted, but the `LICENSE` file's copyright notice must be preserved in the derivative work — it is not being removed or altered here.
