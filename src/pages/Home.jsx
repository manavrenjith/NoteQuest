import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

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
  const statsReveal = useReveal(500)

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth'
    const onScroll = () => setIsScrolled(window.scrollY > 6)
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

  const featureCards = useMemo(() => [
    {
      iconBg: '#0d0d1f',
      emoji: '🤖',
      title: 'AI topic extraction',
      description: 'Paste any notes and AI automatically builds a structured syllabus with chapters and topics.',
    },
    {
      iconBg: '#0d1a0d',
      emoji: '🎮',
      title: 'Gamified progress',
      description: 'Earn XP, level up from Novice to Master, and maintain daily streaks as you complete topics.',
    },
    {
      iconBg: '#1a1000',
      emoji: '📊',
      title: 'Syllabus tracking',
      description: "See exactly how much of each subject you've covered with real-time progress bars.",
    },
    {
      iconBg: '#0d0d1f',
      emoji: '🗺️',
      title: 'Learning roadmap',
      description: 'Visual chapter-by-chapter roadmap showing your entire learning journey per subject.',
    },
    {
      iconBg: '#0d1a0d',
      emoji: '📈',
      title: 'Study analytics',
      description: 'GitHub-style heatmap, velocity chart, and completion estimates based on your pace.',
    },
    {
      iconBg: '#1a0d0d',
      emoji: '🏆',
      title: 'Leaderboard',
      description: 'Compete with classmates. Submit your XP score and climb the global rankings.',
    },
  ], [])

  const newFeatures = useMemo(() => [
    {
      iconBg: '#0d0d1f',
      emoji: '⚡',
      title: 'Daily challenge',
      description: 'AI picks one topic every day as your challenge. Complete it for +50 bonus XP.',
    },
    {
      iconBg: '#0d1a0d',
      emoji: '💡',
      title: 'AI study tips',
      description: 'Click any topic to get a personalized 1-line study tip from Groq AI instantly.',
    },
    {
      iconBg: '#1a1000',
      emoji: '🎓',
      title: 'Completion certificate',
      description: 'Finish a subject and download a shareable certificate with your level and XP.',
    },
    {
      iconBg: '#1a0d0d',
      emoji: '⭐',
      title: 'Difficulty ratings',
      description: 'Rate topics 1–3 stars after completing. Hard topics reward bonus XP.',
    },
  ], [])

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
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'inherit' }}>

      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          background: 'rgba(0,0,0,0.96)',
          backdropFilter: 'blur(8px)',
          borderBottom: isScrolled ? '0.5px solid #1a1a1a' : '0.5px solid transparent',
          transition: 'border-color 0.2s',
        }}
      >
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56 }}>
          <button type="button" onClick={() => goToSection('top')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#7F77DD', display: 'inline-block' }} />
            <span style={{ fontSize: 15, fontWeight: 500, color: '#fff' }}>NoteQuest</span>
          </button>

          <nav style={{ display: 'flex', alignItems: 'center', gap: 16 }} className="hidden md:flex">
            <button type="button" onClick={() => goToSection('how-it-works')} style={{ fontSize: 13, color: '#666', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#666'}>How it works</button>
            <button type="button" onClick={() => goToSection('features')} style={{ fontSize: 13, color: '#666', background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#666'}>Features</button>
            <button type="button" onClick={() => goToSection('upload')} style={{ fontSize: 13, color: '#fff', background: '#7F77DD', border: 'none', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', transition: 'opacity 0.2s' }} onMouseEnter={e => e.target.style.opacity = '0.9'} onMouseLeave={e => e.target.style.opacity = '1'}>Get started</button>
          </nav>

          <button type="button" onClick={() => setMenuOpen(p => !p)} aria-label="Toggle menu" aria-expanded={menuOpen}
            style={{ display: 'none', width: 36, height: 36, alignItems: 'center', justifyContent: 'center', border: '0.5px solid #2a2a2a', borderRadius: 8, background: 'none', color: '#888', cursor: 'pointer', fontSize: 16 }}
            className="flex md:hidden">
            ☰
          </button>
        </div>

        {menuOpen && (
          <div style={{ borderTop: '0.5px solid #1a1a1a', padding: '0.75rem 1.5rem 1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[['How it works', 'how-it-works'], ['Features', 'features']].map(([label, id]) => (
                <button key={id} type="button" onClick={() => goToSection(id)}
                  style={{ fontSize: 13, color: '#888', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '8px 0' }}>
                  {label}
                </button>
              ))}
              <button type="button" onClick={() => goToSection('upload')}
                style={{ fontSize: 13, color: '#fff', background: '#7F77DD', border: 'none', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', textAlign: 'left' }}>
                Get started
              </button>
            </div>
          </div>
        )}
      </header>

      <section id="top" style={{ maxWidth: 900, margin: '0 auto', padding: '4rem 1.5rem 3rem', textAlign: 'center', borderBottom: '0.5px solid #111' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <div style={{ ...tagReveal, display: 'inline-flex', alignItems: 'center', gap: 6, background: '#0d0d0d', border: '0.5px solid #2a2a2a', borderRadius: 99, padding: '4px 12px', marginBottom: '1.5rem' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7F77DD', display: 'inline-block' }} />
            <span style={{ fontSize: 11, color: '#888' }}>AI-powered learning tracker</span>
          </div>

          <h1 style={{ ...headingReveal, fontSize: 36, fontWeight: 500, lineHeight: 1.2, color: '#fff', marginBottom: '1rem' }}>
            Turn your notes into<br />
            a <span style={{ color: '#7F77DD' }}>learning adventure</span>
          </h1>

          <p style={{ ...subtextReveal, fontSize: 14, color: '#555', maxWidth: 380, margin: '0 auto 1.75rem', lineHeight: 1.6 }}>
            Upload notes, let AI map your syllabus, earn XP, and level up as you study.
          </p>

          <div style={{ ...ctaReveal, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: '2.5rem', flexWrap: 'wrap' }}>
            <button type="button" onClick={() => goToSection('upload')}
              style={{ fontSize: 13, fontWeight: 500, padding: '9px 20px', borderRadius: 8, background: '#7F77DD', color: '#fff', border: 'none', cursor: 'pointer' }}>
              Upload your notes →
            </button>
            <button type="button" onClick={() => goToSection('how-it-works')}
              style={{ fontSize: 13, padding: '9px 20px', borderRadius: 8, background: 'transparent', color: '#888', border: '0.5px solid #2a2a2a', cursor: 'pointer' }}>
              See how it works ↓
            </button>
          </div>

          <article style={{ ...cardReveal, background: '#0a0a0a', border: '0.5px solid #1e1e1e', borderRadius: 12, padding: '1.25rem', maxWidth: 420, margin: '0 auto', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>💻 Data Structures and Algorithms</span>
              <span style={{ fontSize: 10, padding: '3px 8px', borderRadius: 99, background: '#1a1a2e', color: '#7F77DD', fontWeight: 500 }}>65% done</span>
            </div>
            <div style={{ height: 4, background: '#1a1a1a', borderRadius: 99, overflow: 'hidden', marginBottom: 12 }}>
              <div style={{ height: '100%', width: '65%', background: '#7F77DD', borderRadius: 99 }} />
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
                    background: t.done ? '#7F77DD' : 'transparent',
                    border: t.done ? 'none' : '0.5px solid #333',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {t.done && <span style={{ width: 6, height: 4, borderLeft: '1.5px solid #fff', borderBottom: '1.5px solid #fff', transform: 'rotate(-45deg) translateY(-1px)', display: 'block' }} />}
                  </span>
                  <span style={{ color: t.done ? '#444' : '#888', textDecoration: t.done ? 'line-through' : 'none' }}>{t.label}</span>
                  {t.done && <span style={{ fontSize: 10, color: '#7F77DD', marginLeft: 'auto', background: '#0d0d0d', padding: '2px 6px', borderRadius: 4 }}>+10 XP</span>}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section id="features" style={{ borderTop: '0.5px solid #111' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <p style={{ fontSize: 10, fontWeight: 500, color: '#7F77DD', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Features</p>
            <h2 style={{ fontSize: 20, fontWeight: 500, color: '#fff', marginBottom: 8 }}>Everything you need to study smarter</h2>
            <p style={{ fontSize: 13, color: '#444' }}>Not just another notes app — it's a full learning system.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, background: '#111', border: '0.5px solid #111', borderRadius: 12, overflow: 'hidden' }}>
            {featureCards.map((item) => (
              <article key={item.title} style={{ background: '#000', padding: '1.5rem', transition: 'background 0.2s', cursor: 'default' }}
                onMouseEnter={e => e.currentTarget.style.background = '#0a0a0a'}
                onMouseLeave={e => e.currentTarget.style.background = '#000'}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: item.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginBottom: 12 }}>
                  {item.emoji}
                </div>
                <h3 style={{ fontSize: 13, fontWeight: 500, color: '#fff', marginBottom: 6 }}>{item.title}</h3>
                <p style={{ fontSize: 12, color: '#444', lineHeight: 1.5 }}>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section style={{ borderTop: '0.5px solid #111' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <p style={{ fontSize: 10, fontWeight: 500, color: '#7F77DD', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>New</p>
            <h2 style={{ fontSize: 20, fontWeight: 500, color: '#fff', marginBottom: 8 }}>Built for serious students</h2>
            <p style={{ fontSize: 13, color: '#444' }}>Features that go beyond basic tracking.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {newFeatures.map((item) => (
              <div key={item.title} style={{ background: '#0a0a0a', border: '0.5px solid #1a1a1a', borderRadius: 12, padding: '1.25rem', display: 'flex', gap: 12, alignItems: 'flex-start', transition: 'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#333'}
                onMouseLeave={e => e.currentTarget.style.borderColor = '#1a1a1a'}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: item.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                  {item.emoji}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#fff', marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: '#444', lineHeight: 1.5 }}>{item.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" style={{ borderTop: '0.5px solid #111' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <p style={{ fontSize: 10, fontWeight: 500, color: '#7F77DD', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>How it works</p>
            <h2 style={{ fontSize: 20, fontWeight: 500, color: '#fff', marginBottom: 8 }}>Three steps to a smarter study session</h2>
            <p style={{ fontSize: 13, color: '#444' }}>From raw notes to a game in under 30 seconds.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {howItWorks.map((item, index) => (
              <div key={item.step} style={{ position: 'relative', background: '#0a0a0a', border: '0.5px solid #1a1a1a', borderRadius: 12, padding: '1.25rem' }}>
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#111', border: '0.5px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, color: '#7F77DD', marginBottom: 12 }}>
                  {item.step}
                </div>
                <h3 style={{ fontSize: 13, fontWeight: 500, color: '#fff', marginBottom: 6 }}>{item.title}</h3>
                <p style={{ fontSize: 11, color: '#444', lineHeight: 1.5 }}>{item.description}</p>
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
          <div style={{ background: '#0a0a0a', border: '0.5px solid #1a1a1a', borderRadius: 12, padding: '2.5rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: 20, fontWeight: 500, color: '#fff', marginBottom: 8 }}>Ready to level up your studying?</h2>
            <p style={{ fontSize: 13, color: '#444', marginBottom: '1.5rem' }}>Free forever. No account needed. Just paste your notes and go.</p>
            <button type="button" onClick={() => goToSection('upload')}
              style={{ fontSize: 13, fontWeight: 500, padding: '9px 20px', borderRadius: 8, background: '#7F77DD', color: '#fff', border: 'none', cursor: 'pointer' }}>
              Get started for free →
            </button>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: '0.5px solid #111' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <p style={{ fontSize: 11, color: '#333', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7F77DD', display: 'inline-block' }} aria-hidden="true" />
            NoteQuest — Built for Nira Hackathon 2026
          </p>
          <p style={{ fontSize: 11, color: '#333' }}>Made with React + Groq AI</p>
        </div>
      </footer>

    </main>
  )
}

export default Home
