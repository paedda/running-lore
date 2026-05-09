# Running Lore

Race report generator: users enter race data + personal notes, pick a tone, and get a blog-ready markdown report powered by Claude.

## Project structure

npm workspaces monorepo with 3 packages:

```
packages/
  shared/    # TypeScript interfaces and constants (ActivityData, ReportTone, etc.)
  server/    # Express API + Anthropic SDK (port 3001)
  client/    # React 19 + Vite frontend (port 5173, proxies /api to server)
```

## Commands

```bash
# Install dependencies
npm install

# Build shared types (must run first after fresh clone)
npm run build -w packages/shared

# Run both server and client in dev mode
npm run dev

# Run all tests
npm test

# Build everything for production
npm run build

# Type-check individual packages
npx tsc -b packages/shared
npx tsc -b packages/server
npx tsc -b packages/client
```

## Environment

Requires a `.env` file in the project root (see `.env.example`):

```
ANTHROPIC_API_KEY=your-key
PORT=3001
```

## Key files

- `packages/shared/src/index.ts` - all shared types and the REPORT_TONES constant
- `packages/server/src/services/reportGenerator.ts` - Claude prompt + API call
- `packages/server/src/validation.ts` - Zod schemas for request validation
- `packages/server/src/routes/report.ts` - POST /api/report/generate endpoint
- `packages/client/src/App.tsx` - main app component, wires up form state
- `packages/client/src/hooks/useReport.ts` - fetch hook for report generation

## Conventions

- TypeScript strict mode across all packages
- No linter or formatter configured yet -- keep style consistent with existing code
- CSS: plain CSS files per component, no CSS modules or framework. Uses CSS custom properties defined in `styles.css`
- Components are function components, no default exports except route modules
- Server uses Zod for request validation at the API boundary
- Shared package must be built before server or client can reference its types
- Never use em dashes in generated reports (enforced in the system prompt)

## API

Single endpoint: `POST /api/report/generate`

Request body validated by Zod schema in `validation.ts`. Returns `{ title, report }` on success, `{ error }` on failure.
