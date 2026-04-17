import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import UploadNotes from '../components/UploadNotes'
import { applyTheme, getTheme, onThemeChange } from '../utils/theme'

function Upload() {
  const navigate = useNavigate()
  const [theme, setTheme] = useState(() => getTheme())
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => onThemeChange(setTheme), [])

  const infoCards = [
    {
      icon: 'TXT',
      title: 'Paste Text',
      description: 'Paste notes directly or upload .txt files.',
      accent: 'linear-gradient(135deg, rgba(56, 189, 248, 0.28), rgba(14, 116, 144, 0.2))',
    },
    {
      icon: 'PDF',
      title: 'PDF Support',
      description: 'Upload PDF files up to 30 pages for extraction.',
      accent: 'linear-gradient(135deg, rgba(251, 146, 60, 0.28), rgba(180, 83, 9, 0.2))',
    },
    {
      icon: 'AI',
      title: 'AI Processing',
      description: 'Topics and chapters are extracted automatically.',
      accent: 'linear-gradient(135deg, rgba(34, 197, 94, 0.28), rgba(22, 101, 52, 0.2))',
    },
  ]

  const tips = [
    'Use clear, well-formatted notes for better topic extraction.',
    'PDFs should be text-based (not scanned images).',
    'Include chapter or section headings for stronger structure.',
    'Longer, detailed notes usually improve extraction quality.',
    'Give your subject a meaningful name for quick search later.',
  ]

  return (
    <main
      className="min-h-screen"
      style={{
        background:
          'radial-gradient(80rem 40rem at 8% -10%, rgba(56,189,248,0.08), transparent 52%), radial-gradient(70rem 34rem at 96% -18%, rgba(16,185,129,0.08), transparent 45%), var(--surface-0)',
        color: 'var(--text-primary)',
        fontFamily: 'inherit',
      }}
    >
      <Navbar showSettingsHamburger onSettingsHamburgerClick={() => setDrawerOpen(true)} />

      <section className="mx-auto max-w-5xl px-4 pb-8 pt-12 sm:px-6">
        <div className="mb-8">
          <div className="rounded-2xl border border-white/10 bg-[linear-gradient(130deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-6 sm:p-8">
            <p className="mb-3 inline-flex rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-200">
              Smart Upload Flow
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Upload Notes</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
              Convert your notes into a structured learning path with AI-powered extraction and organized chapters.
            </p>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {infoCards.map((card) => (
            <article
              key={card.title}
              className="rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] p-5 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-[#888] hover:bg-[#0d0d0d]"
            >
              <div
                className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-[11px] font-bold tracking-wide text-slate-100"
                style={{ background: card.accent }}
              >
                {card.icon}
              </div>
              <h3 className="text-sm font-semibold text-white">{card.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">{card.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-8 sm:px-6">
        <div className="rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] p-2 shadow-[0_14px_50px_-30px_rgba(8,145,178,0.35)]">
          <UploadNotes />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-10 pt-2 sm:px-6">
        <div className="rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] p-6">
          <h2 className="text-base font-semibold text-white">Tips for Best Results</h2>
          <ul className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
            {tips.map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-sm text-slate-300">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-300" aria-hidden="true" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="border-t border-[#1a1a1a]">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-4 sm:px-6">
          <p className="flex items-center gap-2 text-[11px] text-slate-500">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" aria-hidden="true" />
            NoteQuest — Built for Nira Hackathon 2026
          </p>
          <p className="text-[11px] text-slate-500">Made with React + Groq AI</p>
        </div>
      </footer>

      {drawerOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close settings drawer overlay"
          />
          <aside
            id="settings-drawer"
            className="fixed right-0 top-0 z-50 h-full w-full max-w-sm border-l border-white/15 bg-[#0a0a0a] p-5 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="Additional settings"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Additional Settings</h2>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-300 transition hover:bg-white/10 hover:text-white"
                aria-label="Close settings drawer"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="mt-3 rounded-xl border border-white/15 bg-[#0d0d0d] p-3">
              <p className="text-sm font-semibold text-white">Theme</p>
              <div className="mt-3 inline-flex rounded-xl border border-[#888] bg-[#0d0d0d] p-1">
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    theme === 'dark' ? 'bg-indigo-500 text-white' : 'text-slate-200 hover:text-white'
                  }`}
                >
                  Dark
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    theme === 'light' ? 'bg-indigo-500 text-white' : 'text-slate-200 hover:text-white'
                  }`}
                >
                  Light
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setDrawerOpen(false)
                navigate('/leaderboard')
              }}
              className="mt-3 w-full rounded-xl border border-[#888] bg-[#0d0d0d] px-4 py-2.5 text-left font-semibold text-slate-100 transition hover:border-indigo-400"
            >
              Go to Leaderboard
            </button>
          </aside>
        </>
      )}
    </main>
  )
}

export default Upload
