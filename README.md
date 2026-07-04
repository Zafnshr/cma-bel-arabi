# CMA Bel Arabi

Desktop-first Next.js learning workspace for Arabic-speaking CMA candidates who
already understand the accounting concepts in Arabic and need to master English
exam terminology.

## MVP Architecture

- `data/terms.md` stores the glossary in Markdown. Each term uses `## English
  Term`, a bold Arabic translation line, then the definition paragraph.
- `data/study-units.json` stores reading units.
- `data/mcqs.json` stores practice questions.
- `data/reading-pages.json` stores structured PDF-like pages. Each page contains
  sentence-level English text, Arabic translation, context, and related term IDs.
- `src/lib/content/*` parses local files on the server and can optionally fetch
  the same content shape from Supabase REST.
- `src/components/learning/*` contains the shared hover assist UI.
- `src/components/reader/*` contains the structured PDF-style sentence hover
  reader.
- `/api/content` exposes the same local content as JSON for future integrations.

## Platform Routes

- `/dashboard` Arabic dashboard with progress, units, and daily tasks.
- `/study/reader` structured PDF-style reader with sentence-level hover
  translation.
- `/study/flashcards` SRS-style CMA term flashcards.
- `/simulator` MCQ simulator with hover-assisted terminology panel.

The app shell is Arabic/RTL. English study content is isolated with LTR layout
classes so textbook text, MCQs, and flashcard fronts preserve English reading
direction.

## Visual Testing Artifacts

Browser verification screenshots are written to `screenshots/`:

- `latest-dashboard.png`
- `latest-pdf-hover.png`
- `latest-flashcards.png`
- `latest-simulator.png`

## Supabase Content Source

The app works with local files by default. To switch on Supabase, copy
`.env.example` to `.env.local`, fill in the project URL or REST URL and anon
key, then run the SQL in `supabase/schema.sql`.

Expected tables:

- `terms`
- `study_units`
- `mcqs`

`CONTENT_SOURCE=auto` tries Supabase when credentials are present and falls back
to local files if the request fails. Use `CONTENT_SOURCE=local` to force local
files during content editing.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.
