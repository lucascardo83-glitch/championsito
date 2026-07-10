---
name: Championsito ST 26 pot model
description: How UEFA Champions League "fasce" (pots) are modeled in the DB and scoring logic.
---

Pots (fasce 1-4) are a `potNumber` integer column directly on the `teams`
table, not a separate `Pots` table.

**Why:** simpler schema, and pot assignment is a property of the team for
a given season rather than an independent entity with its own lifecycle.

**How to apply:** when extending scoring, standings, or team management
features, read/write `potNumber` on `teams` directly. Points-per-outcome
tables are keyed by this same `potNumber` (1-4).
