---
paths:
  - "motomap-contributor/**/*.{ts,tsx}"
  - "motomap-app/**/*.{ts,tsx}"
---

# Frontend Conventions (TypeScript / React)

- No `any` — use `unknown` and narrow, or define proper types
- All API calls go through `lib/api.ts` — never `fetch()` directly in components
- Use TanStack Query for all server state — no `useEffect` + `useState` for data fetching
- Form validation: React Hook Form + Zod schema — no manual validation logic
- Risk level badge colors: SAFE=#16a34a, CAUTION=#d97706, STOP=#dc2626 — never deviate
- Loading states required on every async action
- Error boundaries required on every page
- Mobile: test on Android emulator before marking complete
