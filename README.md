# NoteQuest

NoteQuest is a React app that transforms raw study notes into a structured, checklist-style syllabus tracker using the Gemini API.

## Tech Stack

- React (Vite)
- Tailwind CSS
- Gemini API via `@google/generative-ai`
- `localStorage` for persistence
- Lucide React icons

## Project Structure

```
src/
├── components/
│   ├── UploadNotes.jsx
│   ├── TopicBoard.jsx
│   └── ProgressBar.jsx
├── pages/
│   ├── Home.jsx
│   └── Dashboard.jsx
├── utils/
│   ├── gemini.js
│   └── storage.js
├── App.jsx
└── main.jsx
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables:

```bash
cp .env.example .env
```

Then add your Gemini API key to `.env`:

```bash
VITE_GEMINI_API_KEY=your_actual_key
```

3. Start development server:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
```

## How It Works

1. Add a subject name and paste or upload `.txt` notes.
2. Click **Extract Topics** to call Gemini.
3. Gemini returns a JSON syllabus with chapters and topics.
4. The result is saved to `localStorage` under `notequest_subjects`.
5. Track completion from the dashboard with topic checkboxes and progress bars.
