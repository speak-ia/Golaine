# AgentIA (Golaine)

Application Next.js (App Router) pour la plateforme SaaS **Golaine** : dashboard, agents IA, contacts, commandes, etc.

## Scripts

| Commande | Description |
|------------|-------------|
| `npm run dev` | Serveur de développement (port 3000) |
| `npm run build` | Build production (standalone) |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm run test` | Vitest |
| `npm run e2e` | Playwright |

## Structure `src/`

```
src/
├── app/                 # Routes Next.js uniquement (layouts, pages, API)
├── features/            # Domaines métier (auth, dashboard, orders, …)
│   └── <feature>/
│       ├── components/  # Pages et UI métier
│       ├── hooks/
│       ├── services/    # mock / supabase (stubs)
│       ├── store/       # Zustand local à la feature
│       ├── schemas/     # Zod
│       ├── types/
│       └── index.ts     # Exports publics
├── shared/              # Transverse
│   ├── components/ui/   # shadcn / Radix
│   ├── components/feedback/
│   ├── hooks/
│   ├── utils/
│   ├── constants/
│   ├── services/supabase/
│   └── types/
├── config/              # env.ts
└── middleware.ts
```

Alias TypeScript : `@/*`, `@shared/*`, `@features/*` (voir [CONVENTIONS.md](./CONVENTIONS.md)).

## CI

Le workflow GitHub Actions exécute `npm ci`, lint, typecheck, tests unitaires, build et e2e (voir `.github/workflows/ci.yml`).
