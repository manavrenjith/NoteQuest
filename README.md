# NoteQuest

[![React](https://img.shields.io/badge/React-19-20232A?logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Groq](https://img.shields.io/badge/AI-Groq-111111)](https://groq.com/)
[![Supabase](https://img.shields.io/badge/Database-Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)


NoteQuest is an AI-powered study tracker that turns raw notes into structured subjects, chapters, and topics, then gamifies progress with XP, streaks, quizzes, revision reminders, and a leaderboard.

This project is currently a demo.

Any AI API is compatible, but Groq is used in this demo.

Originally started as an entry for a  Hackathon 2026; the hackathon listing was later removed on Devpost, and development has continued here as a demo using React + Vite.

## Features

- AI topic extraction from pasted notes or uploaded files.
- Upload support for `.txt` and text-based `.pdf` files (up to first 30 pages extracted).
- Subject dashboard with topic completion, progress tracking, and learning roadmaps.
- Gamification: XP, levels, streaks, completion rewards, and badges.
- Daily AI challenge and smart revision suggestions.
- Chapter-based quiz generation with XP rewards.
- Study analytics (heatmap, velocity trends, completion estimates).
- Optional Supabase-powered global leaderboard.
- Light/dark theme support with persisted preference.

## Tech Stack

- React 19 + React Router 7
- Vite 8
- Tailwind CSS
- Groq API (`groq-sdk`) for AI extraction, tips, and quiz generation
- Supabase (`@supabase/supabase-js`) for leaderboard storage
- `pdfjs-dist` for PDF text extraction
- `localStorage` for local app data persistence

## Project Structure

```text
src/
	components/
		UploadNotes.jsx
		TopicBoard.jsx
		ProgressBar.jsx
		Roadmap.jsx
		SmartRevision.jsx
		DailyChallenge.jsx
		StudyHeatmap.jsx
		VelocityChart.jsx
		Leaderboard.jsx
		...
	hooks/
		useToast.js
	pages/
		Home.jsx
		Upload.jsx
		Dashboard.jsx
		SubjectDetail.jsx
		Quiz.jsx
		LeaderboardPage.jsx
		Notes.jsx
		Settings.jsx
		profile.jsx
	utils/
		gemini.js
		storage.js
		supabase.js
		theme.js
	App.jsx
	main.jsx
```

## Getting Started

### 1. Prerequisites

- Node.js 18+
- npm 9+

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in the values:

```env
VITE_GROQ_API_KEY=your_groq_api_key_here
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Notes:
- `VITE_GROQ_API_KEY` is required for AI features (topic extraction, quiz generation, study tips, daily challenge).
- Supabase variables are only required if you want leaderboard sync.

### 4. Run the app

```bash
npm run dev
```

Open the local URL shown by Vite (usually `http://localhost:5173`).

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Leaderboard Setup (Supabase)

If you want the online leaderboard, create a `leaderboard` table in Supabase.

Example SQL:

```sql
create table if not exists leaderboard (
	id bigint generated always as identity primary key,
	username text not null unique,
	xp integer not null default 0,
	level text not null default 'Novice',
	subjects_count integer not null default 0,
	topics_completed integer not null default 0,
	streak integer not null default 0,
	updated_at timestamptz not null default now()
);
```

Then enable read/write policies suitable for your project environment.

## How Data Is Stored

- Core progress and app state are stored in browser `localStorage`.
- Leaderboard data is stored in Supabase when configured.
- Theme preference is persisted and synced across open tabs.

## AI Workflow

1. User uploads notes (text or PDF) in Upload.
2. Notes are sent to Groq (`llama-3.3-70b-versatile`) to produce structured JSON.
3. Parsed subjects/chapters/topics are saved locally.
4. Dashboard and subject pages drive progress, XP, revision plans, and analytics.

## Build and Deployment

### Production build

```bash
npm run build
```

The production output is generated in `dist/`.

### Vercel

This repository includes `vercel.json` and is ready for Vercel deployment.

## Troubleshooting

- AI extraction fails:
	- Confirm `VITE_GROQ_API_KEY` is set correctly.
	- Check API quota/rate limits.
- PDF upload returns no text:
	- Use text-based PDFs (not scanned images).
	- Very large PDFs are truncated to first 30 pages.
- Leaderboard errors:
	- Verify Supabase URL/key and table schema.
	- Ensure your table permissions/policies allow expected operations.

## License

No license is currently specified in this repository.
