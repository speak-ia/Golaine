# Conventions AgentIA

Ce document fixe les règles de structure et de nommage du dépôt. Toute contribution doit les respecter.

## Arborescence

- **`src/app/`** — Routes Next.js App Router uniquement (layouts, pages, API routes). Pas de logique métier volumineuse.
- **`src/features/<domaine>/`** — Une feature = un périmètre métier autonome (`components/`, `hooks/`, `services/`, `store/`, `types/`, `schemas/`, `constants.ts`, `index.ts`).
- **`src/shared/`** — Code transverse (UI shadcn, composants feedback, hooks, utils, services Supabase, types domaine global).
- **`src/config/`** — Configuration runtime (ex. `env.ts`).

### Alias TypeScript

| Alias | Cible |
|-------|--------|
| `@/*` | `./src/*` (héritage, à préférer `@shared/*` / `@features/*` pour le nouveau code) |
| `@shared/*` | `./src/shared/*` |
| `@features/*` | `./src/features/*` |

## Fichiers

| Type | Convention | Exemple |
|------|--------------|---------|
| Composants React | PascalCase | `UserCard.tsx` |
| Hooks | camelCase, préfixe `use` | `useUserData.ts` |
| Services | camelCase, suffixe `Service` | `userService.ts` |
| Utilitaires | camelCase | `formatDate.ts` |
| Types / interfaces (fichier) | PascalCase, suffixe `Types` si agrégat | `UserTypes.ts`, `domainTypes.ts` |
| Fichier de constantes exportées | camelCase | `apiEndpoints.ts` |
| Stores Zustand | camelCase, suffixe `Store` | `productStore.ts` |
| Tests | même base + `.test.ts(x)` | `UserCard.test.tsx` |

### Dossiers

- Segments de route Next : **kebab-case** (`mes-produits`, `rapport-hebdo`).
- Sous `features/` et `shared/` : noms de dossiers en **minuscules** (`components`, `hooks`, `services`).

## Code

| Élément | Convention |
|---------|--------------|
| Variables, fonctions | `camelCase` |
| Constantes runtime | `UPPER_SNAKE_CASE` |
| Classes, interfaces, types, enums | `PascalCase` |
| Valeurs d’enum | `UPPER_SNAKE_CASE` (ex. `UserRole.SUPER_ADMIN`) |
| Booléens | `is*`, `has*`, `can*` |
| Handlers d’événements | `handle*` |
| Fonctions booléennes | `is*`, `has*` (ex. `isValidEmail`) |

## Imports

- Préférer `@shared/...` et `@features/...` pour tout nouveau fichier.
- Ne pas importer une feature depuis une autre feature sans passer par un contrat explicite (`index.ts` public ou service partagé).

## Git / Windows

- Utiliser des chemins **forward slash** dans le code et les imports.
- Éviter les doublons d’indexation `src\foo` vs `src/foo` : `core.autocrlf` cohérent avec l’équipe, pas de `git add` de chemins avec backslash.

## Hors périmètre implicite

- Régénération massive des composants shadcn sous `shared/components/ui/` : hors refonte structurelle courante.
- Correction exhaustive des warnings ESLint : chantier séparé.
