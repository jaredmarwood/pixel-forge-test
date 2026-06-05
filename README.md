# Pixel Forge Test

> Build and ship a tiny browser game, market it, and get players

Scaffolded from `ts-fastify-react` by pyxs/theagent on 2026-06-05.

## Stack

- **Backend:** Fastify 5 + fastify-type-provider-zod + Zod 4
- **Frontend:** React 19 + Vite 8 (proxies `/api` to backend)
- **Type-checking:** TypeScript strict + noUncheckedIndexedAccess

## Run

```bash
yarn
yarn dev
```

- Frontend: <http://localhost:5173>
- Backend:  <http://localhost:3001> (try `/api/health` and `/api/greeting?name=you`)

## Test

```bash
yarn test
yarn typecheck
yarn lint
```

## What's not included on purpose

- Database (add Prisma when you need it — see [Marwood Prisma 7 reference](https://docs.marwood.au))
- Auth (add Google OAuth + magic link via `@fastify/oauth2` when you need it)
- Husky / lint-staged (add on first commit when the team agrees)

---
_Pyxs scaffolder template version 1._
