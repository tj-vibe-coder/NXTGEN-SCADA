# Runtime Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new `/runtime` experience to NXTGEN: a persistent left sidebar with 7 sections (Home, Conveyor Overview, Alarms, Trends, Reports, Maintenance, User Management), each a brand-new SCADA-mimic-style screen with sample data.

**Architecture:** New NgModule-pattern components under `client/src/app/runtime/`, declared in the existing monolithic `app.module.ts` (this codebase uses one `@NgModule` for the whole app, not standalone components — follow that pattern). A `RuntimeShellComponent` renders the sidebar + `<router-outlet>`; 7 leaf components render one screen each via Angular child routes under `/runtime`. Existing editor/admin routes and components (`/home`, `/alarms`, `/reports`, `/users`, etc.) are untouched.

**Tech Stack:** Angular 18 (NgModule-based), Angular Material (`MaterialModule`, already imported app-wide), inline SVG for mimic graphics, plain CSS using the app's existing theme CSS custom properties (`--workPanelBackground`, `--formInputBackground`, `--formBorder`, `--toolboxItemActiveBackground`, `--sidenavBackground`, `--toolboxColor`) so screens automatically follow the existing light/dark toggle.

## Global Constraints

- Brand name in any visible text: NXTGEN.
- Do NOT modify or reuse FUXA's existing `AlarmViewComponent`, `ReportListComponent`, `UsersComponent`, or the existing `sidenav.component.ts/html` — these new screens are standalone, hand-built mockups, not wrappers around existing admin components.
- Do NOT change any existing route in `app.routing.ts` (`/home`, `/alarms`, `/reports`, `/users`, etc.) — only add new ones.
- No backend/HTTP calls from any of the 7 screens — sample data only, defined as component fields.
- Reuse existing theme CSS custom properties for all container/background/border colors so screens follow the light/dark toggle automatically; status/severity colors (running/stopped/warning/critical) are semantically fixed and defined once in a shared util, independent of light/dark theme.
- Follow the existing NgModule pattern: new components go in `app.module.ts`'s `declarations` array, not as `standalone: true` components.

---

### Task 1: Shared runtime utilities, shell, routing, and Home screen

**Files:**
- Create: `client/src/app/runtime/runtime-nav.model.ts`
- Create: `client/src/app/runtime/runtime-status.util.ts`
- Create: `client/src/app/runtime/runtime-shared.scss`
- Create: `client/src/app/runtime/runtime-shell/runtime-shell.component.ts`
- Create: `client/src/app/runtime/runtime-shell/runtime-shell.component.html`
- Create: `client/src/app/runtime/runtime-shell/runtime-shell.component.scss`
- Create: `client/src/app/runtime/home/runtime-home.component.ts`
- Create: `client/src/app/runtime/home/runtime-home.component.html`
- Create: `client/src/app/runtime/home/runtime-home.component.scss`
- Modify: `client/src/app/app.routing.ts`
- Modify: `client/src/app/app.module.ts`
- Modify: `client/src/app/app.component.ts`

**Important — existing app shell integration:** The top-level `AppComponent` conditionally shows its own `<app-header>` and a floating fab-menu button around every route's `<router-outlet>` (see `app.component.html`). `isHidden()`, `getClass()`, and `showDevNavigation()` in `app.component.ts` already special-case `/view` and `/ar` routes to hide that chrome and give the outlet the full container (`work-void` CSS class, `height: 100%; width: 100%;` — see `app.component.scss:8-11`). `/runtime` must get the same treatment, or the new sidebar shell would render stacked underneath the existing app header and fab button instead of owning the full screen. This task's Step 11a (below) makes that change.

**Interfaces:**
- Produces: `RuntimeNavItem { label: string; icon: string; path: string }` and `RUNTIME_NAV_ITEMS: RuntimeNavItem[]` (from `runtime-nav.model.ts`) — consumed by `RuntimeShellComponent` and by every later task's nav-highlight expectations.
- Produces: `RuntimeStatus = 'running' | 'stopped' | 'warning' | 'critical' | 'idle'` and `STATUS_COLORS: Record<RuntimeStatus, string>` (from `runtime-status.util.ts`) — consumed by Tasks 2, 3 (and optionally others) for status-dot/mimic coloring.
- Produces: shared CSS classes in `runtime-shared.scss` (`.runtime-screen`, `.runtime-panel`, `.runtime-panel-title`, `.kpi-row`, `.kpi-tile`, `.kpi-value`, `.kpi-label`, `.status-dot`) — every later task's component imports this file as a second entry in `styleUrls`.

- [ ] **Step 1: Create `client/src/app/runtime/runtime-nav.model.ts`**

```ts
export interface RuntimeNavItem {
    label: string;
    icon: string;
    path: string;
}

export const RUNTIME_NAV_ITEMS: RuntimeNavItem[] = [
    { label: 'Home', icon: 'home', path: 'home' },
    { label: 'Conveyor Overview', icon: 'precision_manufacturing', path: 'conveyor' },
    { label: 'Alarms', icon: 'warning', path: 'alarms' },
    { label: 'Trends', icon: 'show_chart', path: 'trends' },
    { label: 'Reports', icon: 'description', path: 'reports' },
    { label: 'Maintenance', icon: 'build', path: 'maintenance' },
    { label: 'User Management', icon: 'group', path: 'users' },
];
```

- [ ] **Step 2: Create `client/src/app/runtime/runtime-status.util.ts`**

```ts
export type RuntimeStatus = 'running' | 'stopped' | 'warning' | 'critical' | 'idle';

export const STATUS_COLORS: Record<RuntimeStatus, string> = {
    running: '#22c55e',
    stopped: '#6b7280',
    warning: '#f59e0b',
    critical: '#ef4444',
    idle: '#94a3b8',
};
```

- [ ] **Step 3: Create `client/src/app/runtime/runtime-shared.scss`**

```scss
.runtime-screen {
    padding: 24px;
    height: 100%;
    box-sizing: border-box;
    overflow-y: auto;
    background: var(--workPanelBackground);
    color: inherit;
}

.runtime-panel {
    background: var(--formExtBackground);
    border: 1px solid var(--formBorder);
    border-radius: 10px;
    padding: 16px 20px;
    margin-bottom: 20px;
}

.runtime-panel-title {
    font-size: 15px;
    font-weight: 600;
    margin: 0 0 12px 0;
    letter-spacing: 0.2px;
}

.kpi-row {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
}

.kpi-tile {
    flex: 1 1 160px;
    background: var(--formInputBackground);
    border-radius: 8px;
    padding: 14px 16px;
}

.kpi-value {
    font-size: 28px;
    font-weight: 700;
    color: var(--toolboxItemActiveBackground);
}

.kpi-label {
    font-size: 12px;
    opacity: 0.7;
    margin-top: 4px;
}

.status-dot {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 6px;
    vertical-align: middle;
}
```

- [ ] **Step 4: Create `client/src/app/runtime/runtime-shell/runtime-shell.component.ts`**

```ts
import { Component } from '@angular/core';
import { RUNTIME_NAV_ITEMS, RuntimeNavItem } from '../runtime-nav.model';

@Component({
    selector: 'runtime-shell',
    templateUrl: './runtime-shell.component.html',
    styleUrls: ['./runtime-shell.component.scss']
})
export class RuntimeShellComponent {
    navItems: RuntimeNavItem[] = RUNTIME_NAV_ITEMS;
}
```

- [ ] **Step 5: Create `client/src/app/runtime/runtime-shell/runtime-shell.component.html`**

```html
<div class="runtime-shell">
    <nav class="runtime-sidebar">
        <div class="runtime-sidebar-title">NXTGEN</div>
        <a *ngFor="let item of navItems"
           class="runtime-nav-item"
           [routerLink]="[item.path]"
           routerLinkActive="active">
            <mat-icon>{{item.icon}}</mat-icon>
            <span>{{item.label}}</span>
        </a>
    </nav>
    <main class="runtime-content">
        <router-outlet></router-outlet>
    </main>
</div>
```

- [ ] **Step 6: Create `client/src/app/runtime/runtime-shell/runtime-shell.component.scss`**

```scss
.runtime-shell {
    display: flex;
    height: 100%;
    width: 100%;
    overflow: hidden;
}

.runtime-sidebar {
    width: 220px;
    flex: 0 0 220px;
    background: var(--sidenavBackground);
    border-right: 1px solid var(--formBorder);
    display: flex;
    flex-direction: column;
    padding: 12px 0;
    box-sizing: border-box;
    overflow-y: auto;
}

.runtime-sidebar-title {
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 1px;
    padding: 8px 20px 20px 20px;
    color: var(--toolboxItemActiveBackground);
}

.runtime-nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    color: var(--toolboxColor);
    text-decoration: none;
    font-size: 13px;
    cursor: pointer;
    border-left: 3px solid transparent;
    box-sizing: border-box;
}

.runtime-nav-item:hover {
    background: var(--formInputBackground);
}

.runtime-nav-item.active {
    background: var(--formInputBackground);
    border-left-color: var(--toolboxItemActiveBackground);
    color: var(--toolboxItemActiveBackground);
    font-weight: 600;
}

.runtime-content {
    flex: 1 1 auto;
    overflow: auto;
    background: var(--workPanelBackground);
}
```

- [ ] **Step 7: Create `client/src/app/runtime/home/runtime-home.component.ts`**

```ts
import { Component } from '@angular/core';
import { STATUS_COLORS, RuntimeStatus } from '../runtime-status.util';

@Component({
    selector: 'runtime-home',
    templateUrl: './runtime-home.component.html',
    styleUrls: ['./runtime-home.component.scss', '../runtime-shared.scss']
})
export class RuntimeHomeComponent {
    statusColors = STATUS_COLORS;

    kpis = [
        { label: 'Line Uptime', value: '97.4%' },
        { label: 'Units Produced Today', value: '4,812' },
        { label: 'Active Alarms', value: '2' },
        { label: 'Avg Cycle Time', value: '3.2s' },
    ];

    stages: { name: string; status: RuntimeStatus }[] = [
        { name: 'Infeed', status: 'running' },
        { name: 'Conveyor Line', status: 'running' },
        { name: 'Packaging', status: 'warning' },
    ];
}
```

- [ ] **Step 8: Create `client/src/app/runtime/home/runtime-home.component.html`**

```html
<div class="runtime-screen">
    <div class="runtime-panel">
        <h2 class="runtime-panel-title">Plant Overview</h2>
        <div class="kpi-row">
            <div class="kpi-tile" *ngFor="let kpi of kpis">
                <div class="kpi-value">{{kpi.value}}</div>
                <div class="kpi-label">{{kpi.label}}</div>
            </div>
        </div>
    </div>

    <div class="runtime-panel">
        <h2 class="runtime-panel-title">Production Line Status</h2>
        <svg viewBox="0 0 780 160" class="line-status-svg">
            <defs>
                <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
                    <path d="M0,0 L8,3 L0,6 Z" fill="var(--toolboxItemActiveBackground)"></path>
                </marker>
            </defs>
            <ng-container *ngFor="let stage of stages; let i = index">
                <rect [attr.x]="40 + i * 260" y="50" width="180" height="60" rx="8"
                      [attr.fill]="statusColors[stage.status]" fill-opacity="0.15"
                      [attr.stroke]="statusColors[stage.status]" stroke-width="2"></rect>
                <text [attr.x]="130 + i * 260" y="85" text-anchor="middle" class="stage-label">{{stage.name}}</text>
                <circle [attr.cx]="60 + i * 260" cy="50" r="6" [attr.fill]="statusColors[stage.status]"></circle>
                <line *ngIf="i < stages.length - 1"
                      [attr.x1]="220 + i * 260" y1="80"
                      [attr.x2]="300 + i * 260" y2="80"
                      stroke="var(--toolboxItemActiveBackground)" stroke-width="3" marker-end="url(#arrow)"></line>
            </ng-container>
        </svg>
    </div>
</div>
```

- [ ] **Step 9: Create `client/src/app/runtime/home/runtime-home.component.scss`**

```scss
.line-status-svg {
    width: 100%;
    max-width: 800px;
    height: auto;
}

.stage-label {
    font-size: 13px;
    font-weight: 600;
    fill: currentColor;
}
```

- [ ] **Step 10: Wire the `/runtime` route tree into `client/src/app/app.routing.ts`**

Add these imports after the existing `ArViewComponent` import (line 25):
```ts
import { RuntimeShellComponent } from './runtime/runtime-shell/runtime-shell.component';
import { RuntimeHomeComponent } from './runtime/home/runtime-home.component';
```

Add this route object into the `appRoutes` array, immediately before the `// otherwise redirect to home` / `{ path: '**', redirectTo: '' }` lines:
```ts
    {
        path: 'runtime',
        component: RuntimeShellComponent,
        children: [
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: RuntimeHomeComponent },
        ]
    },

```
(Later tasks add one child route each to this `children` array — do not add the other 6 screens' routes yet in this task.)

- [ ] **Step 11: Declare the two new components in `client/src/app/app.module.ts`**

Add these imports near the top of the file, alongside the other component imports (exact location doesn't matter as long as they're with the other `import { ... } from './...'` component imports):
```ts
import { RuntimeShellComponent } from './runtime/runtime-shell/runtime-shell.component';
import { RuntimeHomeComponent } from './runtime/home/runtime-home.component';
```

Add both class names to the `declarations` array, immediately before its closing `],` (the same array that currently ends with `ArViewComponent`):
```ts
        ArViewComponent,
        RuntimeShellComponent,
        RuntimeHomeComponent
    ],
```

- [ ] **Step 11a: Make `/runtime` hide the existing app header/fab and get the full-screen `work-void` layout in `client/src/app/app.component.ts`**

Current `isHidden()` (around line 151):
```ts
	isHidden() {
		const urlEnd = this.location.path();
		if (!urlEnd || urlEnd.startsWith('/home') || urlEnd === '/lab' || this.isArViewRoute(urlEnd)) {
			return true;
		}
		return false;
	}
```
Change to:
```ts
	isHidden() {
		const urlEnd = this.location.path();
		if (!urlEnd || urlEnd.startsWith('/home') || urlEnd === '/lab' || urlEnd.startsWith('/runtime') || this.isArViewRoute(urlEnd)) {
			return true;
		}
		return false;
	}
```

Current `getClass()` (around line 159):
```ts
	getClass() {
		const route = this.location.path();
		if (route.startsWith('/view')) {
            return 'work-void';
        }
		if (this.isArViewRoute(route)) {
            return 'work-void';
        }
		return (this.isHidden()) ? 'work-home' : 'work-editor';
	}
```
Change to:
```ts
	getClass() {
		const route = this.location.path();
		if (route.startsWith('/view')) {
            return 'work-void';
        }
		if (route.startsWith('/runtime')) {
            return 'work-void';
        }
		if (this.isArViewRoute(route)) {
            return 'work-void';
        }
		return (this.isHidden()) ? 'work-home' : 'work-editor';
	}
```

Current `showDevNavigation()` (around line 170):
```ts
    showDevNavigation() {
        const route = this.location.path();
        if (route.startsWith('/view') || this.isArViewRoute(route)) {
            return false;
        }
        return this.showdev;
    }
```
Change to:
```ts
    showDevNavigation() {
        const route = this.location.path();
        if (route.startsWith('/view') || route.startsWith('/runtime') || this.isArViewRoute(route)) {
            return false;
        }
        return this.showdev;
    }
```

- [ ] **Step 12: Build to verify no compile errors**

```bash
cd /Users/tjc/FUXA-master/client
npx ng build --configuration production
```
Expected: `Application bundle generation complete` / `Browser application bundle generation complete` with no new TypeScript/template errors.

- [ ] **Step 13: Manual smoke check**

Run `npx ng serve` from `client/`, open `http://localhost:4200/runtime`, and confirm:
- It redirects to `/runtime/home` and shows the sidebar with all 7 items (only "Home" is clickable/functional at this point — that's expected, the other 6 routes don't exist until later tasks).
- "Home" is highlighted as active.
- The KPI tiles and the 3-stage line-status diagram render with no console errors.
- The existing app header bar and floating fab-menu button are NOT visible on this route (confirms Step 11a's `work-void`/`isHidden` change took effect) — the sidebar should own the full screen.
Stop the dev server after checking (`Ctrl+C`).

- [ ] **Step 14: Commit**

```bash
cd /Users/tjc/FUXA-master
git add client/src/app/runtime client/src/app/app.routing.ts client/src/app/app.module.ts client/src/app/app.component.ts
git commit -m "feat: add runtime navigation shell and Home screen"
```

---

### Task 2: Conveyor Overview screen

**Files:**
- Create: `client/src/app/runtime/conveyor/runtime-conveyor.component.ts`
- Create: `client/src/app/runtime/conveyor/runtime-conveyor.component.html`
- Create: `client/src/app/runtime/conveyor/runtime-conveyor.component.scss`
- Modify: `client/src/app/app.routing.ts`
- Modify: `client/src/app/app.module.ts`

**Interfaces:**
- Consumes: `STATUS_COLORS`, `RuntimeStatus` from `../runtime-status.util` (Task 1); `.runtime-screen`, `.runtime-panel`, `.runtime-panel-title`, `.status-dot` from `../runtime-shared.scss` (Task 1).

- [ ] **Step 1: Create `client/src/app/runtime/conveyor/runtime-conveyor.component.ts`**

```ts
import { Component } from '@angular/core';
import { STATUS_COLORS, RuntimeStatus } from '../runtime-status.util';

@Component({
    selector: 'runtime-conveyor',
    templateUrl: './runtime-conveyor.component.html',
    styleUrls: ['./runtime-conveyor.component.scss', '../runtime-shared.scss']
})
export class RuntimeConveyorComponent {
    statusColors = STATUS_COLORS;

    segments = Array.from({ length: 16 }, (_, i) => i + 1);

    motors: { id: string; x: number; status: RuntimeStatus; speed: string }[] = [
        { id: 'M1', x: 120, status: 'running', speed: '1.2 m/s' },
        { id: 'M2', x: 400, status: 'running', speed: '1.2 m/s' },
        { id: 'M3', x: 680, status: 'stopped', speed: '0.0 m/s' },
    ];

    sensors: { label: string; x: number; active: boolean }[] = [
        { label: 'PE-1', x: 220, active: true },
        { label: 'PE-2', x: 500, active: true },
        { label: 'PE-3', x: 760, active: false },
    ];

    beltSpeed = '1.2 m/s';
}
```

- [ ] **Step 2: Create `client/src/app/runtime/conveyor/runtime-conveyor.component.html`**

```html
<div class="runtime-screen">
    <div class="runtime-panel">
        <h2 class="runtime-panel-title">Conveyor Overview</h2>

        <div class="conveyor-toolbar">
            <div class="speed-readout">
                <span class="speed-value">{{beltSpeed}}</span>
                <span class="speed-label">Belt Speed</span>
            </div>
            <div class="legend">
                <span><span class="status-dot" [style.background]="statusColors['running']"></span>Running</span>
                <span><span class="status-dot" [style.background]="statusColors['stopped']"></span>Stopped</span>
                <span><span class="status-dot" [style.background]="statusColors['critical']"></span>Sensor Fault</span>
            </div>
        </div>

        <svg viewBox="0 0 840 260" class="conveyor-svg">
            <rect x="60" y="120" width="720" height="40" rx="6" fill="var(--formInputBackground)" stroke="var(--formBorder)" stroke-width="2"></rect>
            <line *ngFor="let n of segments"
                  [attr.x1]="70 + n * 44" y1="120" [attr.x2]="70 + n * 44 - 14" y2="160"
                  stroke="var(--formBorder)" stroke-width="2"></line>

            <circle cx="60" cy="140" r="20" fill="none" stroke="var(--toolboxColor)" stroke-width="3"></circle>
            <circle cx="780" cy="140" r="20" fill="none" stroke="var(--toolboxColor)" stroke-width="3"></circle>

            <ng-container *ngFor="let motor of motors">
                <line [attr.x1]="motor.x" y1="160" [attr.x2]="motor.x" y2="200" stroke="var(--toolboxColor)" stroke-width="3"></line>
                <circle [attr.cx]="motor.x" cy="220" r="22" [attr.fill]="statusColors[motor.status]" fill-opacity="0.2" [attr.stroke]="statusColors[motor.status]" stroke-width="3"></circle>
                <text [attr.x]="motor.x" y="226" text-anchor="middle" class="motor-label">{{motor.id}}</text>
            </ng-container>

            <ng-container *ngFor="let sensor of sensors">
                <line [attr.x1]="sensor.x" y1="90" [attr.x2]="sensor.x" y2="120" stroke="var(--formBorder)" stroke-width="2"></line>
                <path [attr.d]="'M ' + (sensor.x - 8) + ' 78 L ' + (sensor.x + 8) + ' 78 L ' + sensor.x + ' 92 Z'"
                      [attr.fill]="sensor.active ? statusColors['running'] : statusColors['critical']"></path>
                <text [attr.x]="sensor.x" y="70" text-anchor="middle" class="sensor-label">{{sensor.label}}</text>
            </ng-container>
        </svg>

        <div class="motor-status-row">
            <div class="motor-status-card" *ngFor="let motor of motors">
                <span class="status-dot" [style.background]="statusColors[motor.status]"></span>
                <strong>{{motor.id}}</strong>
                <span class="motor-speed">{{motor.speed}}</span>
            </div>
        </div>
    </div>
</div>
```

- [ ] **Step 3: Create `client/src/app/runtime/conveyor/runtime-conveyor.component.scss`**

```scss
.conveyor-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    flex-wrap: wrap;
    gap: 12px;
}

.speed-readout {
    display: flex;
    flex-direction: column;
}

.speed-value {
    font-size: 26px;
    font-weight: 700;
    color: var(--toolboxItemActiveBackground);
}

.speed-label {
    font-size: 12px;
    opacity: 0.7;
}

.legend {
    display: flex;
    gap: 16px;
    font-size: 12px;
}

.conveyor-svg {
    width: 100%;
    max-width: 860px;
    height: auto;
}

.motor-label, .sensor-label {
    font-size: 12px;
    font-weight: 600;
    fill: currentColor;
}

.motor-status-row {
    display: flex;
    gap: 16px;
    margin-top: 16px;
    flex-wrap: wrap;
}

.motor-status-card {
    display: flex;
    align-items: center;
    gap: 8px;
    background: var(--formInputBackground);
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 13px;
}

.motor-speed {
    margin-left: auto;
    opacity: 0.7;
}
```

- [ ] **Step 4: Add the route in `client/src/app/app.routing.ts`**

Add the import alongside the Task 1 runtime imports:
```ts
import { RuntimeConveyorComponent } from './runtime/conveyor/runtime-conveyor.component';
```
Add a child route into the existing `runtime` route's `children` array (from Task 1), after the `home` entry:
```ts
            { path: 'home', component: RuntimeHomeComponent },
            { path: 'conveyor', component: RuntimeConveyorComponent },
```

- [ ] **Step 5: Declare the component in `client/src/app/app.module.ts`**

Add the import next to the Task 1 runtime imports:
```ts
import { RuntimeConveyorComponent } from './runtime/conveyor/runtime-conveyor.component';
```
Add to the `declarations` array, after `RuntimeHomeComponent`:
```ts
        RuntimeHomeComponent,
        RuntimeConveyorComponent
    ],
```

- [ ] **Step 6: Build to verify**

```bash
cd /Users/tjc/FUXA-master/client
npx ng build --configuration production
```
Expected: success, no new errors.

- [ ] **Step 7: Manual smoke check**

`npx ng serve`, navigate to `http://localhost:4200/runtime/conveyor`, confirm the belt, 3 motors (M1/M2 green outline, M3 grey outline), 3 sensor markers (PE-3 red, others green), and the motor status cards render with no console errors. Stop the dev server after.

- [ ] **Step 8: Commit**

```bash
cd /Users/tjc/FUXA-master
git add client/src/app/runtime/conveyor client/src/app/app.routing.ts client/src/app/app.module.ts
git commit -m "feat: add Conveyor Overview runtime screen"
```

---

### Task 3: Alarms screen

**Files:**
- Create: `client/src/app/runtime/alarms/runtime-alarms.component.ts`
- Create: `client/src/app/runtime/alarms/runtime-alarms.component.html`
- Create: `client/src/app/runtime/alarms/runtime-alarms.component.scss`
- Modify: `client/src/app/app.routing.ts`
- Modify: `client/src/app/app.module.ts`

**Interfaces:**
- Consumes: `STATUS_COLORS` from `../runtime-status.util` (Task 1); `.runtime-screen`, `.runtime-panel`, `.runtime-panel-title`, `.status-dot` from `../runtime-shared.scss` (Task 1).

- [ ] **Step 1: Create `client/src/app/runtime/alarms/runtime-alarms.component.ts`**

```ts
import { Component } from '@angular/core';
import { STATUS_COLORS } from '../runtime-status.util';

interface RuntimeAlarm {
    time: string;
    tag: string;
    description: string;
    severity: 'critical' | 'warning' | 'info';
    acked: boolean;
}

@Component({
    selector: 'runtime-alarms',
    templateUrl: './runtime-alarms.component.html',
    styleUrls: ['./runtime-alarms.component.scss', '../runtime-shared.scss']
})
export class RuntimeAlarmsComponent {
    statusColors = STATUS_COLORS;

    alarms: RuntimeAlarm[] = [
        { time: '09:42:11', tag: 'CNV-M3-FAULT', description: 'Conveyor Motor M3 overload trip', severity: 'critical', acked: false },
        { time: '09:38:55', tag: 'PE-3-LOSS', description: 'Photoeye PE-3 signal loss', severity: 'warning', acked: false },
        { time: '08:15:02', tag: 'TEMP-HIGH', description: 'Packaging zone temperature high', severity: 'warning', acked: true },
        { time: '07:50:30', tag: 'SHIFT-START', description: 'Shift change - Line reset', severity: 'info', acked: true },
    ];

    severityColor(severity: RuntimeAlarm['severity']): string {
        if (severity === 'critical') { return this.statusColors.critical; }
        if (severity === 'warning') { return this.statusColors.warning; }
        return this.statusColors.idle;
    }

    get activeCount(): number {
        return this.alarms.filter(a => !a.acked).length;
    }
}
```

- [ ] **Step 2: Create `client/src/app/runtime/alarms/runtime-alarms.component.html`**

```html
<div class="runtime-screen">
    <div class="runtime-panel alarm-banner" [class.has-active]="activeCount > 0">
        <mat-icon>warning</mat-icon>
        <span>{{activeCount}} unacknowledged alarm(s)</span>
    </div>

    <div class="runtime-panel">
        <h2 class="runtime-panel-title">Alarm Log</h2>
        <table class="runtime-table">
            <thead>
                <tr>
                    <th>Time</th>
                    <th>Tag</th>
                    <th>Description</th>
                    <th>Severity</th>
                    <th>Ack</th>
                </tr>
            </thead>
            <tbody>
                <tr *ngFor="let alarm of alarms">
                    <td>{{alarm.time}}</td>
                    <td>{{alarm.tag}}</td>
                    <td>{{alarm.description}}</td>
                    <td>
                        <span class="status-dot" [style.background]="severityColor(alarm.severity)"></span>{{alarm.severity}}
                    </td>
                    <td>
                        <mat-icon *ngIf="alarm.acked">check_circle</mat-icon>
                        <mat-icon *ngIf="!alarm.acked">radio_button_unchecked</mat-icon>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
```

- [ ] **Step 3: Create `client/src/app/runtime/alarms/runtime-alarms.component.scss`**

```scss
.alarm-banner {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    opacity: 0.6;
}

.alarm-banner.has-active {
    opacity: 1;
    border-color: var(--toolboxItemActiveBackground);
}

.runtime-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
}

.runtime-table th {
    text-align: left;
    padding: 8px 10px;
    border-bottom: 1px solid var(--formBorder);
    opacity: 0.7;
    font-weight: 600;
}

.runtime-table td {
    padding: 8px 10px;
    border-bottom: 1px solid var(--formBorder);
}
```

- [ ] **Step 4: Add the route in `client/src/app/app.routing.ts`**

Import:
```ts
import { RuntimeAlarmsComponent } from './runtime/alarms/runtime-alarms.component';
```
Child route, after `conveyor`:
```ts
            { path: 'conveyor', component: RuntimeConveyorComponent },
            { path: 'alarms', component: RuntimeAlarmsComponent },
```

- [ ] **Step 5: Declare in `client/src/app/app.module.ts`**

Import:
```ts
import { RuntimeAlarmsComponent } from './runtime/alarms/runtime-alarms.component';
```
Declarations, after `RuntimeConveyorComponent`:
```ts
        RuntimeConveyorComponent,
        RuntimeAlarmsComponent
    ],
```

- [ ] **Step 6: Build to verify**

```bash
cd /Users/tjc/FUXA-master/client
npx ng build --configuration production
```
Expected: success, no new errors.

- [ ] **Step 7: Manual smoke check**

`npx ng serve`, navigate to `http://localhost:4200/runtime/alarms`, confirm the banner shows "2 unacknowledged alarm(s)", the table shows 4 rows with correctly colored severity dots (critical=red, warning=amber, info=grey) and correct ack icons. Stop the dev server after.

- [ ] **Step 8: Commit**

```bash
cd /Users/tjc/FUXA-master
git add client/src/app/runtime/alarms client/src/app/app.routing.ts client/src/app/app.module.ts
git commit -m "feat: add Alarms runtime screen"
```

---

### Task 4: Trends screen

**Files:**
- Create: `client/src/app/runtime/trends/runtime-trends.component.ts`
- Create: `client/src/app/runtime/trends/runtime-trends.component.html`
- Create: `client/src/app/runtime/trends/runtime-trends.component.scss`
- Modify: `client/src/app/app.routing.ts`
- Modify: `client/src/app/app.module.ts`

**Interfaces:**
- Consumes: `.runtime-screen`, `.runtime-panel`, `.runtime-panel-title` from `../runtime-shared.scss` (Task 1). Does not use `runtime-status.util` (no status coloring in this screen).

- [ ] **Step 1: Create `client/src/app/runtime/trends/runtime-trends.component.ts`**

```ts
import { Component } from '@angular/core';

@Component({
    selector: 'runtime-trends',
    templateUrl: './runtime-trends.component.html',
    styleUrls: ['./runtime-trends.component.scss', '../runtime-shared.scss']
})
export class RuntimeTrendsComponent {
    timeLabels = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00'];

    series = [
        { name: 'Belt Speed (m/s)', color: '#06b6d4', points: [1.1, 1.2, 1.2, 1.15, 1.2, 0.4, 1.2] },
        { name: 'Motor Temp (°C)', color: '#f59e0b', points: [42, 44, 46, 48, 47, 50, 49] },
    ];

    gridLines = [0, 1, 2, 3, 4, 5];

    pointsToPath(points: number[], min: number, max: number): string {
        const w = 720;
        const h = 200;
        const step = w / (points.length - 1);
        return points
            .map((p, i) => {
                const x = i * step;
                const y = h - ((p - min) / (max - min)) * h;
                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
            })
            .join(' ');
    }

    get maxima(): number[] {
        return this.series.map(s => Math.max(...s.points) * 1.1);
    }

    get minima(): number[] {
        return this.series.map(s => Math.min(...s.points) * 0.9);
    }
}
```

- [ ] **Step 2: Create `client/src/app/runtime/trends/runtime-trends.component.html`**

```html
<div class="runtime-screen">
    <div class="runtime-panel">
        <h2 class="runtime-panel-title">Trends</h2>
        <div class="trend-legend">
            <span *ngFor="let s of series" class="legend-item">
                <span class="legend-swatch" [style.background]="s.color"></span>{{s.name}}
            </span>
        </div>
        <svg viewBox="0 0 760 240" class="trend-svg">
            <g transform="translate(20,20)">
                <line *ngFor="let g of gridLines"
                      x1="0" [attr.y1]="g * 40" x2="720" [attr.y2]="g * 40"
                      stroke="var(--formBorder)" stroke-width="1"></line>
                <path *ngFor="let s of series; let i = index"
                      [attr.d]="pointsToPath(s.points, minima[i], maxima[i])"
                      fill="none" [attr.stroke]="s.color" stroke-width="2.5"></path>
            </g>
            <g transform="translate(20,225)">
                <text *ngFor="let t of timeLabels; let i = index"
                      [attr.x]="i * 120" y="0" class="axis-label" text-anchor="middle">{{t}}</text>
            </g>
        </svg>
    </div>
</div>
```

- [ ] **Step 3: Create `client/src/app/runtime/trends/runtime-trends.component.scss`**

```scss
.trend-legend {
    display: flex;
    gap: 20px;
    margin-bottom: 12px;
    font-size: 12px;
}

.legend-swatch {
    display: inline-block;
    width: 14px;
    height: 3px;
    margin-right: 6px;
    vertical-align: middle;
}

.trend-svg {
    width: 100%;
    max-width: 780px;
    height: auto;
}

.axis-label {
    font-size: 11px;
    opacity: 0.6;
    fill: currentColor;
}
```

- [ ] **Step 4: Add the route in `client/src/app/app.routing.ts`**

Import:
```ts
import { RuntimeTrendsComponent } from './runtime/trends/runtime-trends.component';
```
Child route, after `alarms`:
```ts
            { path: 'alarms', component: RuntimeAlarmsComponent },
            { path: 'trends', component: RuntimeTrendsComponent },
```

- [ ] **Step 5: Declare in `client/src/app/app.module.ts`**

Import:
```ts
import { RuntimeTrendsComponent } from './runtime/trends/runtime-trends.component';
```
Declarations, after `RuntimeAlarmsComponent`:
```ts
        RuntimeAlarmsComponent,
        RuntimeTrendsComponent
    ],
```

- [ ] **Step 6: Build to verify**

```bash
cd /Users/tjc/FUXA-master/client
npx ng build --configuration production
```
Expected: success, no new errors.

- [ ] **Step 7: Manual smoke check**

`npx ng serve`, navigate to `http://localhost:4200/runtime/trends`, confirm the legend shows both series names with correct swatch colors, and two distinct line paths render inside the grid with no console errors. Stop the dev server after.

- [ ] **Step 8: Commit**

```bash
cd /Users/tjc/FUXA-master
git add client/src/app/runtime/trends client/src/app/app.routing.ts client/src/app/app.module.ts
git commit -m "feat: add Trends runtime screen"
```

---

### Task 5: Reports screen

**Files:**
- Create: `client/src/app/runtime/reports/runtime-reports.component.ts`
- Create: `client/src/app/runtime/reports/runtime-reports.component.html`
- Create: `client/src/app/runtime/reports/runtime-reports.component.scss`
- Modify: `client/src/app/app.routing.ts`
- Modify: `client/src/app/app.module.ts`

**Interfaces:**
- Consumes: `.runtime-screen`, `.runtime-panel`, `.runtime-panel-title` from `../runtime-shared.scss` (Task 1).

- [ ] **Step 1: Create `client/src/app/runtime/reports/runtime-reports.component.ts`**

```ts
import { Component } from '@angular/core';

interface RuntimeReport {
    name: string;
    schedule: string;
    lastRun: string;
    status: 'generated' | 'pending' | 'failed';
}

@Component({
    selector: 'runtime-reports',
    templateUrl: './runtime-reports.component.html',
    styleUrls: ['./runtime-reports.component.scss', '../runtime-shared.scss']
})
export class RuntimeReportsComponent {
    reports: RuntimeReport[] = [
        { name: 'Shift Production Summary', schedule: 'Every 8 hours', lastRun: 'Today 06:00', status: 'generated' },
        { name: 'Daily Alarm Log', schedule: 'Daily at 00:00', lastRun: 'Today 00:00', status: 'generated' },
        { name: 'Weekly Maintenance Report', schedule: 'Weekly - Monday', lastRun: 'Pending', status: 'pending' },
        { name: 'Monthly OEE Report', schedule: 'Monthly - 1st', lastRun: 'Last month', status: 'failed' },
    ];

    statusIcon(status: RuntimeReport['status']): string {
        if (status === 'generated') { return 'check_circle'; }
        if (status === 'pending') { return 'schedule'; }
        return 'error';
    }
}
```

- [ ] **Step 2: Create `client/src/app/runtime/reports/runtime-reports.component.html`**

```html
<div class="runtime-screen">
    <div class="runtime-panel">
        <h2 class="runtime-panel-title">Reports</h2>
        <div class="report-rack">
            <div class="report-row" *ngFor="let report of reports" [class]="'status-' + report.status">
                <mat-icon class="report-icon">description</mat-icon>
                <div class="report-info">
                    <div class="report-name">{{report.name}}</div>
                    <div class="report-meta">{{report.schedule}} &middot; Last run: {{report.lastRun}}</div>
                </div>
                <mat-icon class="report-status-icon">{{statusIcon(report.status)}}</mat-icon>
            </div>
        </div>
    </div>
</div>
```

- [ ] **Step 3: Create `client/src/app/runtime/reports/runtime-reports.component.scss`**

```scss
.report-rack {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.report-row {
    display: flex;
    align-items: center;
    gap: 14px;
    background: var(--formInputBackground);
    border-left: 4px solid var(--formBorder);
    border-radius: 6px;
    padding: 12px 16px;
}

.report-row.status-generated {
    border-left-color: #22c55e;
}

.report-row.status-pending {
    border-left-color: #f59e0b;
}

.report-row.status-failed {
    border-left-color: #ef4444;
}

.report-icon {
    opacity: 0.6;
}

.report-info {
    flex: 1 1 auto;
}

.report-name {
    font-weight: 600;
    font-size: 13px;
}

.report-meta {
    font-size: 11px;
    opacity: 0.6;
    margin-top: 2px;
}
```

- [ ] **Step 4: Add the route in `client/src/app/app.routing.ts`**

Import:
```ts
import { RuntimeReportsComponent } from './runtime/reports/runtime-reports.component';
```
Child route, after `trends`:
```ts
            { path: 'trends', component: RuntimeTrendsComponent },
            { path: 'reports', component: RuntimeReportsComponent },
```

- [ ] **Step 5: Declare in `client/src/app/app.module.ts`**

Import:
```ts
import { RuntimeReportsComponent } from './runtime/reports/runtime-reports.component';
```
Declarations, after `RuntimeTrendsComponent`:
```ts
        RuntimeTrendsComponent,
        RuntimeReportsComponent
    ],
```

- [ ] **Step 6: Build to verify**

```bash
cd /Users/tjc/FUXA-master/client
npx ng build --configuration production
```
Expected: success, no new errors.

- [ ] **Step 7: Manual smoke check**

`npx ng serve`, navigate to `http://localhost:4200/runtime/reports`, confirm 4 report rows render with distinct left-border colors matching status (green/amber/red) and correct status icons. Stop the dev server after.

- [ ] **Step 8: Commit**

```bash
cd /Users/tjc/FUXA-master
git add client/src/app/runtime/reports client/src/app/app.routing.ts client/src/app/app.module.ts
git commit -m "feat: add Reports runtime screen"
```

---

### Task 6: Maintenance screen

**Files:**
- Create: `client/src/app/runtime/maintenance/runtime-maintenance.component.ts`
- Create: `client/src/app/runtime/maintenance/runtime-maintenance.component.html`
- Create: `client/src/app/runtime/maintenance/runtime-maintenance.component.scss`
- Modify: `client/src/app/app.routing.ts`
- Modify: `client/src/app/app.module.ts`

**Interfaces:**
- Consumes: `.runtime-screen`, `.runtime-panel`, `.runtime-panel-title` from `../runtime-shared.scss` (Task 1).

- [ ] **Step 1: Create `client/src/app/runtime/maintenance/runtime-maintenance.component.ts`**

```ts
import { Component } from '@angular/core';

interface EquipmentItem {
    name: string;
    hoursRun: number;
    nextServiceHours: number;
    status: 'ok' | 'due-soon' | 'overdue';
}

@Component({
    selector: 'runtime-maintenance',
    templateUrl: './runtime-maintenance.component.html',
    styleUrls: ['./runtime-maintenance.component.scss', '../runtime-shared.scss']
})
export class RuntimeMaintenanceComponent {
    equipment: EquipmentItem[] = [
        { name: 'Motor M1', hoursRun: 1180, nextServiceHours: 1500, status: 'ok' },
        { name: 'Motor M2', hoursRun: 1420, nextServiceHours: 1500, status: 'due-soon' },
        { name: 'Motor M3', hoursRun: 1610, nextServiceHours: 1500, status: 'overdue' },
        { name: 'Photoeye PE-1', hoursRun: 3020, nextServiceHours: 5000, status: 'ok' },
    ];

    progressPct(item: EquipmentItem): number {
        return Math.min(100, Math.round((item.hoursRun / item.nextServiceHours) * 100));
    }
}
```

- [ ] **Step 2: Create `client/src/app/runtime/maintenance/runtime-maintenance.component.html`**

```html
<div class="runtime-screen">
    <div class="runtime-panel">
        <h2 class="runtime-panel-title">Equipment Maintenance</h2>
        <div class="equipment-list">
            <div class="equipment-row" *ngFor="let item of equipment" [class]="'status-' + item.status">
                <mat-icon class="equipment-icon">build</mat-icon>
                <div class="equipment-info">
                    <div class="equipment-name">{{item.name}}</div>
                    <div class="equipment-meta">{{item.hoursRun}}h / {{item.nextServiceHours}}h to next service</div>
                    <div class="progress-track">
                        <div class="progress-fill" [style.width.%]="progressPct(item)"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
```

- [ ] **Step 3: Create `client/src/app/runtime/maintenance/runtime-maintenance.component.scss`**

```scss
.equipment-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.equipment-row {
    display: flex;
    align-items: center;
    gap: 14px;
    background: var(--formInputBackground);
    border-radius: 8px;
    padding: 12px 16px;
}

.equipment-icon {
    opacity: 0.6;
}

.equipment-info {
    flex: 1 1 auto;
}

.equipment-name {
    font-weight: 600;
    font-size: 13px;
}

.equipment-meta {
    font-size: 11px;
    opacity: 0.6;
    margin: 2px 0 6px 0;
}

.progress-track {
    height: 6px;
    border-radius: 3px;
    background: var(--formSliderBackground);
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: #22c55e;
}

.equipment-row.status-due-soon .progress-fill {
    background: #f59e0b;
}

.equipment-row.status-overdue .progress-fill {
    background: #ef4444;
}
```

- [ ] **Step 4: Add the route in `client/src/app/app.routing.ts`**

Import:
```ts
import { RuntimeMaintenanceComponent } from './runtime/maintenance/runtime-maintenance.component';
```
Child route, after `reports`:
```ts
            { path: 'reports', component: RuntimeReportsComponent },
            { path: 'maintenance', component: RuntimeMaintenanceComponent },
```

- [ ] **Step 5: Declare in `client/src/app/app.module.ts`**

Import:
```ts
import { RuntimeMaintenanceComponent } from './runtime/maintenance/runtime-maintenance.component';
```
Declarations, after `RuntimeReportsComponent`:
```ts
        RuntimeReportsComponent,
        RuntimeMaintenanceComponent
    ],
```

- [ ] **Step 6: Build to verify**

```bash
cd /Users/tjc/FUXA-master/client
npx ng build --configuration production
```
Expected: success, no new errors.

- [ ] **Step 7: Manual smoke check**

`npx ng serve`, navigate to `http://localhost:4200/runtime/maintenance`, confirm 4 equipment rows render with progress bars colored green/amber/red matching their status (M1 green, M2 amber, M3 red, PE-1 green). Stop the dev server after.

- [ ] **Step 8: Commit**

```bash
cd /Users/tjc/FUXA-master
git add client/src/app/runtime/maintenance client/src/app/app.routing.ts client/src/app/app.module.ts
git commit -m "feat: add Maintenance runtime screen"
```

---

### Task 7: User Management screen

**Files:**
- Create: `client/src/app/runtime/users/runtime-users.component.ts`
- Create: `client/src/app/runtime/users/runtime-users.component.html`
- Create: `client/src/app/runtime/users/runtime-users.component.scss`
- Modify: `client/src/app/app.routing.ts`
- Modify: `client/src/app/app.module.ts`

**Interfaces:**
- Consumes: `.runtime-screen`, `.runtime-panel`, `.runtime-panel-title`, `.status-dot`, `.runtime-table` (the `.runtime-table` class is defined locally in Task 3's `runtime-alarms.component.scss`, not in the shared file — this task defines its own copy in its own scss file below, since `runtime-shared.scss` only carries the classes listed in Task 1's Interfaces; do not import `runtime-alarms.component.scss`).

- [ ] **Step 1: Create `client/src/app/runtime/users/runtime-users.component.ts`**

```ts
import { Component } from '@angular/core';

interface RuntimeUser {
    name: string;
    role: 'Administrator' | 'Operator' | 'Viewer';
    lastLogin: string;
    active: boolean;
}

@Component({
    selector: 'runtime-users',
    templateUrl: './runtime-users.component.html',
    styleUrls: ['./runtime-users.component.scss', '../runtime-shared.scss']
})
export class RuntimeUsersComponent {
    users: RuntimeUser[] = [
        { name: 'T. Caballero', role: 'Administrator', lastLogin: 'Today 09:12', active: true },
        { name: 'J. Reyes', role: 'Operator', lastLogin: 'Today 07:45', active: true },
        { name: 'M. Santos', role: 'Operator', lastLogin: 'Yesterday 16:30', active: false },
        { name: 'A. Cruz', role: 'Viewer', lastLogin: '3 days ago', active: false },
    ];

    roleClass(role: RuntimeUser['role']): string {
        return 'role-' + role.toLowerCase();
    }
}
```

- [ ] **Step 2: Create `client/src/app/runtime/users/runtime-users.component.html`**

```html
<div class="runtime-screen">
    <div class="runtime-panel">
        <h2 class="runtime-panel-title">User Management</h2>
        <table class="runtime-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Last Login</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                <tr *ngFor="let user of users">
                    <td>{{user.name}}</td>
                    <td><span class="role-badge" [class]="roleClass(user.role)">{{user.role}}</span></td>
                    <td>{{user.lastLogin}}</td>
                    <td>
                        <span class="status-dot" [style.background]="user.active ? '#22c55e' : '#6b7280'"></span>{{user.active ? 'Online' : 'Offline'}}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
```

- [ ] **Step 3: Create `client/src/app/runtime/users/runtime-users.component.scss`**

```scss
.runtime-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
}

.runtime-table th {
    text-align: left;
    padding: 8px 10px;
    border-bottom: 1px solid var(--formBorder);
    opacity: 0.7;
    font-weight: 600;
}

.runtime-table td {
    padding: 8px 10px;
    border-bottom: 1px solid var(--formBorder);
}

.role-badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
}

.role-badge.role-administrator {
    background: rgba(239, 68, 68, 0.15);
    color: #ef4444;
}

.role-badge.role-operator {
    background: rgba(6, 182, 212, 0.15);
    color: #0e7490;
}

.role-badge.role-viewer {
    background: rgba(107, 114, 128, 0.15);
    color: #6b7280;
}
```

- [ ] **Step 4: Add the route in `client/src/app/app.routing.ts`**

Import:
```ts
import { RuntimeUsersComponent } from './runtime/users/runtime-users.component';
```
Child route, after `maintenance`:
```ts
            { path: 'maintenance', component: RuntimeMaintenanceComponent },
            { path: 'users', component: RuntimeUsersComponent },
```

- [ ] **Step 5: Declare in `client/src/app/app.module.ts`**

Import:
```ts
import { RuntimeUsersComponent } from './runtime/users/runtime-users.component';
```
Declarations, after `RuntimeMaintenanceComponent`:
```ts
        RuntimeMaintenanceComponent,
        RuntimeUsersComponent
    ],
```

- [ ] **Step 6: Build to verify**

```bash
cd /Users/tjc/FUXA-master/client
npx ng build --configuration production
```
Expected: success, no new errors.

- [ ] **Step 7: Manual smoke check**

`npx ng serve`, navigate to `http://localhost:4200/runtime/users`, confirm 4 user rows render with correctly colored role badges (red=Administrator, cyan=Operator, grey=Viewer) and online/offline status dots. Stop the dev server after.

- [ ] **Step 8: Commit**

```bash
cd /Users/tjc/FUXA-master
git add client/src/app/runtime/users client/src/app/app.routing.ts client/src/app/app.module.ts
git commit -m "feat: add User Management runtime screen"
```

---

### Task 8: Full navigation walkthrough and theme check

**Files:** none (verification only).

- [ ] **Step 1: Production build**

```bash
cd /Users/tjc/FUXA-master/client
npx ng build --configuration production
```
Expected: success, no errors, no new warnings beyond the pre-existing ones (socket.io CommonJS, unused environment files).

- [ ] **Step 2: Full click-through in light theme**

`npx ng serve`, open `http://localhost:4200/runtime`, click through all 7 sidebar items in order (Home, Conveyor Overview, Alarms, Trends, Reports, Maintenance, User Management). For each: confirm the sidebar highlights the clicked item, the content area swaps, and there are no console errors.

- [ ] **Step 3: Dark theme check**

While still in the running app, toggle dark mode (via the existing theme toggle in the main app shell, e.g. from a logged-in session's header/settings). Re-visit at least 3 of the 7 runtime screens (Home, Conveyor Overview, Alarms) and confirm backgrounds/borders/text follow the dark theme correctly (they should, since every screen only uses the shared CSS custom properties) and the cyan accent (`--toolboxItemActiveBackground`) still highlights the active sidebar item correctly in dark mode. Stop the dev server after.

- [ ] **Step 4: Rebuild dist and commit**

The production build in Step 1 already regenerated `client/dist/` (tracked in this repo per `client/.gitignore`'s `!dist/` rule). Stage and commit it if `git status` shows changes there:
```bash
cd /Users/tjc/FUXA-master
git add client/dist
git status --short client/dist
```
If there are staged changes:
```bash
git commit -m "chore: rebuild client/dist with runtime navigation"
```
If `git status --short client/dist` is empty, skip the commit.
