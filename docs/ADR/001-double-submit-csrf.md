# ADR 001: Double-Submit Cookie CSRF Protection with Self-Healing Interceptor

## Context
The AICTE IDEA Lab portal handles sensitive operations including team creation, payment slip uploads, submissions, and administrative controls. Since cookies are used for session tracking, cross-site request forgery (CSRF) posed a potential vulnerability if mutating endpoints were not strictly validated.

## Decision
We implemented a zero-dependency double-submit cookie architecture:
1. The server sets a non-HttpOnly `XSRF-TOKEN` cookie alongside the HttpOnly `connect.sid` session cookie.
2. The frontend Axios client reads `XSRF-TOKEN` and injects it into every mutating request via the `x-csrf-token` header.
3. The server compares both tokens using `crypto.timingSafeEqual` to avoid timing side-channel attacks.
4. If a token becomes invalid or expires, the client transparently fetches a new token from `/api/csrf-token` and retries the failed request once before presenting any error to the user.

## Consequences
- Protects against all cross-site post and put attacks without requiring server-side token state in memory.
- Completely seamless user experience due to the self-healing retry interceptor.
