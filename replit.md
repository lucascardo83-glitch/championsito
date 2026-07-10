# Championsito ST 26

## Overview
Web app per un gioco a pronostici basato sulla UEFA Champions League. Ogni
partecipante sceglie 8 squadre (2 per ciascuna delle 4 fasce/pot) e
accumula punti in base ai risultati reali delle partite, calcolati
automaticamente lato server.

## Stack
- Monorepo pnpm.
- `artifacts/championsito`: frontend React + Vite + TypeScript + Tailwind
  (shadcn/ui, wouter per il routing, zustand per lo stato di auth admin,
  React Query via hook generati in `@workspace/api-client-react`).
- `artifacts/api-server`: backend Express condiviso (OpenAPI-first,
  validazione con `@workspace/api-zod`, Drizzle ORM su Postgres).
- Schema DB in `lib/db/src/schema/`: `teams` (con `potNumber` 1-4 invece di
  una tabella `Pots` separata), `participants`, `participant_teams`
  (join), `matches`.

## Punteggio
Punti per fascia in caso di vittoria/pareggio/sconfitta:
- Fascia 1: 2/1/0, Fascia 2: 4/2/0, Fascia 3: 6/3/0, Fascia 4: 8/4/0.
Calcolato server-side (`artifacts/api-server/src/lib/{scoring,gameData}.ts`)
a partire dai match registrati; nessun punteggio salvato in colonna, sempre
derivato al volo.

## Autenticazione admin
Password condivisa (secret `ADMIN_PASSWORD`). Login su `POST /api/auth/login`
restituisce un token HMAC firmato con `SESSION_SECRET` (stateless, 12h di
validità, vedi `artifacts/api-server/src/lib/adminAuth.ts`). Il frontend
salva il token e lo registra con `setAuthTokenGetter` di
`@workspace/api-client-react` così le mutation admin includono
automaticamente l'header Authorization.

## Dati di esempio
`pnpm --filter @workspace/scripts run seed:championsito` popola squadre
reali di Champions League 2025/26 per fascia, alcuni partecipanti e match
di esempio (esegue solo se il DB è vuoto).

## User preferences
Nessuna preferenza esplicita registrata finora oltre ai requisiti del
progetto (tema scuro blu/viola stile Champions League, niente emoji).
