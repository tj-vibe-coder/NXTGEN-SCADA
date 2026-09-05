# Runtime Navigation — Design

## Goal

Add a new runtime navigation experience to NXTGEN: a persistent left sidebar with 7 sections (Home, Conveyor Overview, Alarms, Trends, Reports, Maintenance, User Management), each a brand-new SCADA-mimic-style screen. Visual mockups first — no live data wiring yet.

## Scope

**In scope**
- A new `/runtime` route tree, independent of FUXA's existing editor/admin routes (`/home`, `/alarms`, `/reports`, `/users`, etc. are untouched — this is an additive new experience, not a replacement).
- A layout component (`RuntimeShellComponent`) with:
  - A persistent left sidebar: 7 items, each with an icon + label, cyan-themed (using the NXTGEN palette from the theme restyle), the active item highlighted.
  - A content area rendering the selected screen via Angular child routes.
- 7 new leaf components, one per nav item, each with hand-authored inline SVG "mimic" graphics in the classic SCADA visual style (industrial diagram look: equipment shapes, status-colored indicators, gauges/readouts), populated with realistic **sample/static data** (no backend calls):
  1. **Home** — plant overview: a few KPI tiles (uptime %, output count, active alarm count) + a compact overall line-status diagram.
  2. **Conveyor Overview** — multi-segment conveyor belt line, 3 motors (M1/M2/M3) with running/stopped color state, photoeye sensor icons, a speed readout.
  3. **Alarms** — an alarm-banner-style panel + table with sample rows (color-coded by severity: critical/warning/info).
  4. **Trends** — a SCADA-style trend chart mockup: grid, 2-3 sample line series, legend, time axis.
  5. **Reports** — a report list mockup styled as a "report rack" (scheduled/generated rows with status icons).
  6. **Maintenance** — an equipment list with service-due indicators, plus a simple equipment diagram.
  7. **User Management** — a role-badged user list, same SCADA-panel framing as the others but visually simpler (it's inherently more list-like).
- Routing: `/runtime` (redirects to `/runtime/home`), `/runtime/home`, `/runtime/conveyor`, `/runtime/alarms`, `/runtime/trends`, `/runtime/reports`, `/runtime/maintenance`, `/runtime/users`.

**Out of scope**
- Live/backend data wiring for any of the 7 screens (explicitly deferred — sample data only for this pass).
- Touching or reusing FUXA's existing `AlarmViewComponent`, `ReportListComponent`, `UsersComponent`, etc. — these new screens are standalone, hand-built visual mockups per the approved design, not wrappers around the existing admin components.
- Changing the existing editor/admin sidenav (`sidenav.component.ts/html`) or its routes.
- Mobile-responsive layout tuning (desktop-first, matching typical SCADA control-room displays).
- Authentication/route guards for `/runtime/*` (can reuse `AuthGuard` trivially later if needed; not the focus of this pass).

## Architecture

New standalone-feature approach: a `runtime/` folder under `client/src/app/` containing the shell + 7 screen components + routes, registered as children of a new `/runtime` path in `app.routing.ts`. Each screen is its own component file (SCADA-mimic screens tend to accumulate a lot of SVG markup — keeping them as separate small components keeps each file focused and easy to iterate on independently). Shared visual primitives (e.g. a status-color function, a KPI-tile look) live in one small shared SCSS/TS helper rather than being duplicated per screen, but each screen's actual diagram markup stays local to that screen's component — no premature shared "diagram framework."

Sidebar uses the same CSS-custom-property theme mechanism as the rest of the app (`--toolboxItemActiveBackground` etc. from `theme.config.ts`) so it automatically follows the existing light/dark toggle and stays visually consistent with the rest of NXTGEN.

## Verification

- `ng build` succeeds.
- Dev server: navigating to `/runtime` shows the sidebar defaulting to Home; clicking each of the 7 items swaps the content area and highlights the active item; all 7 screens render their mimic graphics and sample data without console errors.
- Visual check in both light and dark theme.
