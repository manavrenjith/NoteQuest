import UploadNotes from '../components/UploadNotes'
import Navbar from '../components/Navbar'
import { useEffect } from 'react'

function Home() {
  useEffect(() => {
    if (window.location.hash === '#upload') {
      window.setTimeout(() => {
        const uploadSection = document.getElementById('upload')
        uploadSection?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    }
  }, [])

  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId)
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar />

      <section className="relative isolate overflow-hidden px-4 pb-24 pt-20 sm:pt-24">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.35),transparent_35%),radial-gradient(circle_at_75%_30%,rgba(168,85,247,0.28),transparent_40%),linear-gradient(120deg,#0f172a_0%,#1e1b4b_40%,#111827_100%)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 animate-[pulse_8s_ease-in-out_infinite] bg-gradient-to-tr from-indigo-500/10 via-purple-500/15 to-transparent" />

        <div className="mx-auto flex min-h-[78vh] w-full max-w-6xl flex-col items-center justify-center text-center">
          <span className="mb-6 inline-flex items-center rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-1.5 text-sm font-semibold text-indigo-200">
            AI-Powered Learning Tracker
          </span>
          <h1 className="max-w-4xl text-4xl font-black leading-tight text-white sm:text-6xl lg:text-7xl">
            Turn Your Notes Into a Learning Adventure
          </h1>
          <p className="mt-6 max-w-2xl text-base text-slate-200 sm:text-lg">
            Upload your notes, let AI map your syllabus, and level up as you learn.
          </p>
          <div className="mt-10 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={() => scrollToSection('upload')}
              className="w-full rounded-xl bg-indigo-500 px-6 py-3 font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 sm:w-auto"
            >
              Get Started {'->'}
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className="w-full rounded-xl border border-slate-500 bg-slate-900/40 px-6 py-3 font-semibold text-slate-100 transition hover:border-indigo-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 sm:w-auto"
            >
              See Demo ↓
            </button>
          </div>
        </div>
      </section>

      <section id="features" className="px-4 pb-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Why NoteQuest</h2>
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-slate-700 bg-slate-800/85 p-6 shadow-lg shadow-black/20">
              <h3 className="text-lg font-bold text-white">🤖 AI Topic Extraction</h3>
              <p className="mt-3 text-sm text-slate-300">
                Gemini reads your notes and builds your syllabus automatically.
              </p>
            </article>
            <article className="rounded-2xl border border-slate-700 bg-slate-800/85 p-6 shadow-lg shadow-black/20">
              <h3 className="text-lg font-bold text-white">🎮 Gamified Progress</h3>
              <p className="mt-3 text-sm text-slate-300">
                Earn XP, level up, and maintain streaks as you study.
              </p>
            </article>
            <article className="rounded-2xl border border-slate-700 bg-slate-800/85 p-6 shadow-lg shadow-black/20">
              <h3 className="text-lg font-bold text-white">📊 Track Everything</h3>
              <p className="mt-3 text-sm text-slate-300">
                See exactly how much of your syllabus you have covered.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section id="upload" className="px-4 pb-16">
        <div className="mx-auto max-w-4xl">
          <header className="mb-6 text-center">
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-5xl">Upload Your Notes</h2>
            <p className="mt-3 text-base text-slate-300">Start a subject and generate topics with AI in seconds.</p>
          </header>
          <UploadNotes />
        </div>
      </section>
    </main>
  )
}

export default Home
