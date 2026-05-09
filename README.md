# Running Lore

Every race has a story. Even the ugly ones.

Turn your race data and personal notes into a blog-ready race report, powered by Claude.

## Project Structure

```
running-lore/
├── CLAUDE.md                 # Project docs for Claude Code
├── README.md                 # Project docs for humans
├── package.json              # Root workspace config, ties everything together
├── package-lock.json         # Dependency lockfile
├── tsconfig.base.json        # Shared TypeScript settings inherited by all packages
├── vitest.config.ts          # Test runner config (defines server + client projects)
├── .env.example              # Template for API key + port
├── .gitignore                # Ignores node_modules, dist, .env, tsbuildinfo
│
└── packages/
    ├── shared/               # THE GLUE -- types both sides agree on
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── src/
    │       └── index.ts      # ActivityData, ReportRequest, ReportResponse, ReportTone, REPORT_TONES
    │
    ├── server/               # EXPRESS API -- takes form data, calls Claude, returns report
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── src/
    │       ├── server.ts              # Express app setup, CORS, routes, health check
    │       ├── validation.ts          # Zod schemas for request validation
    │       ├── validation.test.ts
    │       ├── routes/
    │       │   └── report.ts          # POST /api/report/generate endpoint
    │       └── services/
    │           ├── reportGenerator.ts      # System prompt, buildPrompt(), parseResponse(), Claude API call
    │           └── reportGenerator.test.ts
    │
    └── client/               # REACT FRONTEND -- the form UI + rendered report
        ├── package.json
        ├── tsconfig.json
        ├── vite.config.ts             # Vite dev server + proxy /api -> localhost:3001
        ├── index.html                 # Entry HTML (loads fonts, mounts React)
        └── src/
            ├── main.tsx               # React root render
            ├── App.tsx                # Main component, wires state between child components
            ├── App.css                # Layout, generate button, loading spinner
            ├── styles.css             # CSS reset, variables (colors, fonts), utility classes
            ├── test-setup.ts          # jest-dom matchers + cleanup for tests
            ├── hooks/
            │   ├── useReport.ts       # Fetch hook: POST to API, manages loading/result/error
            │   └── useReport.test.ts
            └── components/
                ├── ActivityForm.tsx    # Race data inputs (name, date, distance, pace, etc.)
                ├── ActivityForm.test.tsx
                ├── NotesEditor.tsx     # Add/remove bullet-point notes
                ├── NotesEditor.css
                ├── NotesEditor.test.tsx
                ├── ToneSelector.tsx    # Pick one of 4 report tones
                ├── ToneSelector.css
                ├── ToneSelector.test.tsx
                ├── ReportOutput.tsx    # Renders markdown report + copy button
                ├── ReportOutput.css
                └── ReportOutput.test.tsx
```

### Data Flow

1. **Client** -- user fills out ActivityForm, adds notes in NotesEditor, picks a tone in ToneSelector, clicks Generate
2. **useReport hook** -- POSTs `{ activity, notes, tone }` to `/api/report/generate` (Vite proxies this to port 3001)
3. **Server route** (`routes/report.ts`) -- validates the request body with Zod
4. **reportGenerator** -- builds a prompt from the data, sends it to Claude, parses the H1 title out of the markdown response
5. **Back to client** -- ReportOutput renders the markdown and offers a "Copy Markdown" button

### Why Three Packages?

The shared package is the contract. If you change `ActivityData` there, TypeScript will catch mismatches in both the server and client at build time. It prevents the two sides from drifting apart.

## Quick Start

```bash
# Install all dependencies
npm install

# Build shared types (needed first)
npm run build -w packages/shared

# Set up your API key
cp .env.example .env
# Edit .env and add your Anthropic API key

# Run both server and client in dev mode
npm run dev
```

The client runs at `http://localhost:5173` with an API proxy to the server at `http://localhost:3001`.

## How It Works

1. Enter your race data (name, distance, time, pace, splits, etc.)
2. Add bullet-point notes about your experience
3. Pick a tone (celebratory, honest, training-log, or storytelling)
4. Hit Generate and get a markdown race report ready for your blog
5. Copy the markdown and paste it into WordPress/your blog

## Tech Stack

- **Monorepo:** npm workspaces
- **Shared:** TypeScript interfaces and constants
- **Server:** Express, TypeScript, Zod validation, Anthropic SDK (Claude Sonnet)
- **Client:** React 19, TypeScript, Vite, react-markdown

## API

`POST /api/report/generate`

```json
{
  "activity": {
    "raceName": "2025 Colfax Marathon",
    "date": "2025-05-18",
    "distance": "26.2 miles",
    "finishTime": "3:42:15",
    "averagePace": "8:28/mi",
    "splits": "Mile 1: 8:15, Mile 2: 8:22...",
    "heartRate": "Avg 162, Max 178",
    "elevation": "+1,200 ft",
    "weather": "55°F, overcast",
    "course": "Hilly first half, flat finish"
  },
  "notes": [
    "Went out too fast on mile 3",
    "Cramp at mile 18 but worked through it",
    "New PR by 4 minutes"
  ],
  "tone": "storytelling"
}
```

## Tests

Run the full suite with:

```bash
npm test
```

49 tests across 7 files using [Vitest](https://vitest.dev/) and [@testing-library/react](https://testing-library.com/).

### Server

**`validation.test.ts`** -- Zod schema coverage
- Accepts valid activity with required fields only (optional fields default to `''`)
- Accepts valid activity with all optional fields populated
- Rejects missing or empty required fields (`raceName`, `date`, `distance`, `finishTime`, `averagePace`)
- Accepts all four tone values; rejects unknown tones
- Accepts notes array; applies default empty array when omitted
- Rejects missing or malformed activity objects

**`reportGenerator.test.ts`** -- Prompt building and response parsing
- `buildPrompt()` includes all required activity fields in the output
- `buildPrompt()` omits optional fields when not provided, includes them when present
- `buildPrompt()` formats notes as bullet points with the correct header
- `buildPrompt()` injects the correct tone guide for each of the four tones
- `parseResponse()` extracts the title from the H1 heading and strips it from the body
- `parseResponse()` defaults title to `"Race Report"` when no H1 is found
- `parseResponse()` does not treat `##` subheadings as the title

### Client

**`useReport.test.ts`** -- Fetch hook behaviour
- Starts with `result: null`, `error: null`, `loading: false`
- Sets `loading: true` while the request is in flight, `false` when done
- Sets `result` on a successful 2xx response
- Sets `error` from the response body on a non-2xx response
- Sets `error` on a network failure
- POSTs to `/api/report/generate` with `Content-Type: application/json`
- Clears previous result and error at the start of each new generation

**`ActivityForm.test.tsx`** -- Race data form
- Renders all 10 input fields (required and optional)
- Displays current activity values passed via props
- Calls `onChange` with the updated activity object on field input

**`NotesEditor.test.tsx`** -- Bullet-point notes
- Renders the text input and Add button
- Displays existing notes passed via props
- Adds a note on button click or Enter key
- Ignores clicks/Enter when the input is empty
- Removes a note by index when the remove button is clicked

**`ToneSelector.test.tsx`** -- Tone picker
- Renders all four tone options
- Applies `active` class to the currently selected tone only
- Calls `onChange` with the correct tone value on click

**`ReportOutput.test.tsx`** -- Report display
- Renders the report title
- Renders markdown body content (headers, bold, paragraphs)
- Shows a Copy Markdown button
- Clicking Copy writes the full markdown (with H1 prepended) to the clipboard and shows "Copied!"

## Next Steps

- [ ] Strava OAuth integration (auto-pull activity data)
- [ ] SQLite/Postgres for race history
- [ ] Style training from past blog posts
- [ ] WordPress publishing integration
- [ ] Weather API enrichment by date/location
- [ ] User accounts and subscription billing
