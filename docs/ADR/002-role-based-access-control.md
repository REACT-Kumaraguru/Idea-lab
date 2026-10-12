# ADR 002: Server-Enforced Role-Based Access Control and Eradication of Client Headers

## Context
In legacy builds, some endpoints checked an `x-hackathon-user` or client-supplied payload to infer permissions, and auto-passwords allowed testing without proper identity verification. This violated the principle of least privilege.

## Decision
1. Eradicated all `x-hackathon-user` and client header evaluations across `hackathonAuth.middleware.js`, `axios.js`, and Zustand stores.
2. Eradicated all universal test passwords, fallback bypasses, and auto-passwords from `hackathonAuth.controller.js`.
3. Authentication and role verification (`student`, `admin`, `mentor`, `reviewer`) are derived solely from cryptographically signed, HTTP-only server sessions stored in PostgreSQL or SQLite.
4. Added an Account Lockout mechanism that locks accounts after 5 failed login attempts for 15 minutes.

## Consequences
- Guaranteed zero-trust perimeter where clients cannot elevate privileges or impersonate administrators.
