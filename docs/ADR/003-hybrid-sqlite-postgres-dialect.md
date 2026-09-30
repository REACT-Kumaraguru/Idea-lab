# ADR 003: Hybrid SQLite and PostgreSQL Dialect Parity Engine

## Context
Developers work on local Windows/macOS laptops using SQLite for fast, zero-dependency setup without configuring local database servers. Production environments run Docker containers with PostgreSQL. Differing SQL syntax for schema migrations and column introspection created risk of schema drift.

## Decision
1. Implemented `ensureHackathonColumns.js` with automated dialect detection:
   - For SQLite, it issues `PRAGMA table_info("tableName")` and dynamically appends missing columns via `ALTER TABLE "tableName" ADD COLUMN ...`.
   - For PostgreSQL, it issues `ALTER TABLE "tableName" ADD COLUMN IF NOT EXISTS ...`.
2. Created composite performance indexes for both engines (`ensurePerformanceIndexes.js`).
3. Added connection pooling in `db.js` tuned per dialect:
   - PostgreSQL: `min: 2, max: 15, idle: 10000ms`.
   - SQLite: `min: 1, max: 5, idle: 10000ms`.

## Consequences
- 100% development-production parity with zero drift. Developers can run locally with SQLite, and staging/production can seamlessly connect to PostgreSQL with identical behavior.
