# IdeaLab v5 — 9.5+ Overhaul Implementation Plan

> **Goal:** Transform IdeaLab v5 from a 6.2/10 into a **9.5–9.9/10** production-grade application — secure, performant, accessible, tested, monitored, documented, and polished to professional standards.
> 
> **Constraint:** Zero external API keys. Everything open-source, self-hosted, free.

---

## Phase Overview

| Phase | Focus | What It Does | Rating Impact |
|---|---|---|---|
| 1 | 🔴 Critical Security | Kill header auth, rate limiting, creds, CORS | 3.0 → 7.5 |
| 2 | 🟠 Security Hardening | CSRF, CSP, security headers | 7.5 → 9.0 |
| 3 | 🟠 Database Integrity | Sequelize migrations, Zod validation, indexes | Backend 6.0 → 8.5 |
| 4 | 🟡 Frontend Performance | React.lazy, React Query, skeletons, images | Frontend 5.5 → 9.0 |
| 5 | 🟡 Code Quality | Break monster files, TypeScript, shared UI | Code 5.0 → 9.0 |
| 6 | 🟡 Testing | Integration + Component + E2E (Playwright) | Testing 0.0 → 9.0 |
| 7 | 🟡 Accessibility | WCAG 2.1 AA, keyboard nav, screen reader | Accessibility 3.0 → 9.0 |
| 8 | 🟢 Monitoring | Structured logging, health checks, metrics | DevOps 4.0 → 8.0 |
| 9 | 🟢 DevOps | CI/CD, staging, Docker optimization | DevOps 8.0 → 9.5 |
| 10 | 🟢 Documentation | OpenAPI, README, ADRs, onboarding guide | Docs 2.0 → 9.0 |
| **11** | **🔵 Performance Perfection** | **Lighthouse 95+, compression, pooling, fonts** | **Frontend 9.0 → 9.7** |
| **12** | **🔵 Security Audit** | **OWASP ZAP, password policy, account lockout, sanitization** | **Security 9.0 → 9.7** |
| **13** | **🔵 PWA & Polish** | **Offline support, custom error pages, transitions, empty states** | **UX 9.0 → 9.7** |
| **14** | **🔵 Admin Authority & UX** | **Admin controls, locking flags, reviewer portal, contact tab, templates, broadcasts, QR codes, volunteer dashboard, conditional attendance tab, filtered exports, responsive layouts** | **UX/Features → 9.9** |

---

## Proposed Changes

---

### Phase 1 — Critical Security Fixes 🔴
*~15 files modified, ~3 new files*

#### 1.1 Kill `x-hackathon-user` Header Auth → Server Sessions

##### [MODIFY] [hackathonAuth.middleware.js](file:///C:/Users/user/Documents/Idea-lab/Idealab_v5%20-%20for%20my%20local%20host%20-%20after%20launching%20live/backend/src/middleware/hackathonAuth.middleware.js)
- **Remove** the `x-hackathon-user` header fallback entirely
- Authenticate **only** via `req.session.hackathonUser`

##### [MODIFY] [useHackathonAuthStore.js](file:///C:/Users/user/Documents/Idea-lab/Idealab_v5%20-%20for%20my%20local%20host%20-%20after%20launching%20live/frontend/src/store/useHackathonAuthStore.js)
- Remove all `localStorage` read/write for user objects
- Switch to cookie-based auth (same pattern as `useAuthStore.js`)

##### [MODIFY] [axios.js](file:///C:/Users/user/Documents/Idea-lab/Idealab_v5%20-%20for%20my%20local%20host%20-%20after%20launching%20live/frontend/src/lib/axios.js)
- Remove the Axios interceptor injecting `x-hackathon-user` header

##### [MODIFY] Hackathon login/register/logout controllers
- Ensure login sets `req.session.hackathonUser = { id, role, email }`
- Ensure logout clears `req.session.hackathonUser`

---

#### 1.2 Remove Hardcoded Credentials

##### [MODIFY] [ensureDefaultAdmin.js](file:///C:/Users/user/Documents/Idea-lab/Idealab_v5%20-%20for%20my%20local%20host%20-%20after%20launching%20live/backend/src/scripts/ensureDefaultAdmin.js)
- Read default password from `ENV.DEFAULT_ADMIN_PASSWORD`
- Add `mustChangePassword` flag on Admin model
- Log warning if default credentials used

##### [MODIFY] [ensureDefaultHackathonAdmin.js](file:///C:/Users/user/Documents/Idea-lab/Idealab_v5%20-%20for%20my%20local%20host%20-%20after%20launching%20live/backend/src/scripts/ensureDefaultHackathonAdmin.js) & [ensureHackathonAdminMentorPasswords.js](file:///C:/Users/user/Documents/Idea-lab/Idealab_v5%20-%20for%20my%20local%20host%20-%20after%20launching%20live/backend/src/scripts/ensureHackathonAdminMentorPasswords.js)
- Same treatment — env vars, no hardcoded passwords

---

#### 1.3 Add Rate Limiting

##### [NEW] `backend/src/middleware/rateLimit.middleware.js`
- **Auth endpoints:** 5 req / 15 min / IP
- **OTP verification:** 10 attempts / 15 min / IP
- **General API:** 100 req / min / IP
- **File upload:** 10 req / hour / user

---

#### 1.4 Lock Down CORS & Session Secret

##### [MODIFY] [server.js](file:///C:/Users/user/Documents/Idea-lab/Idealab_v5%20-%20for%20my%20local%20host%20-%20after%20launching%20live/backend/server.js)
- Replace `origin: true` with explicit whitelist
- In production, **throw** if `SESSION_SECRET` is missing
- Move `import HackathonRegistration` (line 86) to top

---

### Phase 2 — Security Hardening 🟠
*~8 files modified, ~4 new files*

#### 2.1 CSRF Protection

##### [NEW] `backend/src/middleware/csrf.middleware.js`
- Double-submit cookie pattern
- Validate token on all `POST`, `PUT`, `PATCH`, `DELETE` requests

##### [MODIFY] Frontend Axios instance
- Read CSRF token from cookie, attach as `X-CSRF-Token` header

---

#### 2.2 Content Security Policy

##### [MODIFY] [server.js](file:///C:/Users/user/Documents/Idea-lab/Idealab_v5%20-%20for%20my%20local%20host%20-%20after%20launching%20live/backend/server.js)
- Re-enable Helmet CSP with strict directives
- Allow only: self, Google Fonts, Google Analytics, own API

---

#### 2.3 Security Headers

##### [MODIFY] [server.js](file:///C:/Users/user/Documents/Idea-lab/Idealab_v5%20-%20for%20my%20local%20host%20-%20after%20launching%20live/backend/server.js)
- `Permissions-Policy` — disable unused browser APIs
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security` with long max-age

---

### Phase 3 — Database & Data Integrity 🟠
*~20 files modified, ~15 new migration files*

#### 3.1 Replace `sync({ alter: true })` with Sequelize Migrations

##### [NEW] `backend/migrations/` — proper numbered migration files with `up()` and `down()` rollbacks
##### [NEW] `backend/.sequelizerc` — CLI config
##### [NEW] `backend/seeders/` — separate seed data

##### [MODIFY] [db.js](file:///C:/Users/user/Documents/Idea-lab/Idealab_v5%20-%20for%20my%20local%20host%20-%20after%20launching%20live/backend/src/lib/db.js)
- Replace `sync({ alter: true })` with `authenticate()` + migration runner

##### [DELETE] All `ensure*.js` migration scripts → consolidated into proper migrations

---

#### 3.2 Add Input Validation with Zod

##### [NEW] `backend/src/validators/` — schemas for every endpoint
##### [NEW] `backend/src/middleware/validate.middleware.js` — generic validation middleware

---

#### 3.3 Database Indexing

##### [NEW] Migration: `add-performance-indexes.js`
- Composite indexes on: `equipment_bookings(equipment_id, booking_date, status)`, `hackathon_teams(hackathon_id, status)`, `hackathon_submissions(team_id, submission_phase)`, `otp_codes(email, type, expires_at)`

---

#### 3.4 Backup Script

##### [NEW] `backend/scripts/backup-db.sh` — `pg_dump` with timestamped filenames, 30-day retention

---

### Phase 4 — Frontend Performance 🟡
*~12 files modified, ~6 new files*

#### 4.1 Code Splitting

##### [MODIFY] [App.jsx](file:///C:/Users/user/Documents/Idea-lab/Idealab_v5%20-%20for%20my%20local%20host%20-%20after%20launching%20live/frontend/src/App.jsx)
- Replace 40+ eager imports with `React.lazy()`
- Group: `auth`, `student`, `admin`, `hackathon`, `hackathon-admin`
- `<Suspense fallback={<PageSkeleton />}>`

##### [NEW] `frontend/src/components/PageSkeleton.jsx`

---

#### 4.2 React Query

##### [NEW] `frontend/src/lib/queryClient.js`
##### [NEW] `frontend/src/hooks/queries/` — typed query hooks replacing raw `useEffect`
##### [MODIFY] [main.jsx](file:///C:/Users/user/Documents/Idea-lab/Idealab_v5%20-%20for%20my%20local%20host%20-%20after%20launching%20live/frontend/src/main.jsx) — wrap in `<QueryClientProvider>`

---

#### 4.3 Skeleton Loaders

##### [NEW] `frontend/src/components/ui/SkeletonCard.jsx`, `SkeletonTable.jsx`, `SkeletonText.jsx`

---

#### 4.4 Image Optimization

- Resize + convert to WebP on upload via `sharp`
- `loading="lazy"` + `width`/`height` on all `<img>` tags

---

### Phase 5 — Code Quality 🟡
*~30 files modified/split, ~20 new files*

#### 5.1 Break Monster Files

- `HackathonAdminDetailPage.jsx` (1800 lines) → 5 tab components
- `LandingPage.jsx` (1100 lines) → 5 section components
- `HackathonDashboard.jsx` → 4 sub-components
- `Approval.jsx` → 3 sub-components

#### 5.2 Extract Route Guards

##### [NEW] `frontend/src/components/guards/` — `ProtectedRoute.jsx`, `AdminRoute.jsx`, `HackathonRoute.jsx`

#### 5.3 Shared UI Component Library

##### [NEW] `frontend/src/components/ui/` — `Button.jsx`, `Modal.jsx`, `Badge.jsx`, `Input.jsx`, `Select.jsx`, `Card.jsx`

#### 5.4 TypeScript (Critical Paths)

- All Zustand stores, API hooks, validators, middleware, route guards → `.ts` / `.tsx`
- `allowJs: true` — existing JS files untouched
- JSDoc types on remaining files

#### 5.5 Clean Up Dead Code

- Delete empty files (`App.css`, `AdminLogin.jsx`)
- Remove unused imports via ESLint

---

### Phase 6 — Comprehensive Testing 🟡
*~25 new test files*

#### 6.1 Infrastructure
- `vitest` + `supertest` (backend), `@testing-library/react` (frontend), `@playwright/test` (E2E)

#### 6.2 Backend Integration Tests
- Auth flows (signup, OTP, login, logout, reset)
- Booking flows (cart, submit, approve, QR verify)
- Hackathon flows (team lifecycle, submissions, reviews)
- Rate limiting triggers

#### 6.3 Frontend Component Tests
- Login, EquipmentBooking, Cart, ProtectedRoute

#### 6.4 End-to-End Tests (Playwright)
- Student booking flow, admin approval flow, hackathon registration flow, reviewer flow
- **Coverage target: 80%+ backend, 70%+ frontend**

---

### Phase 7 — Accessibility (WCAG 2.1 AA) 🟡
*~20 files modified*

#### 7.1 Semantic HTML & ARIA
- Replace `<div>` soup with `<main>`, `<nav>`, `<section>`, `<article>`
- `aria-label` on icon buttons, `aria-live` on dynamic content, `role="alert"` on errors

#### 7.2 Keyboard Navigation
- All elements reachable via Tab, visible `:focus-visible` outlines
- Modal focus trap + `Escape` to close
- Skip-to-content link

#### 7.3 Color Contrast
- Audit all combinations against WCAG AA (4.5:1 / 3:1)
- Status badges use icons + text, not color alone

#### 7.4 Screen Reader
- `aria-live` regions for status changes, cart updates, OTP timers
- Proper `<table>` structure with `<caption>`, `<thead>`, `<th scope>`

---

### Phase 8 — Monitoring & Observability 🟢
*~10 files modified, ~5 new files (NO external services)*

#### 8.1 Structured Logging (Pino — replaces Sentry, zero API keys)

##### [NEW] `backend/src/lib/logger.js`
- JSON structured logs with levels: `fatal`, `error`, `warn`, `info`, `debug`
- Include: request ID, user ID, endpoint, response time
- Redact sensitive fields (passwords, OTPs)

##### [NEW] `backend/src/middleware/requestLogger.middleware.js`
- Log every request with method, path, status, timing, user

##### [MODIFY] All controllers — replace `console.log` with `logger`

---

#### 8.2 Health Checks

##### [MODIFY] [server.js](file:///C:/Users/user/Documents/Idea-lab/Idealab_v5%20-%20for%20my%20local%20host%20-%20after%20launching%20live/backend/server.js)
- `GET /health` → `{ status, uptime, version, timestamp }`
- `GET /health/ready` → checks DB + Redis connectivity
- `GET /health/live` → lightweight liveness probe

---

#### 8.3 Frontend Error Logging

##### [MODIFY] [ErrorBoundary.jsx](file:///C:/Users/user/Documents/Idea-lab/Idealab_v5%20-%20for%20my%20local%20host%20-%20after%20launching%20live/frontend/src/components/ErrorBoundary.jsx)
- Log caught errors to backend endpoint `POST /api/logs/client-error`
- Include component stack, URL, user agent, user ID

##### [NEW] Backend `POST /api/logs/client-error` endpoint
- Writes frontend errors to Pino log files (no external service)

---

### Phase 9 — DevOps Excellence 🟢
*~8 new files*

#### 9.1 CI/CD Pipeline
##### [NEW] `.github/workflows/ci.yml` — lint, test, build, E2E, audit on every push
##### [NEW] `.github/workflows/deploy.yml` — deploy on main merge, run migrations, health check, auto-rollback

#### 9.2 Staging Environment
##### [NEW] `docker-compose.staging.yml` — mirror of production with separate DB

#### 9.3 Docker Optimization
- Multi-stage builds, pinned versions, non-root user, `.dockerignore`

#### 9.4 Automated Backups
- Cron-based `pg_dump` sidecar in Docker Compose

---

### Phase 10 — Documentation 🟢
*~10 new files*

#### 10.1 API Documentation
##### [NEW] Swagger/OpenAPI at `/api/docs` — interactive docs for all 60+ endpoints

#### 10.2 Architecture Decision Records
##### [NEW] `docs/adr/` — why sessions over JWT, why dual DB, why BullMQ, etc.

#### 10.3 Developer Onboarding
##### [NEW] `docs/CONTRIBUTING.md` — setup, architecture, conventions, testing
##### [MODIFY] [README.md](file:///C:/Users/user/Documents/Idea-lab/Idealab_v5%20-%20for%20my%20local%20host%20-%20after%20launching%20live/README.md) — expand from 34 bytes to comprehensive project overview

---

### Phase 11 — Performance Perfection 🔵 *(NEW — pushes to 9.5+)*
*~8 files modified, ~3 new files*

> This phase targets a **Lighthouse Performance score of 95+**.

#### 11.1 Response Compression

##### [MODIFY] [server.js](file:///C:/Users/user/Documents/Idea-lab/Idealab_v5%20-%20for%20my%20local%20host%20-%20after%20launching%20live/backend/server.js)
- Install and apply `compression` middleware — gzip/brotli all JSON and static responses
- Typical API response size reduction: 60-80%

---

#### 11.2 Database Connection Pooling

##### [MODIFY] [db.js](file:///C:/Users/user/Documents/Idea-lab/Idealab_v5%20-%20for%20my%20local%20host%20-%20after%20launching%20live/backend/src/lib/db.js)
- Configure Sequelize pool: `min: 2`, `max: 10`, `acquire: 30000`, `idle: 10000`
- Add connection pool monitoring in health check

---

#### 11.3 Font Optimization

##### [MODIFY] [index.html](file:///C:/Users/user/Documents/Idea-lab/Idealab_v5%20-%20for%20my%20local%20host%20-%20after%20launching%20live/frontend/index.html)
- Add `<link rel="preload">` for critical fonts (Inter 400/600)
- Add `font-display: swap` to prevent invisible text during load
- Subset fonts to Latin characters only (reduces font file sizes ~70%)

---

#### 11.4 Critical CSS Inlining

##### [MODIFY] [vite.config.js](file:///C:/Users/user/Documents/Idea-lab/Idealab_v5%20-%20for%20my%20local%20host%20-%20after%20launching%20live/frontend/vite.config.js)
- Install `vite-plugin-css-injected-by-js` or configure `build.cssCodeSplit: true`
- Inline above-the-fold CSS to prevent render-blocking

---

#### 11.5 Preload Hints

##### [MODIFY] [index.html](file:///C:/Users/user/Documents/Idea-lab/Idealab_v5%20-%20for%20my%20local%20host%20-%20after%20launching%20live/frontend/index.html)
- `<link rel="modulepreload">` for critical JS chunks (auth, landing page)
- `<link rel="dns-prefetch">` for Google Fonts, Google Analytics

---

#### 11.6 Bundle Optimization

##### [MODIFY] [vite.config.js](file:///C:/Users/user/Documents/Idea-lab/Idealab_v5%20-%20for%20my%20local%20host%20-%20after%20launching%20live/frontend/vite.config.js)
- Configure `build.rollupOptions.output.manualChunks` to split:
  - `vendor-react` — React + ReactDOM (rarely changes, cached long-term)
  - `vendor-ui` — framer-motion, lucide-react
  - `vendor-pdf` — jspdf, react-pdf (only loaded on admin certificate pages)
  - `vendor-qr` — html5-qrcode, qrcode.react (only loaded on scanner/check-in pages)
- Install `rollup-plugin-visualizer` to verify bundle splits

---

### Phase 12 — Security Audit 🔵 *(NEW — pushes to 9.5+)*
*~10 files modified, ~3 new files*

> Automated security scanning + hardened authentication. Zero external services.

#### 12.1 OWASP ZAP Scan

##### [NEW] `scripts/security-scan.sh`
- Run OWASP ZAP baseline scan against local/staging server.
- Add to CI workflow.

---

#### 12.2 Password Strength Policy

##### [MODIFY] Auth controllers (both portal and hackathon)
- Enforce minimum password requirements via Zod schema (min 8 chars, 1 uppercase, 1 lowercase, 1 number)

##### [MODIFY] Frontend signup forms
- Real-time password strength indicators

---

#### 12.3 Account Lockout

##### [NEW] `backend/src/middleware/accountLockout.middleware.js`
- Track failed attempts per email. Lock account for 15 minutes after 5 failures.

---

#### 12.4 Session Rotation

##### [MODIFY] Auth controllers
- Regenerate session ID on login/privilege escalation to prevent session fixation.

---

#### 12.5 Input Sanitization

##### Install `dompurify` + `isomorphic-dompurify`
- Sanitize HTML fields on backend controllers and frontend renderers to block XSS.

---

#### 12.6 SQL Injection Hardening

- Parameterize all dynamic migrations and script SQL queries.

---

### Phase 13 — PWA & Final Polish 🔵 *(NEW — pushes to 9.5+)*
*~12 files modified, ~8 new files*

#### 13.1 Progressive Web App (PWA)
- Create manifest and service worker (SW) for caching assets + rendering an offline fallback page.

#### 13.2 Custom Error Pages
- Beautiful 404 and 500 error pages integrated with frontend routing.

#### 13.3 Page Transitions
- Route swaps wrapped in framer-motion `<AnimatePresence>` for smooth fade-in transitions.

#### 13.4 Empty States
- Custom graphic empty states for list areas ("No bookings yet", "No submissions", etc.).

#### 13.5 Loading States Audit
- Spinner elements embedded inside mutating action buttons. Submit forms disabled during async processing.

#### 13.6 Toast Notification Consistency
- Standardize timing and clear messaging on success/error toasts.

#### 13.7 SEO & Meta Tags
- Page meta helper rendering semantic title tags and og elements dynamically.

---

### Phase 14 — Admin Authority & UX Enhancements 🔵 *(UPDATED)*
*~35 files modified, ~12 new files*

> Maximum administrative UI autonomy, real-time communication tools, responsive mobile optimization, and a dedicated Volunteer operational layer.

#### 14.1 Full Admin Team Management
- **Add Team Feature:** Admin can manually create teams (auto-generating unique random team code).
- **Remove Team Feature:** Admin can delete teams (with confirmation modal).
- **Edit Members & Details:** Admin can add/remove members or edit details of specific team members directly from the Admin team dashboard.

#### 14.2 Editable Guidelines
- Add guidelines column to Hackathon schema. Render guidelines in student dashboard dynamically.

#### 14.3 Registration Locking Flags
- Toggle switch in Edit Hackathon form. Checks Boolean field `isRegistrationLocked` in registration middleware and rejects if locked.

#### 14.4 Team Search and Filter
- Search bar in `/Hackathon/admin/teams` to filter list by **Team Name** and **Team Code** (supporting backend query filters).

#### 14.5 Submission Locking Flags
- Toggle switch in Edit Hackathon form. Checks Boolean field `isPoCSubmissionLocked` before uploading/updating submission files.

#### 14.6 Personalized Problem Statement Locking Flags
- Toggle switch in Edit Hackathon form. Checks Boolean field `isProblemStatementLocked` before letting students submit custom problem statements.

#### 14.7 Reviewer Portal Improvements
- Create reviewer account form requiring ONLY **Email** and **Password** (removes phone number/profile requirements). Edit reviewers, delete with warning popups, and allocate multi-select themes.

#### 14.8 WhatsApp Invite Link & Mandatory Coordinates
- Add `whatsappInviteLink` (optional), `facultyCoordinates` (JSON array — **MANDATORY**), and `studentCoordinates` (JSON array — **MANDATORY**) to Hackathon table.
- Display under "Contact" tab on student dashboard only if student has registered.

#### 14.9 Team Removal Warning for Team Leaders
- Warning modal wrapper on student dashboard: *"Are you sure you want to remove [Student Name]? This cannot be undone."*

#### 14.10 Targeted Hackathon Registration Popup
- Registration prompt only pops up when student clicks the **"Register"** button inside the Hackathon page, and only if not already registered.

#### 14.11 Slide Deck Templates & Link Validation (Student Dashboard)
- Admin can configure a slide template URL in Hackathon settings. Students see a download template link in submission cards.
- Validate submitted repository URLs to ensure they are well-formed and public.

#### 14.12 Mentor-Only Grading Leaderboard
- Mentor grading sheet for allocated teams under assigned themes. Real-time scoreboard compiled for Admins in their dashboard.

#### 14.13 Live Announcements / Broadcast Banner (Admin Only)

##### [NEW] Server-Sent Events (SSE) Real-Time Pipeline
- Create a lightweight real-time event pipeline (`GET /api/announcements/stream`) using Node.js Server-Sent Events (SSE) — **requires no external API keys or server processes**.
- Admin dashboard interface to broadcast alerts. Shows a rolling/dismissible marquee banner at the top of student and volunteer dashboards instantly.

#### 14.14 Unique Team QR Code Generation

##### [MODIFY] Student Dashboard
- Generate a unique QR code representing the team.
- QR Payload format: `{ "teamName": "...", "teamCode": "...", "members": ["Name 1", "Name 2"], "memberCount": X }`.
- Rendered on the Team view for scanning verification.

#### 14.15 Filtered and Sorted Export Guards

##### [MODIFY] Excel/PDF Export Actions (Admin Dashboard)
- Adjust the export library logic to parse and export **only the active filtered and sorted state** visible on the screen, rather than pulling the raw unfiltered database.

#### 14.16 Target Reviewer Emails

##### [MODIFY] Admin "Send Email" tab
- Add filter option to target only the reviewers assigned to a specific selected hackathon.

#### 14.17 Phone-Friendly Responsive Polish

##### [MODIFY] CSS stylesheets & layouts
- Re-architect layout structure using clean media queries to make pages completely responsive on phone aspect ratios.
- **Strict Guard:** All changes must use non-intrusive wrapping/stacking layout adjustments to ensure the Desktop view is untouched.

#### 14.18 Student Volunteer Dashboard

##### [NEW] Volunteer Portal (`/Hackathon/volunteer`)
- Dedicated dashboard for the new **Volunteer** role.
- Includes a live scanner option to check-in student teams and verify details.
- Receives live announcements broadcasted by the Admin.

##### [NEW] Volunteer Role Authorization
- Extend user models and session middleware to support the `'volunteer'` role.
- Volunteer account creation uses simple Email and Password (no phone/profile constraints), identical to the reviewer workflow.

#### 14.19 On-Campus Event Day Attendance Toggle

##### [MODIFY] Hackathon DB Model & Admin Form
- Add Boolean flag `isOnCampusEventActive` (default: `false`).
- Toggle switch in Edit Hackathon form.

##### [MODIFY] Volunteer Scanner Controller
- Scanning QR codes to record attendance is **only permitted** when `isOnCampusEventActive` is enabled on the server. If disabled, the scanner redirects to verification-only mode and blocks attendance marks.

#### 14.20 Volunteer Management Tab (Admin Dashboard)
- Dedicated "Volunteers" tab in the Admin panel to create, edit, delete, and list volunteer accounts with confirmation modals.

#### 14.21 Conditional Admin Attendance Tab

##### [MODIFY] Admin Dashboard
- **Conditional Visibility:** Add a dedicated "Attendance" tab in the Admin Hackathon Panel that renders **only** when `isOnCampusEventActive` is toggled `true` OR when the event is marked complete/over.
- **Sorting Features:** Add sorting capability to let Admin sort the check-in list dynamically by attendance status (sorting "Present" first, or "Absent" first).

#### 14.22 Automated System Diagnostics & Health Suite

##### [NEW] Admin System Health Portal (`/Hackathon/admin/system-health`)
- **16-Subsystem Verification Engine:** Automated live health probe covering:
  - Database latency & model row count telemetry.
  - Programmatic Umzug migration & column schema verification.
  - Academic cluster evaluation engine & faculty committee mappings.
  - Storage directory read/write accessibility (`uploads/`, `uploads/submissions/`, `uploads/payments/`, `uploads/problem_documents/`).
  - Physical disk headroom & storage footprint calculation.
  - Relational referential integrity & orphan record audit across all tables.
  - Sharp dynamic WebP image transcoding pipeline.
  - SMTP mailer transporter verification.
  - Security layers, session isolation, and rate-limiting integrity.
  - Active attack resilience, SQL injection parameterization, and XSS sanitization probes.
  - High-concurrency query burst & Sequelize connection pool stress test.
  - Event authority governance & locking flags audit.
  - Webpage route auditing & canonical URL validation (21 portal routes).
  - Dual-track lifecycle end-to-end simulation (Predefined Problem + Custom Theme tracks) with automated sandbox test record purging.
  - Node.js runtime process telemetry (memory RSS, V8 heap utilization, uptime).
  - Interactive button & dashboard feature interaction audit (36 master interaction tests).
- **One-Click Auto-Update & Repair:** Automated endpoint (`POST /api/ich2026/admin/system-diagnostic/auto-update`) to reconcile missing columns and repair schema discrepancies.
- **Audit Report Export:** Download full timestamped JSON diagnostic audit reports directly from the UI.

##### [FUTURE PLAN] Self-Expanding Dynamic Feature Discovery & Future-Proof Diagnostic Engine
- **Dynamic Plugin & Test Hook Registry:**
  - Introduce a modular `registerDiagnosticProbe(domain, { category, testFn, priority })` registry so that any newly created future features (e.g., AI auto-judging, dynamic leaderboard sockets, automated certificate generation, payment webhook reconciliations) can self-register custom diagnostic probes simply by exporting a probe in their feature directory.
- **Automated Express Route Stack Auto-Discovery:**
  - Automatically inspect the Express router stack (`router.stack`) on diagnostic execution to auto-discover all newly added endpoints, verifying their auth guards, rate-limiting tier, and parameter schemas automatically without manual test updates.
- **Dynamic DB Schema & Model Drift Detection:**
  - Introspect all Sequelize models dynamically against SQLite/PostgreSQL table schemas (`PRAGMA table_info` / `information_schema.columns`) on every health run to automatically detect any newly added model columns or relational associations, alerting admins to schema drift or running one-click auto-migration.
- **Pluggable Synthetic E2E Workflow Hooks:**
  - Provide lifecycle hooks where newly added role workflows (e.g., certificate downloading, live round 2 stage grading) can append sandboxed dry-run transactions that automatically test themselves and clean up artifacts after execution.
- **Real-Time Schema Drift Watcher / Alerting Daemon:**
  - Optional background cron/webhook that periodically executes the diagnostic suite and pushes instant alerts to Admin if new features fail integrity benchmarks or encounter route / database discrepancies.

#### 14.23 Academic Cluster Evaluation & Faculty Assignment Engine

##### [NEW] Cluster Evaluation Dashboard (`/Hackathon/cluster/dashboard`) & Admin Approvals (`/Hackathon/admin/cluster-approvals`)
- **5 Academic Clusters:** Computer Science, Electronics, Civil, Electrical, and Mechanical.
- **Faculty Committee Allocation:** Even distribution algorithm allocating teams to assigned faculty evaluators within each cluster domain.
- **Scoring & Approvals:** Faculty scoring out of 10 with written feedback, and Admin batch approval workflows.

#### 14.24 Themes & Problem Statement Management

##### [NEW] Themes & Clusters Panel (`/Hackathon/admin/themes`)
- Admin control panel for managing custom student problem statements and allocating them to relevant cluster domains.
- Real-time filtering, theme locking toggles, and status updates.

#### 14.25 Unified Staff & Reviewer Management

##### [NEW] Staff & Volunteers Management Panel (`/Hackathon/admin/staff`)
- Centralized administration console for managing both Volunteer check-in scanner accounts and Cluster Committee Reviewer credentials.
- Simplified onboarding with email and password without mandatory phone/profile constraints.

#### 14.26 Self-Healing CSRF Security Architecture

##### [MODIFY] Frontend Axios Client & Backend Session Store
- **Automatic Prefetching:** Prefetches CSRF security token on initial application mount.
- **Automatic Header Injection:** Injects `x-csrf-token` header into all mutating requests (`POST`, `PUT`, `PATCH`, `DELETE`).
- **403 Self-Healing Interceptor:** Automatically catches CSRF token expiration, regenerates a valid session token, and transparently retries the failed mutation.

#### 14.27 Role-Specific Named Route Aliasing & Canonical Redirection

##### [MODIFY] React Router Configuration (`App.jsx`)
- Added explicit named routes for role portals (`/admin-dashboard`, `/student-dashboard`, `/mentor-dashboard`, `/volunteer-dashboard`, `/reviewer-dashboard`).
- Eliminates route shadowing by dynamic hackathon slug catch-all handlers and ensures canonical URL routing across all devices.

#### 14.28 Universal Clean URL & Automatic Canonical Route Generation Engine

##### [NEW & FUTURE-PROOF ARCHITECTURE] Universal Clean URL Standards & Dynamic Sanitization
- **Strict Clean URL Standard for Current & Future Pages:**
  - All existing and future URLs across student, mentor, admin, reviewer, volunteer, and public landing pages must enforce lowercase, human-readable, semantic kebab-case paths without query bloat (e.g., `/hackathon/admin/system-health`, `/hackathon/admin/attendance`, `/hackathon/cluster/dashboard`).
- **Dynamic Slug Sanitizer for Admin-Created Pages & Hackathons:**
  - When creating new hackathons, problem tracks, or custom pages via the Admin Dashboard, an automatic `slugify()` engine automatically normalizes titles:
    - Converts to lowercase and transforms spaces/special characters into clean hyphens (e.g., `"AI & Smart City 2026!"` ➔ `ai-smart-city-2026`).
    - Strips accents, punctuation, query fragments, and duplicate dashes.
    - Automatically guarantees unique slugs to avoid routing collisions.
- **Code-Level Route Generator & Normalization Helper:**
  - Centralized URL builder helper (`makeCleanUrl(base, params)`) to ensure that whenever developers manually create new pages or components in code, clean canonical URLs are generated consistently with no dangling parameters or malformed query strings.
- **Global Case-Insensitive Redirection & Canonicalization:**
  - Automatic routing rules and middleware that catch uppercase or malformed paths (e.g., `/Hackathon/Admin/` or mixed case) and smoothly canonicalize them to the standard lowercase URL in the browser address bar.
- **Continuous Clean URL Diagnostic Auditing:**
  - Integrated into the System Health Suite (Section 14.22) to scan all registered routes, frontend links, and database-persisted slugs on every diagnostic run, asserting 100% compliance with clean URL integrity standards.

#### 14.29 Hackathon Event Media Gallery & Public Project Showcase ("Hall of Fame")

##### [NEW & MODIFY] Admin Hackathon Creation & Edit Modal (Authority to Add Photos & Descriptions)
- **Admin Photo & Description Management:**
  - When creating or editing a hackathon in the Admin Dashboard (`HackathonAdminHome` / Hackathon Edit Modal), provide an interactive **Event Media Gallery** upload interface.
  - Allows Admins to upload multiple event photos, past editions, venue highlights, or winner ceremonies.
  - Each uploaded image supports an editable **Title / Tagline** and a rich **Description** detailing the context (e.g., keynote sessions, prototyping labs, jury evaluation moments).
  - Admin can reorder, update captions, replace images, and delete gallery items with instant preview.
- **Backend Schema & Storage Pipeline:**
  - Add `gallery` column (`DataTypes.TEXT` / JSON serialized array: `[{ id, url, title, description, displayOrder, uploadedAt }]`) to the `Hackathon` model and database.
  - Automated Sharp WebP image compression and thumbnail generation upon upload to optimize loading speeds.

##### [NEW & MODIFY] Particular Hackathon Public Page (`/hackathons/:slug`)
- **Matching Root Website UI Design Pattern:**
  - Render the Hackathon Event Gallery inside that particular hackathon's public page using the exact aesthetic pattern of the main root website:
    - **Serene Glass Background Cards:** `serene-glass-card` styling with `border border-amber-500/30`, subtle glowing backdrops, and rounded-3xl container frames.
    - **Integrated Photo & Description Cards:** Image placed inside the glass frame with a floating semi-transparent dark pill badge (`bg-stone-950/80 backdrop-blur-md border border-amber-500/30 text-amber-200 font-serif text-sm uppercase tracking-wider`) and a dedicated description block beneath/beside the photo.
    - **Typography & Accents:** Matching Instrument Serif headings, Dancing Script accents, and clean sans-serif body descriptions.
    - **Interactive Lightbox Modal:** Fullscreen high-resolution photo viewer on click with keyboard navigation.

##### [NEW] Public Project Showcase & Innovation Gallery ("Hall of Fame")
- **Showcase Route (`/hackathons/:slug/showcase`):**
  - Publicly browsable gallery displaying top verified student prototypes, abstracts, GitHub repository links, and winning teams.
  - Filter by Domain / Problem Track / Award Category (1st Place, Runner-up, Special Mention).
  - Card layout with prototype thumbnail, team roster, mentor acknowledgement, and jury remarks.

#### 14.30 1-Click Database Snapshot & Rollback Vault (Disaster Recovery Suite)

##### [NEW] Admin System Health Disaster Recovery Panel (`/Hackathon/admin/system-health`)
- **Integrated Snapshot & Recovery Vault Tab:**
  - Dedicated administrative dashboard within the System Health Suite providing visual disaster recovery controls, storage analytics, and historical snapshot logs.
- **1-Click Instant Snapshot Creation (`POST /api/ich2026/admin/db-snapshot/create`):**
  - **WAL Flush Invariant:** Flushes all pending write-ahead logs via `PRAGMA wal_checkpoint(TRUNCATE)` before taking a copy.
  - **Deterministic Atomic Archiving:** Archives database snapshots to `backend/backups/snapshots/` with timestamped filenames and metadata catalogs.
  - **Manifest Logging:** Records snapshot metadata (snapshot ID, creation timestamp, custom label/milestone name, total byte size, entity counts: hackathons, teams, users, submissions, payments, admin author, SHA-256 integrity hash).
- **1-Click Instant Rollback & Recovery (`POST /api/ich2026/admin/db-snapshot/:id/restore`):**
  - **Auto Safety-Net Snapshot:** Automatically creates an emergency snapshot of current live state before executing any restore operation.
  - **Connection Pool Drain & Swap:** Pauses active Sequelize transactions, safely performs atomic file substitution, and reconnects the database.
  - **Automated Post-Restore Health Verification:** Automatically runs `PRAGMA integrity_check`, asserts table row counts match the manifest, and executes the 16-point diagnostic suite to confirm 100% operational health.
- **Vault Management & Storage Controls:**
  - **Local Download & Upload:** Ability to download `.sqlite` snapshots directly to local disk or upload and restore external database backups.
  - **Milestone Auto-Snapshots:** Automatically triggers background snapshots prior to destructive events (bulk team import, hackathon deletion, or automated schema updates).
  - **Automated Retention & Pruning:** Retains the 10 most recent snapshots with auto-pruning to save disk space while keeping pinned milestone snapshots permanently.
