# CLAUDE.md

Orientation for Claude (and humans) working on this repo. Read this first.

## What this project is

A web app for running **events / attendance / registration**. An admin builds forms inside projects, shares a public link, and collects submissions. Submissions can be imported/exported as Excel, items can be claimed via QR codes, and notification emails are sent through SMTP. There is one admin console and one public form surface.

## Stack & layout

Monorepo using npm workspaces.

```
apps/
  backend/   Fastify 4 + TypeScript + MySQL (raw mysql2, no ORM)
  frontend/  React 18 + Vite + custom CSS (Tailwind directives present but barely used)
docs/        Database notes
```

Files an agent should read first to get oriented:

- Backend entry: [apps/backend/src/server.ts](apps/backend/src/server.ts), [apps/backend/src/app.ts](apps/backend/src/app.ts)
- All business logic: [apps/backend/src/modules/admin/admin.data.ts](apps/backend/src/modules/admin/admin.data.ts) (large)
- All admin routes: [apps/backend/src/modules/admin/admin.routes.ts](apps/backend/src/modules/admin/admin.routes.ts)
- Frontend entry: [apps/frontend/src/main.jsx](apps/frontend/src/main.jsx), [apps/frontend/src/App.jsx](apps/frontend/src/App.jsx) (large; routing + global state both live here)
- API client: [apps/frontend/src/services/apiAdminService.js](apps/frontend/src/services/apiAdminService.js)
- Styling tokens: [apps/frontend/src/index.css](apps/frontend/src/index.css) (CSS variables for theming)
- Reusable UI kit: [apps/frontend/src/components/ui/](apps/frontend/src/components/ui/) — `Button`, `Input`, `Textarea`, `Select`, `Card`, `Modal`, `EmptyState`, `Skeleton`, `Spinner`. Import as `import { Button } from "../components/ui";`

## How to run it

Prereqs: Node 18+, MySQL.

```bash
npm install                    # from repo root, installs both workspaces

# env files
cp apps/backend/.env.example apps/backend/.env       # set DB + SMTP
cp apps/frontend/.env.example apps/frontend/.env.local  # set API base

# database
# Apply SQL by hand (no runner yet):
#   apps/backend/src/db/migrations/001_base_schema.sql
#   apps/backend/src/db/migrations/latest_attendance_system.sql
#   apps/backend/src/db/seeds/001_seed_base_data.sql

npm run dev:backend            # Fastify on the port in .env
npm run dev:frontend           # Vite dev server
```

Build: `npm run build`. Typecheck backend only: `npm run typecheck:backend`. There is **no test script** — tests do not exist yet.

## Architecture notes

### Backend
- Three modules under `apps/backend/src/modules/`:
  - `health/` — `GET /health` with a DB ping. Trivial.
  - `attendance/` — **stub**. `GET /api/attendance` returns `[]`, `POST` returns 501. Either implement or delete.
  - `admin/` — everything else. ~28 endpoints under `/api/admin/*` covering projects, forms, submissions, items, claims, QR scan, email templates/logs, users, SSO accounts, login logs.
- Data layer is a **single 2,993-line file** ([admin.data.ts](apps/backend/src/modules/admin/admin.data.ts)) exporting ~30 functions. Look in there before adding anything new — chances are the helper exists.
- DB access: `mysql2/promise` pool in [apps/backend/src/db/mysql.ts](apps/backend/src/db/mysql.ts). Use `withTransaction(...)` in `admin.data.ts` for multi-statement writes. All queries are parameterized — **do not concatenate user input into SQL**.
- Email/QR: [email.service.ts](apps/backend/src/modules/admin/email.service.ts) uses nodemailer + the `qrcode` package; QR images are embedded as CID attachments.
- Excel import/export uses the `xlsx` package, gated by `IMPORT_MAX_FILE_BYTES` (5MB) and `IMPORT_MAX_ROWS` (2000) constants in `admin.data.ts`.

### Frontend
- **Routing**: `react-router-dom` v7 via `<BrowserRouter>` in [main.jsx](apps/frontend/src/main.jsx). [App.jsx](apps/frontend/src/App.jsx) still uses a single `parseRoute()` helper to map paths → route ids and dispatches with `if (route.id === ...)`. `navigate()` is backed by `useNavigate()` but keeps the legacy `(path, { replace })` signature pages already pass around. Splitting to `<Routes>` is Phase 2 work.
- **Global state lives in `App.jsx`** as ~17 `useState` hooks (projects, forms, submissions, filters, etc.) and is **prop-drilled** into every page. No Context, no Redux.
- Pages under `apps/frontend/src/pages/` are big: the form builder is 1,416 lines, submissions page is 814 lines. Only two shared components exist in `src/components/`.
- API calls go through [apiAdminService.js](apps/frontend/src/services/apiAdminService.js) — a thin `fetch` wrapper. No retries, no timeouts, no central error UX.
- Styling: custom CSS in [index.css](apps/frontend/src/index.css) drives everything via CSS variables. Tailwind directives are imported but most code uses hand-written class names. Theme toggle flips `data-theme` on `<html>`.

## Known sharp edges

Read before changing anything sensitive:

- **No authentication or authorization.** Every `/api/admin/*` endpoint is publicly callable. Do not deploy as-is.
- **No request validation.** Route bodies are typed `Record<string, any>` and passed straight to the data layer. SQL is safe (parameterized) but business logic trusts everything.
- **No CORS, no rate limiting, no error handler hook.** Internal errors leak to the client.
- **One UI library**: Tailwind (lightly used) + Lucide icons + the in-house `components/ui/` kit. `antd` and `@elastic/eui` were removed in Phase 1 — do not re-add them.
- **`toShareKey()` in `admin.data.ts` uses `Math.random()`.** Replace with `crypto.randomBytes` before this guards anything sensitive.
- **No tests at all.** Don't trust refactors — verify by running the app.
- **No migration runner.** SQL files are applied by hand. Don't assume a fresh DB matches the code.
- **Thai strings are hardcoded everywhere.** No i18n setup. Search before editing user-facing text.
- **Attendance module is a stub.** Don't wire a UI to it expecting it to work.
- **`App.jsx` is a god component** (1,161 lines, 17 `useState`). Adding state there is the easy path and the wrong one.

## Conventions to follow when editing

- Backend: keep SQL parameterized (`?` placeholders), use `withTransaction` for multi-statement writes, prefer extending existing functions in `admin.data.ts` to copy-pasting them.
- Frontend: prefer CSS variables from [index.css](apps/frontend/src/index.css) over hardcoded colors; use Lucide for icons; do **not** introduce new `antd` or `@elastic/eui` imports — we are deleting both.
- Don't widen `any` further. Don't add hardcoded secrets. Don't commit `.env`.

## Improvement roadmap

Each phase is independently shippable. Start with Phase 1; the rest can interleave once the foundation is in place.

### Phase 1 — UX/UI foundations ✅ *(done)*

- ✅ Dropped `antd`, `@elastic/eui`, `@elastic/eui-theme-borealis`, `@elastic/datemath`, `@emotion/*`, `moment` (248 packages removed). `EuiDatePicker` in [SubmissionsPage.jsx](apps/frontend/src/pages/SubmissionsPage.jsx) replaced with two native `<input type="datetime-local">` fields.
- ✅ Scaffolded [apps/frontend/src/components/ui/](apps/frontend/src/components/ui/) with `Button`, `Input`, `Textarea`, `Select`, `Card`, `Modal` (focus-trap + escape + portal), `EmptyState`, `Skeleton`, `Spinner`. CSS lives at the bottom of [index.css](apps/frontend/src/index.css) under `/* ----- ui/ component kit ----- */`.
- ✅ Installed `react-router-dom@7`. [main.jsx](apps/frontend/src/main.jsx) wraps the app in `<BrowserRouter>`; [App.jsx](apps/frontend/src/App.jsx) derives `route` from `useLocation()` and backs `navigate()` with `useNavigate()`. The old `popstate`/`pushState` plumbing is gone. The big dispatch block (`if (route.id === ...)`) is left in place — turning it into `<Routes>` is Phase 2.

### Phase 2 — Break up the worst pages

- Split [CreateAttendanceTemplatePage.jsx](apps/frontend/src/pages/CreateAttendanceTemplatePage.jsx) into a `pages/FormBuilder/` folder: field-type registry, `FieldEditor`, `FieldPreview`, `FormToolbar`, `useDraftAutosave` hook.
- Split [SubmissionsPage.jsx](apps/frontend/src/pages/SubmissionsPage.jsx) into table / filters / import modal / export modal.
- Move global state out of `App.jsx` into a handful of Context providers (`ProjectsProvider`, `FormsProvider`, `SubmissionsProvider`, `SessionProvider`). Stop prop drilling.

### Phase 3 — Client polish

- Add `zod` for client-side form validation; show inline errors instead of waiting for the backend.
- Add loading skeletons + consistent empty/error states using the Phase 1 kit.
- Harden [apiAdminService.js](apps/frontend/src/services/apiAdminService.js): per-request timeouts, retry-once on network errors, typed error objects pages can render.
- Accessibility pass: focus traps in modals, `aria-label` on icon-only buttons, keyboard nav in the form builder.
- Add `react-i18next`; move Thai strings to `locales/th.json` and prepare `locales/en.json`.

### Phase 4 — Backend hardening *(required before any real deployment)*

- Add an auth layer (pick session-cookie or JWT, not both). Protect every `/api/admin/*` route.
- Replace `Record<string, any>` bodies with schemas (`zod` + `fastify-type-provider-zod`). Validation + free types.
- Split [admin.data.ts](apps/backend/src/modules/admin/admin.data.ts) by domain: `projects/`, `forms/`, `submissions/`, `claims/`, `email/`, `users/`. Keep shared helpers (`withTransaction`) in one place.
- Replace `Math.random()` token generation with `crypto.randomBytes`.
- Add an error handler hook (`fastify.setErrorHandler`) so internals don't leak; add CORS via env.
- Decide on the `attendance/` module: implement or delete.
- Write a migration runner (`npm run migrate`) that applies files in `src/db/migrations/` in order, tracking applied versions in a table.

### Phase 5 — Tests & CI

- Vitest for the new component kit and form-builder pieces.
- Integration tests against the backend (one per module, against a real test DB).
- GitHub Action: `typecheck` + `build` + `test` on push.
