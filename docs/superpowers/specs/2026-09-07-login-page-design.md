# Functional Login Page — Design

## Goal

Replace FUXA's small login dialog with a full-page, LEAR-branded login screen that actually authenticates against FUXA's existing backend, matching the approved visual mockup (`Login Mockup` FUXA View).

## Scope

**In scope**
- New route `/login` rendering a new `LoginPageComponent` — full-screen, dark LEAR-branded layout (logo, "LEAR" wordmark, "Wire Harness Conveyor System / Biñan Plant" context line, Username/Password fields, Sign In button, inline error message, footer tagline), matching the approved mockup.
- Wired to FUXA's real, already-working `AuthService.signIn(username, password)` (existing method, calls `POST /api/signin`) — no backend changes needed.
- `AuthGuard.canActivate()` changed to navigate to `/login?returnUrl=<attempted url>` instead of opening the `LoginComponent` dialog, when authentication is required. On successful sign-in, `LoginPageComponent` navigates to `returnUrl` (falling back to `/runtime` if none given).
- The manual "Log On" trigger in `home.component.ts` (currently `dialog.open(LoginComponent)`) changed to the same redirect pattern.
- Inline error display on failed sign-in (invalid credentials, network error), matching the mockup's error area.

**Out of scope**
- The existing dialog-based `LoginComponent` is left in the codebase untouched, just no longer invoked by the two changed call sites — in case anything else references it later.
- No backend/API changes — `AuthService.signIn()` and `/api/signin` already exist and work.
- Enabling `secureEnabled` on the server itself (a Settings toggle) is a separate, user-performed configuration step, not part of this change — without it, `AuthGuard.canActivate()` short-circuits to allow access and `/login` is simply unused. Not fixing or changing that gate's logic, just its login destination.
- Session/token storage mechanics (`sessionStorage`, JWT expiry handling) are unchanged — `AuthService` already does this.

## Architecture

`LoginPageComponent` is a plain routed Angular component (not a FUXA View — this needs real form binding and HTTP, unlike the SVG-based dashboard screens). It lives at `client/src/app/login-page/` alongside the existing `client/src/app/login/` dialog component (different folder, different component, both coexist). Its template reproduces the mockup's layout using real Angular Material form fields (`matInput`, reactive `FormControl`s for username/password) instead of static SVG text, and calls `authService.signIn()` on submit.

`AuthGuard` and `home.component.ts` both currently import `LoginComponent` and call `MatDialog.open()`; both are changed to call `router.navigate(['/login'], { queryParams: { returnUrl: state.url } })` (or equivalent) instead. `LoginPageComponent` reads `returnUrl` from `ActivatedRoute.snapshot.queryParamMap` and navigates there via `Router.navigateByUrl()` after a successful `signIn()`.

## Verification

- `ng build` succeeds.
- With `secureEnabled` off (current default): app behaves exactly as before (AuthGuard allows access without hitting `/login`).
- With `secureEnabled` manually turned on for a test: navigating to a guarded route (e.g. `/editor`) redirects to `/login?returnUrl=/editor`; entering valid credentials navigates back to `/editor`; invalid credentials show an inline error and stay on `/login`.
- The manual "Log On" button in the runtime header redirects to `/login` and returns to the originating view on success.
