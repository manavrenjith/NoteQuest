import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import UploadNotes from '../components/UploadNotes'

function useReveal(delay) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), delay)
    return () => window.clearTimeout(timer)
  }, [delay])

  return {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(12px)',
    transition: 'opacity 0.5s ease, transform 0.5s ease',
  }
}

function Home() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const tagReveal = useReveal(0)
  const headingReveal = useReveal(100)
  const subtextReveal = useReveal(200)
  const ctaReveal = useReveal(300)
  const cardReveal = useReveal(400)

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth'

    const onScroll = () => {
      setIsScrolled(window.scrollY > 6)
    }

    onScroll()
    window.addEventListener('scroll', onScroll)

    return () => {
      window.removeEventListener('scroll', onScroll)
      document.documentElement.style.scrollBehavior = ''
    }
  }, [])

  const goToSection = (id) => {
    const node = document.getElementById(id)
    if (node) {
      node.scrollIntoView({ block: 'start' })
      setMenuOpen(false)
    }
  }

  const featureCards = useMemo(
    () => [
      {
        iconBg: '#EEEDFE',
        emoji: '🤖',
        title: 'AI topic extraction',
        description:
          'Paste any notes and AI automatically builds a structured syllabus with chapters and topics.',
      },
      {
        iconBg: '#EAF3DE',
        emoji: '🎮',
        title: 'Gamified progress',
        description:
          'Earn XP, level up from Novice to Master, and maintain daily streaks as you complete topics.',
      },
      {
        iconBg: '#FAEEDA',
        emoji: '📊',
        title: 'Syllabus tracking',
        description:
          "See exactly how much of each subject you've covered with real-time progress bars.",
      },
    ],
    [],
  )

  const howItWorks = useMemo(
    () => [
      {
        step: '1',
        title: 'Upload your notes',
        description: 'Paste text or upload a .txt file of your study notes for any subject.',
      },
      {
        step: '2',
        title: 'AI builds your syllabus',
        description: 'Groq AI reads your notes and extracts all topics organised by chapter.',
      },
      {
        step: '3',
        title: 'Level up as you learn',
        description: 'Check off topics, earn XP, and watch your syllabus completion grow.',
      },
    ],
    [],
  )

  return (
    <main className="min-h-screen bg-slate-900 text-white">
      <header
        className={`sticky top-0 z-30 bg-slate-900/95 backdrop-blur ${
          isScrolled ? 'border-b border-slate-800 shadow-sm' : 'border-b border-transparent'
        }`}
      >
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-4">
          <button type="button" onClick={() => goToSection('top')} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: '#7F77DD' }} aria-hidden="true" />
            <span style={{ fontSize: '15px', fontWeight: 500 }} className="text-white">
              NoteQuest
            </span>
          </button>

          <nav className="hidden items-center gap-5 md:flex">
            <button
              type="button"
              onClick={() => goToSection('how-it-works')}
              className="text-sm text-slate-400 transition hover:text-white"
            >
              How it works
            </button>
            <button
              type="button"
              onClick={() => goToSection('features')}
              className="text-sm text-slate-400 transition hover:text-white"
            >
              Features
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-white transition hover:border-slate-600"
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => goToSection('upload')}
              className="rounded-lg px-3 py-1.5 text-sm text-white transition hover:opacity-90"
              style={{ backgroundColor: '#7F77DD' }}
            >
              Get started
            </button>
          </nav>

          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-slate-300 md:hidden"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className="text-lg">☰</span>
          </button>
        </div>

        {menuOpen ? (
          <div className="border-t border-slate-800 px-6 pb-4 pt-3 md:hidden">
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => goToSection('how-it-works')}
                className="rounded-lg px-2 py-2 text-left text-sm text-slate-300 transition hover:bg-slate-800"
              >
                How it works
              </button>
              <button
                type="button"
                onClick={() => goToSection('features')}
                className="rounded-lg px-2 py-2 text-left text-sm text-slate-300 transition hover:bg-slate-800"
              >
                Features
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  navigate('/dashboard')
                }}
                className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-white"
              >
                Dashboard
              </button>
              <button
                type="button"
                onClick={() => goToSection('upload')}
                className="rounded-lg px-3 py-2 text-sm text-white"
                style={{ backgroundColor: '#7F77DD' }}
              >
                Get started
              </button>
            </div>
          </div>
        ) : null}
      </header>

      <section id="top" className="mx-auto w-full max-w-4xl px-6 py-10 md:py-16">
        <div className="mx-auto max-w-xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5" style={{ ...tagReveal, backgroundColor: '#EEEDFE', color: '#534AB7' }}>
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: '#7F77DD' }} aria-hidden="true" />
            <span className="text-xs font-medium">AI-powered learning tracker</span>
          </div>

          <h1 className="mx-auto mt-5 max-w-md text-3xl font-medium leading-tight text-white" style={headingReveal}>
            Turn your notes into
            <br />
            a learning adventure
          </h1>

          <p className="mx-auto mt-4 max-w-sm text-[15px] text-slate-400" style={subtextReveal}>
            Upload your notes, let AI map your entire syllabus, and level up as you complete topics.
          </p>

          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row" style={ctaReveal}>
            <button
              type="button"
              onClick={() => goToSection('upload')}
              className="w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white sm:w-auto"
              style={{ backgroundColor: '#7F77DD' }}
            >
              Upload your notes {'->'}
            </button>
            <button
              type="button"
              onClick={() => goToSection('how-it-works')}
              className="w-full rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300 transition hover:border-slate-600 sm:w-auto"
            >
              See how it works ↓
            </button>
          </div>

          <article
            className="mx-auto mt-8 max-w-[440px] rounded-xl border border-slate-700 bg-slate-800 p-4 text-left"
            style={cardReveal}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-medium text-white">💻 Data Structures and Algorithms</h3>
              </div>
              <span className="rounded-full px-2 py-1 text-xs font-medium" style={{ backgroundColor: '#EEEDFE', color: '#534AB7' }}>
                65% done
              </span>
            </div>

            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-700">
              <div className="h-full rounded-full" style={{ width: '65%', backgroundColor: '#7F77DD' }} />
            </div>

            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-center gap-2 text-slate-400 line-through">
                <span style={{ color: '#7F77DD' }}>☑</span>
                Arrays and two pointer technique
              </li>
              <li className="flex items-center gap-2 text-slate-400 line-through">
                <span style={{ color: '#7F77DD' }}>☑</span>
                Linked lists and cycle detection
              </li>
              <li className="flex items-center gap-2 text-slate-400 line-through">
                <span style={{ color: '#7F77DD' }}>☑</span>
                Stacks, queues and applications
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <span style={{ color: '#7F77DD' }}>☐</span>
                Binary trees and BST traversals
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <span style={{ color: '#7F77DD' }}>☐</span>
                Dynamic programming fundamentals
              </li>
            </ul>
          </article>
        </div>
      </section>

      <section id="features" className="border-t border-slate-800">
        <div className="mx-auto w-full max-w-4xl px-6 py-10 md:py-16">
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#7F77DD' }}>
              Features
            </p>
            <h2 className="mt-3 text-2xl font-medium text-white">Everything you need to study smarter</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-slate-400">
              Not just another notes app - it's a full learning system.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {featureCards.map((item) => (
              <article
                key={item.title}
                className="rounded-xl border border-slate-700 bg-slate-800 p-5 transition hover:border-slate-600"
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-sm"
                  style={{ backgroundColor: item.iconBg }}
                >
                  {item.emoji}
                </div>
                <h3 className="mt-3 text-[13px] font-medium text-white">{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-t border-slate-800">
        <div className="mx-auto w-full max-w-4xl px-6 py-10 md:py-16">
          <div className="text-center">
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#7F77DD' }}>
              How it works
            </p>
            <h2 className="mt-3 text-2xl font-medium text-white">Three steps to a smarter study session</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-slate-400">
              From raw notes to a game in under 30 seconds.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {howItWorks.map((item, index) => (
              <div key={item.step} className="relative rounded-xl border border-slate-700 bg-slate-800 p-5">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium"
                  style={{ backgroundColor: '#EEEDFE', color: '#534AB7' }}
                >
                  {item.step}
                </div>
                <h3 className="mt-3 text-sm font-medium text-white">{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">{item.description}</p>
                {index < howItWorks.length - 1 ? (
                  <span className="absolute -right-2 top-1/2 hidden -translate-y-1/2 text-slate-500 md:block" aria-hidden="true">
                    →
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="upload" className="border-t border-slate-800">
        <div className="mx-auto w-full max-w-4xl px-6 py-10 md:py-16">
          <div className="text-center">
            <h2 className="text-2xl font-medium text-white">Upload your notes</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-slate-400">
              Paste your notes below and AI will extract all topics automatically.
            </p>
          </div>

          <div className="mx-auto mt-6 w-full max-w-[600px]">
            <UploadNotes />
          </div>
        </div>
      </section>

      <section className="border-t border-slate-800">
        <div className="mx-auto w-full max-w-4xl px-6 py-10 md:py-16">
          <div className="rounded-xl bg-slate-800 p-8 text-center">
            <h2 className="text-xl font-medium text-white">Ready to level up your studying?</h2>
            <p className="mt-2 text-[13px] text-slate-400">
              Free forever. No account needed. Just paste your notes and go.
            </p>
            <button
              type="button"
              onClick={() => goToSection('upload')}
              className="mt-5 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
              style={{ backgroundColor: '#7F77DD' }}
            >
              Get started for free {'->'}
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-2 px-6 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: '#7F77DD' }} aria-hidden="true" />
            NoteQuest - Built for Nira Hackathon 2026
          </p>
          <p>Made with React + Groq AI</p>
        </div>
      </footer>
    </main>
  )
}

export default Home
