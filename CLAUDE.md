# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

An open-source reference website for the board game **Ark Nova**. Players can browse, filter, and rate cards (Animal, Sponsor, Endgame, Project, Action), view maps, generate game setups, and take daily quizzes. It is a Next.js 13 (Pages Router) app with i18n, Clerk auth, Prisma + PostgreSQL, and Tailwind/shadcn UI.

## Commands

```bash
pnpm dev           # start dev server
pnpm build         # production build (runs next-sitemap postbuild)
pnpm lint          # biome check src (reports issues)
pnpm lint:fix      # biome check --write src (auto-fix)
pnpm typecheck     # tsc --noEmit
pnpm test          # jest (all tests)
pnpm test:watch    # jest --watch
pnpm format        # biome format --write .
```

Run a single test file:
```bash
pnpm jest src/lib/__tests__/helper.test.ts
```

## Architecture

### Data layer (`src/data/`)

All game card data is **static TypeScript files** — no API calls needed to render cards. Key files:

- `Animals.ts` — `AnimalsData: AnimalCard[]` (the full animal card catalogue)
- `Sponsors.ts` — sponsor cards
- `Projects.ts` / `ProjectBonuses.ts` — conservation project cards and bonus tokens
- `EndGames.ts` — end-game scoring cards
- `ActionCards.ts` / `ActionCardDescriptions.ts` — action card data and i18n descriptions
- `MapBoards.ts` / `AlternativeMapBoards.ts` — zoo map boards
- `Models.ts` — numeric scoring weights (CONSERVATION_POINT=9, APPEAL=3, REPUTATION=4)

The `src/data/prehistoric/` subfolder holds fan-made / Prehistoric expansion data.

### Card type system (`src/types/`)

The union type `Card = AnimalCard | SponsorCard | ProjectCard | EndGameCard` drives the whole app. Each subtype has a corresponding interface and Zod schema. Type guards (`isAnimalCard`, `isSponsorCard`, etc.) are in `src/types/Card.ts`.

`KeyWord` (in `src/types/KeyWords.ts`) is a **class with static instances** — each keyword carries an icon name, i18n description key, a numeric `model` value, and an optional `multiply` flag used by the value calculator. `Ability` pairs a `KeyWord` with a count.

`CardSource` enum (`src/types/CardSource.ts`) controls which expansion a card belongs to (`Base`, `Marine World`, `Promo`, `Fan Made`, `Alternative`, `Beginner`). Fan-made content is gated by `?fan=1` query param on the home page.

### Card value model (`src/utils/GetAnimalCardModel.ts`)

`getAnimalCardModel(animal)` computes an `AnimalCardModel` — total value, cost, and `diff` (value minus cost) — used to sort/display card strength. The formula: `total = reputation + appeal + conservationPoint + sumAbilityValues`, `cost = price + actualSize * 2`.

### Filtering & sorting

Client-side only. The home page (`src/pages/index.tsx`) holds all filter state and passes it down to `AnimalCardList` / `SponsorCardList`. The filter utilities live in `src/utils/filter.ts`. Text search matches card name and translated description.

### Game setup generator (`src/utils/setup.ts`)

`GameSetupGenerator` uses the `seedrandom` library so the same seed always produces the same setup. Takes a `GameConfig` (player count, card sources, map sources) and distributes shuffled card IDs to players. This powers the `/diy` (DIY setup) and `/quizzes` pages.

### Rendering pipeline for cards

```
src/data/*.ts  →  AnimalCardList / SponsorCardList
                   ↓ (filtered & sorted)
               RatedAnimalCard / (sponsor equivalent)
                   ↓
               BaseAnimalCard  (pixel-accurate card layout via arknova.css)
                   ↓ (abilities section)
               src/components/abilities/ + src/components/icons/
```

Card visual appearance is locked to `src/styles/arknova.css`. **Do not add Tailwind classes directly to card components** — the game-accurate styling is done through arknova-specific CSS classes.

### Internationalization

`next-i18next` with `react-i18next`. Translations live in `public/locales/{en,zh-CN,de,pt,tr}/common.json`. To extract new keys run `pnpm translate`. Default locale is `zh-CN`. All pages use `getStaticProps` with `serverSideTranslations`.

Card name translations are keyed by the card's `name` field (uppercase). Ability descriptions use keys from `KeyWord.descriptionTemplate` (e.g. `abilities.clever_description`).

### API routes (`src/pages/api/`)

Thin wrappers around Prisma queries:
- `/api/cards/ratings` — aggregate star ratings per card
- `/api/comments/*` — CRUD for user comments (Clerk auth required)
- `/api/quiz/*` — daily quiz creation, submission, leaderboard

Ratings and comments are the only persistent data; all card catalogue data is static.

### Authentication

Clerk (`@clerk/nextjs`). Auth state is available via `useUser()` / `useAuth()` from Clerk. Only needed for commenting and rating. The Clerk provider wraps the whole app in `_app.tsx`.

### Styling conventions

- Semantic tokens: `bg-background`, `text-foreground`, `bg-primary`, `border-border` — not hardcoded colors
- Sage-tinted neutrals (`bg-sage-50`, `bg-sage-950`, etc.) for all non-card UI
- Floating panels: `backdrop-blur-md` + gradient backgrounds + subtle ring borders (glass-morphism pattern)
- Dark mode via `next-themes` with `attribute='class'`
- shadcn `Button` (`@/components/ui/button`) for all interactive buttons

### UI component library

shadcn/ui components are in `src/components/ui/`. Configured via `components.json`. Radix UI primitives underpin them. New UI primitives should follow the shadcn pattern.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=   # Clerk auth
CLERK_SECRET_KEY=
DATABASE_URL=                        # PostgreSQL (Prisma)
DATABASE_URL_UNPOOLED=
```

## Key Constraints from AGENTS.md

1. Never modify game card styles — Animal, Sponsor, Endgame, Project, and Action card components have their own domain-specific styling via `arknova.css`
2. Use semantic tokens — prefer `bg-background`, `text-foreground`, `bg-primary`, `border-border` over hardcoded color values
3. Maintain glass-morphism — floating panels use `backdrop-blur-md` + gradient backgrounds + subtle ring borders
4. Respect the neutral shift — use sage-tinted neutrals, not pure grays, for all non-card UI
5. Keep accessibility — maintain sufficient contrast ratios in both light and dark modes
6. Use shadcn Button consistently — prefer `@/components/ui/button` for clickable button interactions
