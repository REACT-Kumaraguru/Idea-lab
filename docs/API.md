# AICTE IDEA Lab — REST API Specification

All mutating endpoints require an active session and a valid `x-csrf-token` header matching the `XSRF-TOKEN` cookie.

## 1. Authentication & Session Management
- `POST /ich2026/auth/login`
  - Body: `{ email, password }`
  - Response: `{ user: { id, email, fullName, role } }`
  - Protection: Auth Rate Limiter (15 req/15m) + Account Lockout Tracker (5 attempts = 15m lock).
- `POST /ich2026/auth/logout`
  - Destroys active session and clears session cookie.
- `GET /api/csrf-token`
  - Returns current CSRF token: `{ csrfToken: "..." }`

## 2. Health & Telemetry Probes
- `GET /health` — Full system status, uptime, memory, and database connectivity.
- `GET /health/live` — Kubernetes liveness probe (200 OK if server process is running).
- `GET /health/ready` — Kubernetes readiness probe (checks database connection pool).

## 3. Volunteer Portal & Attendance (Phase 14.18)
- `GET /ich2026/volunteer/scan?query=:inviteCodeOrName`
  - Looks up team details, assigned bench, and member roster for QR check-in desk.
  - Requires active login session.
- `POST /ich2026/volunteer/check-in`
  - Body: `{ teamId, benchNumber, isPresent }`
  - Marks team attendance with timestamp and volunteer email.
- `GET /ich2026/volunteer/attendance`
  - Lists the 50 most recently checked-in teams with bench allocations.

## 4. 1-Click Database Snapshot Vault (Phase 14.30)
- `POST /ich2026/admin/system-diagnostic/db-snapshot`
  - Creates a point-in-time snapshot of the database file in `/backups/`.
- `GET /ich2026/admin/system-diagnostic/db-snapshots`
  - Lists all available snapshot backups with size and creation timestamp.
- `POST /ich2026/admin/system-diagnostic/db-snapshot/restore`
  - Body: `{ filename: "manual_snapshot_....sqlite" }`
  - Safely creates a safety backup before restoring chosen snapshot.

## 5. Event Locking & Authority Controls
- `PUT /ich2026/admin/hackathons/:id`
  - Updates hackathon metadata and administrative locks:
    - `isRegistrationLocked: boolean` — Disables team creation and joining.
    - `isPoCSubmissionLocked: boolean` — Disables prototype submissions.
    - `isProblemStatementLocked: boolean` — Disables theme or abstraction edits.
    - `isOnCampusEventActive: boolean` — Activates on-campus live telemetry.
    - `guidelines: string` — Event guidelines and evaluation criteria.
    - `whatsappInviteLink: string` — Official WhatsApp community invite.
