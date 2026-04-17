import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSubjects, deleteSubject } from '../utils/storage'

const EMOJI_MAP = (name = '') => {
  const n = name.toLowerCase()
  if (n.includes('math') || n.includes('algebra') || n.includes('calculus')) return { emoji: '📐', bg: '#0d1a14' }
  if (n.includes('chemistry') || n.includes('chem')) return { emoji: '🧪', bg: '#1a0d0d' }
  if (n.includes('physics')) return { emoji: '⚡', bg: '#0d0d1f' }
  if (n.includes('cs') || n.includes('computer') || n.includes('programming') || n.includes('data structure') || n.includes('algorithm')) return { emoji: '💻', bg: '#0d0d1f' }
  if (n.includes('biology') || n.includes('bio') || n.includes('cell')) return { emoji: '🧬', bg: '#0a140a' }
  if (n.includes('history')) return { emoji: '📖', bg: '#14100d' }
  if (n.includes('english') || n.includes('literature')) return { emoji: '✍️', bg: '#0d0d14' }
  if (n.includes('economics') || n.includes('econ')) return { emoji: '📊', bg: '#0d1410' }
  if (n.includes('philosophy')) return { emoji: '🧠', bg: '#14100d' }
  if (n.includes('zoology') || n.includes('botany')) return { emoji: '🌿', bg: '#0a140a' }
  return { emoji: '📚', bg: '#111' }
}

const getSubjectStats = (subject) => {
  const allTopics = subject.chapters?.flatMap(c => c.topics) ?? []
  const total = allTopics.length
  const done = allTopics.filter(t => t.completed).length
  const pct = total > 0 ? Math.round((done / total) * 100) : 0
  return { total, done, pct }
}

const getStatus = (pct) => {
  if (pct === 100) return 'completed'
  if (pct > 0) return 'in-progress'
  return 'not-started'
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('en', { month: 'short', day: 'numeric' })
  } catch {
    return ''
  }
}

const NAV_LINKS = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'My notes', path: '/notes' },
  { label: 'Leaderboard', path: '/leaderboard' },
  { label: 'Settings', path: '/settings' },
]

function Navbar({ xp, level }) {
  const navigate = useNavigate()
  const current = '/notes'
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 40,
      background: 'rgba(0,0,0,0.97)',
      backdropFilter: 'blur(10px)',
      borderBottom: scrolled ? '0.5px solid rgba(255,255,255,0.07)' : '0.5px solid transparent',
      transition: 'border-color 0.2s',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => navigate('/')} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#7F77DD', display: 'inline-block' }} />
          <span style={{ fontSize: 15, fontWeight: 500, color: '#fff' }}>NoteQuest</span>
        </button>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="hidden md:flex">
          {NAV_LINKS.map(link => (
            <button key={link.path} onClick={() => navigate(link.path)}
              style={{
                fontSize: 13, padding: '6px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                background: current === link.path ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: current === link.path ? '#fff' : 'rgba(255,255,255,0.4)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (current !== link.path) e.currentTarget.style.color = 'rgba(255,255,255,0.75)' }}
              onMouseLeave={e => { if (current !== link.path) e.currentTarget.style.color = 'rgba(255,255,255,0.4)' }}>
              {link.label}
            </button>
          ))}
          <div style={{ width: '0.5px', height: 16, background: 'rgba(255,255,255,0.1)', margin: '0 6px' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 99, padding: '4px 10px' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7F77DD', display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontWeight: 500, color: '#fff' }}>{xp} XP</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>· {level}</span>
          </div>
        </nav>

        <button className="flex md:hidden" onClick={() => setMenuOpen(p => !p)}
          style={{ width: 34, height: 34, borderRadius: 7, border: '0.5px solid rgba(255,255,255,0.12)', background: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: 14 }}>
          ☰
        </button>
      </div>

      {menuOpen && (
        <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.06)', padding: '0.75rem 1.5rem 1rem' }}>
          {NAV_LINKS.map(link => (
            <button key={link.path} onClick={() => { navigate(link.path); setMenuOpen(false) }}
              style={{ display: 'block', width: '100%', textAlign: 'left', fontSize: 13, padding: '8px 0', background: 'none', border: 'none', cursor: 'pointer', color: current === link.path ? '#fff' : 'rgba(255,255,255,0.4)' }}>
              {link.label}
            </button>
          ))}
        </div>
      )}
    </header>
  )
}

function SubjectCard({ subject, onOpen, onDelete }) {
  const { emoji, bg } = EMOJI_MAP(subject.subject)
  const { total, done, pct } = getSubjectStats(subject)
  const status = getStatus(pct)
  const [menuOpen, setMenuOpen] = useState(false)

  const badgeStyle = {
    completed: { background: 'rgba(99,153,34,0.15)', color: '#97C459' },
    'in-progress': { background: 'rgba(127,119,221,0.15)', color: '#AFA9EC' },
    'not-started': { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' },
  }[status]

  const badgeLabel = {
    completed: 'Completed',
    'in-progress': `${pct}%`,
    'not-started': 'Not started',
  }[status]

  const progressColor = status === 'completed' ? '#639922' : '#7F77DD'

  return (
    <article
      onClick={() => onOpen(subject)}
      style={{ background: '#0a0a0a', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '1.25rem', cursor: 'pointer', transition: 'all 0.2s', minHeight: 160, display: 'flex', flexDirection: 'column', position: 'relative' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.background = '#0d0d0d' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = '#0a0a0a' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'auto' }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
          {emoji}
        </div>
        <div style={{ position: 'relative' }}>
          <button
            onClick={e => { e.stopPropagation(); setMenuOpen(p => !p) }}
            style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'rgba(255,255,255,0.3)' }}>
            ⋯
          </button>
          {menuOpen && (
            <div
              onClick={e => e.stopPropagation()}
              style={{ position: 'absolute', right: 0, top: 30, background: '#111', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '4px', zIndex: 10, minWidth: 130 }}>
              <button onClick={() => { onOpen(subject); setMenuOpen(false) }}
                style={{ display: 'block', width: '100%', textAlign: 'left', fontSize: 12, padding: '6px 10px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', borderRadius: 6 }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                Open subject
              </button>
              <button onClick={() => { onDelete(subject.id); setMenuOpen(false) }}
                style={{ display: 'block', width: '100%', textAlign: 'left', fontSize: 12, padding: '6px 10px', background: 'none', border: 'none', color: '#F09595', cursor: 'pointer', borderRadius: 6 }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(240,149,149,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}>
                Delete subject
              </button>
            </div>
          )}
        </div>
      </div>

      <span style={{ ...badgeStyle, position: 'absolute', top: 12, right: 44, fontSize: 10, padding: '2px 7px', borderRadius: 99, fontWeight: 500 }}>
        {badgeLabel}
      </span>

      <div style={{ fontSize: 14, fontWeight: 500, color: '#fff', marginTop: '1rem', marginBottom: 4, lineHeight: 1.3 }}>
        {subject.subject}
      </div>
      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
        {done} / {total} topics{subject.addedAt ? ` · Added ${formatDate(subject.addedAt)}` : ''}
      </div>

      <div style={{ height: 2, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden', marginTop: 12 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: progressColor, borderRadius: 99, transition: 'width 0.4s ease' }} />
      </div>
    </article>
  )
}

export default function Notes() {
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('recent')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const xp = parseInt(localStorage.getItem('studyquest_xp') || '0')
  const level = (() => {
    if (xp >= 1000) return 'Master'
    if (xp >= 600) return 'Expert'
    if (xp >= 300) return 'Scholar'
    if (xp >= 100) return 'Learner'
    return 'Novice'
  })()

  useEffect(() => {
    setSubjects(getSubjects())
  }, [])

  const filtered = useMemo(() => {
    let list = [...subjects]

    if (search.trim()) {
      list = list.filter(s => s.subject?.toLowerCase().includes(search.toLowerCase()))
    }

    if (filter !== 'all') {
      list = list.filter(s => {
        const status = getStatus(getSubjectStats(s).pct)
        return status === filter
      })
    }

    list.sort((a, b) => {
      if (sort === 'recent') return (b.addedAt || 0) > (a.addedAt || 0) ? 1 : -1
      if (sort === 'progress-high') return getSubjectStats(b).pct - getSubjectStats(a).pct
      if (sort === 'progress-low') return getSubjectStats(a).pct - getSubjectStats(b).pct
      if (sort === 'az') return (a.subject || '').localeCompare(b.subject || '')
      return 0
    })

    return list
  }, [subjects, filter, search, sort])

  const handleDelete = (id) => {
    if (deleteConfirm === id) {
      deleteSubject(id)
      setSubjects(getSubjects())
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(id)
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  const handleOpen = (subject) => {
    navigate('/dashboard', { state: { openSubjectId: subject.id } })
  }

  const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'in-progress', label: 'In progress' },
    { key: 'completed', label: 'Completed' },
    { key: 'not-started', label: 'Not started' },
  ]

  return (
    <div style={{ background: '#000', minHeight: '100vh', color: '#fff' }}>
      <Navbar xp={xp} level={level} />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {FILTERS.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                style={{
                  fontSize: 12, padding: '5px 12px', borderRadius: 99, cursor: 'pointer', transition: 'all 0.15s',
                  border: '0.5px solid rgba(255,255,255,0.1)',
                  background: filter === f.key ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: filter === f.key ? '#fff' : 'rgba(255,255,255,0.4)',
                }}>
                {f.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '5px 10px' }}>
              <span style={{ fontSize: 12 }}>🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search subjects..."
                style={{ fontSize: 12, background: 'none', border: 'none', outline: 'none', color: '#fff', width: 140 }}
              />
            </div>

            <select value={sort} onChange={e => setSort(e.target.value)}
              style={{ fontSize: 12, padding: '5px 10px', borderRadius: 8, border: '0.5px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', outline: 'none' }}>
              <option value="recent" style={{ background: '#111' }}>Most recent</option>
              <option value="progress-high" style={{ background: '#111' }}>Most progress</option>
              <option value="progress-low" style={{ background: '#111' }}>Least progress</option>
              <option value="az" style={{ background: '#111' }}>A → Z</option>
            </select>

            <button onClick={() => navigate('/upload')}
              style={{ fontSize: 13, fontWeight: 500, padding: '6px 14px', borderRadius: 8, background: '#7F77DD', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'opacity 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              + Add notes
            </button>
          </div>
        </div>

        {/* Section title */}
        <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginBottom: '1rem' }}>
          {filter === 'all' ? 'My subjects' : FILTERS.find(f => f.key === filter)?.label} · {filtered.length}
        </div>

        {/* Grid */}
        {filtered.length === 0 && filter === 'all' && !search ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            <button onClick={() => navigate('/upload')}
              style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px dashed rgba(255,255,255,0.12)', borderRadius: 12, padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', minHeight: 160, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'rgba(255,255,255,0.5)' }}>+</div>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Add your first subject</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {filter === 'all' && !search && (
              <button onClick={() => navigate('/upload')}
                style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px dashed rgba(255,255,255,0.12)', borderRadius: 12, padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', minHeight: 160, transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', border: '0.5px solid rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'rgba(255,255,255,0.5)' }}>+</div>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Add new subject</span>
              </button>
            )}

            {filtered.map(subject => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                onOpen={handleOpen}
                onDelete={handleDelete}
              />
            ))}

            {filtered.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                {search ? `No subjects matching "${search}"` : 'No subjects in this category yet.'}
              </div>
            )}
          </div>
        )}

        {/* Delete confirmation toast */}
        {deleteConfirm && (
          <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#1a0000', border: '0.5px solid rgba(240,149,149,0.3)', borderRadius: 8, padding: '10px 16px', fontSize: 13, color: '#F09595', zIndex: 100, display: 'flex', alignItems: 'center', gap: 12 }}>
            Click delete again to confirm
            <button onClick={() => setDeleteConfirm(null)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 14 }}>✕</button>
          </div>
        )}
      </main>
    </div>
  )
}