import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'

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
  const location = useLocation()

  const tagReveal = useReveal(0)
  const headingReveal = useReveal(100)
  const subtextReveal = useReveal(200)
  const ctaReveal = useReveal(300)
  const cardReveal = useReveal(400)
  const statsReveal = useReveal(500)

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth'
    return () => {
      document.documentElement.style.scrollBehavior = ''
    }
  }, [])

  useEffect(() => {
    if (!location.hash) return
    const targetId = location.hash.replace('#', '')
    const node = document.getElementById(targetId)
    if (node) {
      window.requestAnimationFrame(() => {
        node.scrollIntoView({ block: 'start' })
      })
    }
  }, [location.hash])

  const goToSection = (id) => {
    const node = document.getElementById(id)
    if (node) {
      node.scrollIntoView({ block: 'start' })
    }
  }

  const featureCards = useMemo(() => [
    {
      iconBg: 'color-mix(in srgb, var(--accent) 16%, var(--surface-2))',
      emoji: '🤖',
      title: 'AI topic extraction',
      description: 'Paste any notes and AI automatically builds a structured syllabus with chapters and topics.',
    },
    {
      iconBg: 'color-mix(in srgb, #3B6D11 18%, var(--surface-2))',
      emoji: '🎮',
      title: 'Gamified progress',
      description: 'Earn XP, level up from Novice to Master, and maintain daily streaks as you complete topics.',
    },
    {
      iconBg: 'color-mix(in srgb, #b87c1a 18%, var(--surface-2))',
      emoji: '📊',
      title: 'Syllabus tracking',
      description: "See exactly how much of each subject you've covered with real-time progress bars.",
    },
    {
      iconBg: '#0d1a14',
      emoji: '🧠',
      title: 'Smart revision',
      description: 'Spaced repetition schedules your reviews automatically. Never forget what you studied.',
    },
    {
      iconBg: '#1a0d0d',
      emoji: '📅',
      title: 'Exam countdown',
      description: 'Set your exam date and get a daily study plan. Know exactly if you are on track or behind.',
    },
    {
      iconBg: '#0d0d1f',
      emoji: '🗺️',
      title: 'Learning roadmap',
      description: 'Visual chapter-by-chapter path showing your entire learning journey per subject.',
    },
    {
      iconBg: '#0d1a0d',
      emoji: '📈',
      title: 'Study analytics',
      description: 'GitHub-style heatmap, velocity chart and completion forecast based on your real pace.',
    },
    {
      iconBg: 'color-mix(in srgb, #8b3b3b 18%, var(--surface-2))',
      emoji: '🏆',
      title: 'Leaderboard',
      description: 'Compete with classmates. Submit your XP score and climb the global rankings.',
    },
  ], [])

  const newFeatures = useMemo(() => [
    {
      iconBg: 'color-mix(in srgb, var(--accent) 16%, var(--surface-2))',
      emoji: '⚡',
      title: 'Daily challenge',
      description: 'AI picks one topic every day as your challenge. Complete it for +50 bonus XP.',
    },
    {
      iconBg: 'color-mix(in srgb, #3B6D11 18%, var(--surface-2))',
      emoji: '💡',
      title: 'AI study tips',
      description: 'Click any topic to get a personalized 1-line study tip from Groq AI instantly.',
    },
    {
      iconBg: 'color-mix(in srgb, #b87c1a 18%, var(--surface-2))',
      emoji: '🎓',
      title: 'Completion certificate',
      description: 'Finish a subject and download a shareable certificate with your level and XP.',
    },
    {
      iconBg: 'color-mix(in srgb, #8b3b3b 18%, var(--surface-2))',
      emoji: '⭐',
      title: 'Difficulty ratings',
      description: 'Rate topics 1–3 stars after completing. Hard topics reward bonus XP.',
    },
  ], [])

  const allFeatures = useMemo(() => [...featureCards, ...newFeatures], [featureCards, newFeatures])

  const howItWorks = useMemo(() => [
    {
      step: '1',
      title: 'Upload your notes',
      description: 'Paste text or upload a .txt or .pdf file of your study notes for any subject.',
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
  ], [])

  return (
    <main style={{ background: 'var(--surface-0)', color: 'var(--text-primary)', minHeight: '100vh', fontFamily: 'inherit' }}>
      <Navbar showSettingsHamburger={false} />

      <section id="top" style={{ maxWidth: 900, margin: '0 auto', padding: '4rem 1.5rem 3rem', textAlign: 'center', borderBottom: '0.5px solid #111' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <div style={{ ...tagReveal, display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--surface-2)', border: '0.5px solid #2a2a2a', borderRadius: 99, padding: '4px 12px', marginBottom: '1.5rem' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>AI-powered learning tracker</span>
          </div>

          <h1 style={{ ...headingReveal, fontSize: 36, fontWeight: 500, lineHeight: 1.2, color: 'var(--text-primary)', marginBottom: '1rem' }}>
            Turn your notes into<br />
            a <span style={{ color: 'var(--accent)' }}>learning adventure</span>
          </h1>

          <p style={{ ...subtextReveal, fontSize: 14, color: 'var(--text-faint)', maxWidth: 380, margin: '0 auto 1.75rem', lineHeight: 1.6 }}>
            Upload notes, let AI map your syllabus, earn XP, and level up as you study.
          </p>

          <div style={{ ...ctaReveal, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            <button type="button" onClick={() => navigate('/upload')}
              style={{ fontSize: 13, fontWeight: 500, padding: '9px 20px', borderRadius: 8, background: 'var(--accent)', color: 'var(--text-primary)', border: 'none', cursor: 'pointer' }}>
              Upload your notes →
            </button>
            <button type="button" onClick={() => goToSection('how-it-works')}
              style={{ fontSize: 13, padding: '9px 20px', borderRadius: 8, background: 'transparent', color: 'var(--text-muted)', border: '0.5px solid #2a2a2a', cursor: 'pointer' }}>
              See how it works ↓
            </button>
          </div>

          <article style={{ ...cardReveal, background: 'var(--surface-1)', border: '0.5px solid #1e1e1e', borderRadius: 12, padding: '1.25rem', maxWidth: 420, margin: '0 auto', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>💻 Data Structures and Algorithms</span>
              <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 99, background: '#1a1a2e', color: 'var(--accent)', fontWeight: 500 }}>65% done</span>
            </div>
            <div style={{ height: 4, background: 'var(--border-soft)', borderRadius: 99, overflow: 'hidden', marginBottom: 12 }}>
              <div style={{ height: '100%', width: '65%', background: 'var(--accent)', borderRadius: 99 }} />
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { label: 'Arrays and two pointer technique', done: true },
                { label: 'Linked lists and cycle detection', done: true },
                { label: 'Stacks, queues and applications', done: true },
                { label: 'Binary trees and BST traversals', done: false },
                { label: 'Dynamic programming fundamentals', done: false },
              ].map((t) => (
                <li key={t.label} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', fontSize: 12 }}>
                  <span style={{
                    width: 14, height: 14, borderRadius: 3, flexShrink: 0,
                    background: t.done ? 'var(--accent)' : 'transparent',
                    border: t.done ? 'none' : '0.5px solid #333',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {t.done && <span style={{ width: 6, height: 4, borderLeft: '1.5px solid #fff', borderBottom: '1.5px solid #fff', transform: 'rotate(-45deg) translateY(-1px)', display: 'block' }} />}
                  </span>
                  <span style={{ color: t.done ? 'var(--text-dim)' : 'var(--text-muted)', textDecoration: t.done ? 'line-through' : 'none' }}>{t.label}</span>
                  {t.done && <span style={{ fontSize: 10, color: 'var(--accent)', marginLeft: 'auto', background: 'var(--surface-2)', padding: '2px 6px', borderRadius: 4 }}>+10 XP</span>}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section id="features" style={{ borderTop: '0.5px solid #111' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <p style={{ fontSize: 10, fontWeight: 500, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Features</p>
            <h2 style={{ fontSize: 20, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 8 }}>Everything you need to study smarter</h2>
            <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>All core and newly added features in one place.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: 'var(--surface-3)', border: '0.5px solid #111', borderRadius: 12, overflow: 'hidden' }}>
            {allFeatures.map((item) => (
              <article key={item.title} style={{ background: 'var(--surface-0)', padding: '1.5rem', transition: 'background 0.2s', cursor: 'default' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-0)'}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: item.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginBottom: 12 }}>
                  {item.emoji}
                </div>
                <h3 style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 6 }}>{item.title}</h3>
                <p style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.5 }}>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" style={{ borderTop: '0.5px solid #111' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <p style={{ fontSize: 10, fontWeight: 500, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>How it works</p>
            <h2 style={{ fontSize: 20, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 8 }}>Three steps to a smarter study session</h2>
            <p style={{ fontSize: 13, color: 'var(--text-dim)' }}>From raw notes to a game in under 30 seconds.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {howItWorks.map((item, index) => (
              <div key={item.step} style={{ position: 'relative', background: 'var(--surface-1)', border: '0.5px solid #1a1a1a', borderRadius: 12, padding: '1.25rem' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--surface-3)', border: '0.5px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, color: 'var(--accent)', marginBottom: 12 }}>
                  {item.step}
                </div>
                <h3 style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 6 }}>{item.title}</h3>
                <p style={{ fontSize: 11, color: 'var(--text-dim)', lineHeight: 1.5 }}>{item.description}</p>
                {index < howItWorks.length - 1 && (
                  <span style={{ position: 'absolute', right: -8, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#333', zIndex: 1 }} aria-hidden="true">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ borderTop: '0.5px solid #111' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 1.5rem' }}>
          <div style={{ background: 'var(--surface-1)', border: '0.5px solid #1a1a1a', borderRadius: 12, padding: '2.5rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: 20, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 8 }}>Ready to level up your studying?</h2>
            <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: '1.5rem' }}>Free forever. No account needed. Just paste your notes and go.</p>
            <button type="button" onClick={() => navigate('/notes')}
              style={{ fontSize: 13, fontWeight: 500, padding: '9px 20px', borderRadius: 8, background: 'var(--accent)', color: 'var(--text-primary)', border: 'none', cursor: 'pointer' }}>
              Get started
            </button>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: '0.5px solid rgba(255,255,255,0.06)', background: '#000' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '2.5rem 1.5rem 1.5rem' }}>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem', paddingBottom: '2rem', borderBottom: '0.5px solid rgba(255,255,255,0.05)' }}>

            <div>
              <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>NoteQuest</div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', lineHeight: 1.6, marginBottom: 10 }}>
                Turn your notes into a gamified learning roadmap. Built for students who want to study smarter.
              </p>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)' }}>Free forever · No account needed</div>
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>App</div>
              {[['Dashboard', '/dashboard'], ['My notes', '/notes'], ['Exam calendar', '/calendar'], ['Leaderboard', '/leaderboard'], ['Profile', '/profile']].map(([label, path]) => (
                <button key={path} onClick={() => navigate(path)}
                  style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer', padding: '3px 0', transition: 'color 0.15s', textAlign: 'left' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}>
                  {label}
                </button>
              ))}
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Built with</div>
              {['React + Vite', 'Groq AI (LLaMA 3.3)', 'Supabase', 'Tailwind CSS', 'Nira Hackathon 2026'].map(item => (
                <div key={item} style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', padding: '3px 0' }}>{item}</div>
              ))}
            </div>

          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', flexWrap: 'wrap', gap: 8 }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(127,119,221,0.7)', display: 'inline-block' }} />
              NoteQuest — Built for Nira Hackathon 2026
            </p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>Made with React + Groq AI</p>
          </div>

        </div>
      </footer>

    </main>
  )
}

export default Home
