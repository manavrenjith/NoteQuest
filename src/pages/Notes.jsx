import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { getSubjects, deleteSubject } from '../utils/storage'
import { applyTheme, getTheme, onThemeChange } from '../utils/theme'

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

function SubjectCard({ subject, onOpen, onDelete }) {
  const { emoji, bg } = EMOJI_MAP(subject.subject)
  const { total, done, pct } = getSubjectStats(subject)
  const status = getStatus(pct)
  const [menuOpen, setMenuOpen] = useState(false)

  const badgeStyle = {
    completed: { background: 'rgba(99,153,34,0.15)', color: '#97C459' },
    'in-progress': { background: 'rgba(127,119,221,0.15)', color: '#AFA9EC' },
    'not-started': { background: 'var(--surface-3)', color: 'var(--text-muted)' },
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
      style={{
        background: 'var(--surface-1)',
        border: '0.5px solid var(--border-soft)',
        borderRadius: 12,
        padding: '1.25rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
        minHeight: 160,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.background = 'var(--surface-2)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-soft)'; e.currentTarget.style.background = 'var(--surface-1)' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'auto' }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
          {emoji}
        </div>
        <div style={{ position: 'relative' }}>
          <button
            onClick={e => { e.stopPropagation(); setMenuOpen(p => !p) }}
            style={{ width: 26, height: 26, borderRadius: 6, border: 'none', background: 'none', color: 'var(--text-faint)', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-3)'; e.currentTarget.style.color = 'var(--text-muted)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-faint)' }}>
            ⋯
          </button>
          {menuOpen && (
            <div
              onClick={e => e.stopPropagation()}
              style={{ position: 'absolute', right: 0, top: 30, background: 'var(--surface-2)', border: '0.5px solid var(--border-soft)', borderRadius: 8, padding: '4px', zIndex: 10, minWidth: 130 }}>
              <button onClick={() => { onOpen(subject); setMenuOpen(false) }}
                style={{ display: 'block', width: '100%', textAlign: 'left', fontSize: 12, padding: '6px 10px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', borderRadius: 6 }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-3)'}
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

      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginTop: '1rem', marginBottom: 4, lineHeight: 1.3 }}>
        {subject.subject}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
        {done} / {total} topics{subject.addedAt ? ` · Added ${formatDate(subject.addedAt)}` : ''}
      </div>

      <div style={{ height: 2, background: 'var(--border-soft)', borderRadius: 99, overflow: 'hidden', marginTop: 12 }}>
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
  const [theme, setTheme] = useState(() => getTheme())
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    setSubjects(getSubjects())
  }, [])

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => onThemeChange(setTheme), [])

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
    navigate(`/subject/${subject.id}`)
  }

  const FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'in-progress', label: 'In progress' },
    { key: 'completed', label: 'Completed' },
    { key: 'not-started', label: 'Not started' },
  ]

  return (
    <div style={{ background: 'var(--surface-0)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      <Navbar showSettingsHamburger onSettingsHamburgerClick={() => setDrawerOpen(true)} />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {FILTERS.map(f => (
              <button key={f.key} onClick={() => setFilter(f.key)}
                style={{
                  fontSize: 12, padding: '5px 12px', borderRadius: 99, cursor: 'pointer', transition: 'all 0.15s',
                  border: '0.5px solid var(--border-soft)',
                  background: filter === f.key ? 'var(--surface-3)' : 'transparent',
                  color: filter === f.key ? 'var(--text-primary)' : 'var(--text-muted)',
                }}>
                {f.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--surface-2)', border: '0.5px solid var(--border-soft)', borderRadius: 8, padding: '5px 10px' }}>
              <span style={{ fontSize: 12 }}>🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search subjects..."
                style={{ fontSize: 12, background: 'none', border: 'none', outline: 'none', color: 'var(--text-primary)', width: 140 }}
              />
            </div>

            <select value={sort} onChange={e => setSort(e.target.value)}
              style={{ fontSize: 12, padding: '5px 10px', borderRadius: 8, border: '0.5px solid var(--border-soft)', background: 'var(--surface-2)', color: 'var(--text-muted)', cursor: 'pointer', outline: 'none' }}>
              <option value="recent" style={{ background: 'var(--surface-2)' }}>Most recent</option>
              <option value="progress-high" style={{ background: 'var(--surface-2)' }}>Most progress</option>
              <option value="progress-low" style={{ background: 'var(--surface-2)' }}>Least progress</option>
              <option value="az" style={{ background: 'var(--surface-2)' }}>A → Z</option>
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
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: '1rem' }}>
          {filter === 'all' ? 'My subjects' : FILTERS.find(f => f.key === filter)?.label} · {filtered.length}
        </div>

        {/* Grid */}
        {filtered.length === 0 && filter === 'all' && !search ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            <button onClick={() => navigate('/upload')}
              style={{ background: 'var(--surface-1)', border: '0.5px dashed var(--border-soft)', borderRadius: 12, padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', minHeight: 160, transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.borderColor = 'var(--border-strong)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-1)'; e.currentTarget.style.borderColor = 'var(--border-soft)' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--surface-3)', border: '0.5px solid var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'var(--text-muted)' }}>+</div>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Add your first subject</span>
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {filter === 'all' && !search && (
              <button onClick={() => navigate('/upload')}
                style={{ background: 'var(--surface-1)', border: '0.5px dashed var(--border-soft)', borderRadius: 12, padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, cursor: 'pointer', minHeight: 160, transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.borderColor = 'var(--border-strong)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface-1)'; e.currentTarget.style.borderColor = 'var(--border-soft)' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--surface-3)', border: '0.5px solid var(--border-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'var(--text-muted)' }}>+</div>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Add new subject</span>
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
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--text-faint)', fontSize: 13 }}>
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
    </div>
  )
}