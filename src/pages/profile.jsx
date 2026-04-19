import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getXP, getLevel, getStreak, getSubjects,
  getStudyActivity, getWeakTopics, getTopicRatings
} from '../utils/storage'

// ── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || 'NQ'

const getLevelInfo = (xp) => {
  const levels = [
    { title: 'Novice',  min: 0,    max: 100,  next: 100  },
    { title: 'Learner', min: 100,  max: 300,  next: 300  },
    { title: 'Scholar', min: 300,  max: 600,  next: 600  },
    { title: 'Expert',  min: 600,  max: 1000, next: 1000 },
    { title: 'Master',  min: 1000, max: 1000, next: null },
  ]
  return levels.findLast(l => xp >= l.min) ?? levels[0]
}

const getLevelIndex = (title) =>
  ['Novice','Learner','Scholar','Expert','Master'].indexOf(title)

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })

// ── Badge definitions ─────────────────────────────────────────────────────────

const BADGE_DEFS = [
  { id: 'first_topic',      icon: '✅', label: 'First step',       desc: 'Complete your first topic'          },
  { id: 'chapter_done',     icon: '🏆', label: 'Chapter champion', desc: 'Complete a full chapter'             },
  { id: 'subject_done',     icon: '🎓', label: 'Subject master',   desc: 'Complete all topics in a subject'   },
  { id: 'streak_3',         icon: '🔥', label: '3-day streak',     desc: 'Study 3 days in a row'               },
  { id: 'streak_5',         icon: '⚡', label: '5-day streak',     desc: 'Study 5 days in a row'               },
  { id: 'streak_10',        icon: '💎', label: '10-day streak',    desc: 'Study 10 days in a row'              },
  { id: 'xp_100',           icon: '⭐', label: 'Century',          desc: 'Earn 100 XP'                         },
  { id: 'xp_500',           icon: '🌟', label: 'Rising star',      desc: 'Earn 500 XP'                         },
  { id: 'xp_1000',          icon: '👑', label: 'Thousand club',    desc: 'Earn 1000 XP'                        },
  { id: 'hard_rater',       icon: '💪', label: 'Hard mode',        desc: 'Rate 5 topics as difficult'          },
  { id: 'reviewer',         icon: '🔄', label: 'Reviewer',         desc: 'Have 3 weak topics flagged'          },
  { id: 'multi_subject',    icon: '📚', label: 'Polymath',         desc: 'Add 3 or more subjects'              },
]

const computeUnlockedBadges = (subjects, xp, streak, ratings) => {
  const allTopics   = subjects.flatMap(s => s.chapters?.flatMap(c => c.topics) ?? [])
  const doneTopic   = allTopics.some(t => t.completed)
  const doneChapter = subjects.some(s => s.chapters?.some(c => c.topics.every(t => t.completed) && c.topics.length > 0))
  const doneSubject = subjects.some(s => {
    const all = s.chapters?.flatMap(c => c.topics) ?? []
    return all.length > 0 && all.every(t => t.completed)
  })
  const hardCount   = Object.values(ratings).filter(r => r === 3).length
  const weakCount   = Object.keys(getWeakTopics()).length

  return {
    first_topic:   doneTopic,
    chapter_done:  doneChapter,
    subject_done:  doneSubject,
    streak_3:      streak >= 3,
    streak_5:      streak >= 5,
    streak_10:     streak >= 10,
    xp_100:        xp >= 100,
    xp_500:        xp >= 500,
    xp_1000:       xp >= 1000,
    hard_rater:    hardCount >= 5,
    reviewer:      weakCount >= 3,
    multi_subject: subjects.length >= 3,
  }
}

// ── Streak calendar ───────────────────────────────────────────────────────────

function StreakCalendar({ activity }) {
  const days = useMemo(() => {
    const arr = []
    for (let i = 83; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().split('T')[0]
      arr.push({ date: key, count: activity[key] || 0 })
    }
    return arr
  }, [activity])

  const weeks = useMemo(() => {
    const w = []
    for (let i = 0; i < days.length; i += 7) w.push(days.slice(i, i + 7))
    return w
  }, [days])

  const cellColor = (count) => {
    if (count === 0) return 'rgba(255,255,255,0.05)'
    if (count <= 2)  return 'rgba(127,119,221,0.3)'
    if (count <= 5)  return 'rgba(127,119,221,0.6)'
    return 'rgba(127,119,221,1)'
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ display: 'flex', gap: 3, minWidth: 'max-content' }}>
        {weeks.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {week.map((day, di) => (
              <div
                key={di}
                title={`${day.date}: ${day.count} topic${day.count !== 1 ? 's' : ''}`}
                style={{
                  width: 12, height: 12, borderRadius: 2,
                  background: cellColor(day.count),
                  border: day.count === 0 ? '0.5px solid rgba(255,255,255,0.08)' : 'none',
                  transition: 'transform 0.1s',
                  cursor: day.count > 0 ? 'pointer' : 'default',
                }}
                onMouseEnter={e => { if (day.count > 0) e.currentTarget.style.transform = 'scale(1.4)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
              />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 10, justifyContent: 'flex-end' }}>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>Less</span>
        {['rgba(255,255,255,0.05)', 'rgba(127,119,221,0.3)', 'rgba(127,119,221,0.6)', 'rgba(127,119,221,1)'].map((c, i) => (
          <div key={i} style={{ width: 12, height: 12, borderRadius: 2, background: c, border: i === 0 ? '0.5px solid rgba(255,255,255,0.08)' : 'none' }} />
        ))}
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>More</span>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Profile() {
  const navigate  = useNavigate()
  const [username, setUsername]   = useState('')
  const [editing,  setEditing]    = useState(false)
  const [draftName, setDraftName] = useState('')
  const [copied,   setCopied]     = useState(false)
  const [fadeIn,   setFadeIn]     = useState(false)

  const xp       = getXP()
  const streak   = getStreak()
  const subjects = getSubjects()
  const activity = getStudyActivity()
  const ratings  = getTopicRatings()
  const levelInfo = getLevelInfo(xp)
  const levelIdx  = getLevelIndex(levelInfo.title)

  const unlockedMap = useMemo(
    () => computeUnlockedBadges(subjects, xp, streak, ratings),
    [subjects, xp, streak, ratings]
  )

  const unlockedCount = Object.values(unlockedMap).filter(Boolean).length

  const allTopics      = subjects.flatMap(s => s.chapters?.flatMap(c => c.topics) ?? [])
  const completedTopics = allTopics.filter(t => t.completed).length
  const completedSubjects = subjects.filter(s => {
    const all = s.chapters?.flatMap(c => c.topics) ?? []
    return all.length > 0 && all.every(t => t.completed)
  })

  const xpPct = levelInfo.next
    ? Math.round(((xp - levelInfo.min) / (levelInfo.next - levelInfo.min)) * 100)
    : 100

  useEffect(() => {
    const saved = localStorage.getItem('nq_username') || ''
    setUsername(saved)
    setDraftName(saved)
    setTimeout(() => setFadeIn(true), 50)
  }, [])

  const saveName = () => {
    const trimmed = draftName.trim()
    if (trimmed.length < 2) return
    localStorage.setItem('nq_username', trimmed)
    setUsername(trimmed)
    setEditing(false)
  }

  const handleShare = () => {
    const text = `🎮 My NoteQuest stats:\n👤 ${username || 'Anonymous'}\n⚡ ${xp} XP · ${levelInfo.title}\n🔥 ${streak} day streak\n📚 ${completedTopics} topics completed\n\nBuilt for Nira Hackathon 2026`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const LEVEL_STEPS = ['Novice', 'Learner', 'Scholar', 'Expert', 'Master']

  return (
    <div style={{
      background: '#000',
      minHeight: '100vh',
      color: '#fff',
      fontFamily: 'inherit',
      opacity: fadeIn ? 1 : 0,
      transform: fadeIn ? 'translateY(0)' : 'translateY(8px)',
      transition: 'opacity 0.4s ease, transform 0.4s ease',
    }}>
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>

        {/* ── Back ── */}
        <button
          onClick={() => navigate(-1)}
          style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer', padding: '0 0 1.5rem', display: 'flex', alignItems: 'center', gap: 6, transition: 'color 0.15s' }}
          onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}>
          ← Back
        </button>

        {/* ── Hero card ── */}
        <div style={{
          background: 'rgba(255,255,255,0.02)',
          border: '0.5px solid rgba(255,255,255,0.07)',
          borderRadius: 16,
          padding: '2rem',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flex: 1, minWidth: 240 }}>

            {/* Avatar */}
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(127,119,221,0.2)',
              border: '0.5px solid rgba(127,119,221,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 500, color: 'rgba(175,169,236,1)',
              flexShrink: 0,
              letterSpacing: 1,
            }}>
              {getInitials(username)}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              {editing ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    autoFocus
                    value={draftName}
                    onChange={e => setDraftName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditing(false) }}
                    maxLength={24}
                    style={{
                      fontSize: 20, fontWeight: 500, color: '#fff',
                      background: 'rgba(255,255,255,0.05)',
                      border: '0.5px solid rgba(127,119,221,0.5)',
                      borderRadius: 8, padding: '4px 10px',
                      outline: 'none', width: 180,
                    }}
                  />
                  <button onClick={saveName}
                    style={{ fontSize: 12, padding: '5px 12px', borderRadius: 6, background: 'rgba(127,119,221,0.8)', border: 'none', color: '#fff', cursor: 'pointer' }}>
                    Save
                  </button>
                  <button onClick={() => setEditing(false)}
                    style={{ fontSize: 12, padding: '5px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                    ✕
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h1 style={{ fontSize: 20, fontWeight: 500, color: '#fff', margin: 0 }}>
                    {username || 'Anonymous'}
                  </h1>
                  <button onClick={() => setEditing(true)}
                    style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}>
                    ✎ edit
                  </button>
                </div>
              )}
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>
                {levelInfo.title} · {completedTopics} topics · {streak}d streak
              </div>
            </div>
          </div>

          {/* Share button */}
          <button onClick={handleShare}
            style={{
              fontSize: 13, fontWeight: 500, padding: '8px 16px',
              borderRadius: 8, cursor: 'pointer', transition: 'all 0.15s',
              background: copied ? 'rgba(99,153,34,0.15)' : 'rgba(255,255,255,0.05)',
              border: `0.5px solid ${copied ? 'rgba(99,153,34,0.3)' : 'rgba(255,255,255,0.1)'}`,
              color: copied ? 'rgba(151,196,89,1)' : 'rgba(255,255,255,0.6)',
            }}
            onMouseEnter={e => { if (!copied) { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff' } }}
            onMouseLeave={e => { if (!copied) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)' } }}>
            {copied ? '✓ Copied!' : '↗ Share profile'}
          </button>
        </div>

        {/* ── XP + Level ── */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '1.5rem', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>Level progress</div>
            <div style={{ fontSize: 13, color: 'rgba(127,119,221,1)', fontWeight: 500 }}>{xp} XP</div>
          </div>

          {/* Level steps */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: '1.25rem', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.07)', transform: 'translateY(-50%)', zIndex: 0 }} />
            {LEVEL_STEPS.map((lv, i) => {
              const reached = i <= levelIdx
              const current = i === levelIdx
              return (
                <div key={lv} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, zIndex: 1 }}>
                  <div style={{
                    width: current ? 28 : 20,
                    height: current ? 28 : 20,
                    borderRadius: '50%',
                    background: reached ? 'rgba(127,119,221,1)' : 'rgba(255,255,255,0.07)',
                    border: current ? '2px solid rgba(175,169,236,0.6)' : '0.5px solid rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: current ? 12 : 10,
                    color: reached ? '#fff' : 'rgba(255,255,255,0.25)',
                    transition: 'all 0.3s',
                  }}>
                    {reached ? (current ? '★' : '✓') : '·'}
                  </div>
                  <div style={{ fontSize: 10, color: reached ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.2)', fontWeight: current ? 500 : 400 }}>
                    {lv}
                  </div>
                </div>
              )
            })}
          </div>

          {/* XP bar */}
          {levelInfo.next && (
            <>
              <div style={{ height: 5, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden', marginBottom: 6 }}>
                <div style={{ height: '100%', width: `${xpPct}%`, background: 'rgba(127,119,221,1)', borderRadius: 99, transition: 'width 0.6s ease' }} />
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', display: 'flex', justifyContent: 'space-between' }}>
                <span>{xp - levelInfo.min} XP earned this level</span>
                <span>{levelInfo.next - xp} XP to {LEVEL_STEPS[levelIdx + 1]}</span>
              </div>
            </>
          )}
          {!levelInfo.next && (
            <div style={{ fontSize: 12, color: 'rgba(127,119,221,0.8)', textAlign: 'center', padding: '4px 0' }}>
              👑 Maximum level reached
            </div>
          )}
        </div>

        {/* ── Stats row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'Total XP', value: xp },
            { label: 'Topics done', value: completedTopics },
            { label: 'Subjects', value: subjects.length },
            { label: 'Day streak', value: `${streak}d` },
          ].map((s, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 500, color: 'rgba(127,119,221,1)' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Badges ── */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '1.5rem', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>Badges</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{unlockedCount} / {BADGE_DEFS.length} unlocked</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
            {BADGE_DEFS.map(b => {
              const unlocked = unlockedMap[b.id]
              return (
                <div key={b.id}
                  title={b.desc}
                  style={{
                    background: unlocked ? 'rgba(127,119,221,0.08)' : 'rgba(255,255,255,0.02)',
                    border: `0.5px solid ${unlocked ? 'rgba(127,119,221,0.25)' : 'rgba(255,255,255,0.05)'}`,
                    borderRadius: 10, padding: '0.875rem 1rem',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    opacity: unlocked ? 1 : 0.35,
                    transition: 'all 0.2s',
                    cursor: 'default',
                    filter: unlocked ? 'none' : 'grayscale(1)',
                  }}>
                  <span style={{ fontSize: 24 }}>{b.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 500, color: unlocked ? 'rgba(175,169,236,1)' : 'rgba(255,255,255,0.4)', textAlign: 'center', lineHeight: 1.3 }}>
                    {b.label}
                  </span>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', textAlign: 'center', lineHeight: 1.3 }}>
                    {b.desc}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Streak calendar ── */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '1.5rem', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>Study activity</div>
            <div style={{ display: 'flex', gap: 20 }}>
              {[
                { label: 'Days studied', value: Object.values(activity).filter(v => v > 0).length },
                { label: 'Current streak', value: `${streak}d` },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{s.value}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <StreakCalendar activity={activity} />
        </div>

        {/* ── Completed subjects ── */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>Completed subjects</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{completedSubjects.length} of {subjects.length}</div>
          </div>

          {completedSubjects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>🎯</div>
              Complete a subject to see it here
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {completedSubjects.map(s => {
                const all = s.chapters?.flatMap(c => c.topics) ?? []
                const addedDate = s.addedAt ? fmtDate(s.addedAt) : ''
                return (
                  <div key={s.id}
                    onClick={() => navigate(`/subject/${s.id}`)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                      background: 'rgba(99,153,34,0.05)',
                      border: '0.5px solid rgba(99,153,34,0.2)',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,153,34,0.09)'; e.currentTarget.style.borderColor = 'rgba(99,153,34,0.35)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,153,34,0.05)'; e.currentTarget.style.borderColor = 'rgba(99,153,34,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 99, background: 'rgba(99,153,34,0.15)', color: 'rgba(151,196,89,1)', fontWeight: 500 }}>✓</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>{s.subject}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                          {all.length} topics{addedDate ? ` · Completed ${addedDate}` : ''}
                        </div>
                      </div>
                    </div>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>→</span>
                  </div>
                )
              })}
            </div>
          )}

          {subjects.length > completedSubjects.length && (
            <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
                {subjects.length - completedSubjects.length} subject{subjects.length - completedSubjects.length > 1 ? 's' : ''} still in progress
              </span>
              <button onClick={() => navigate('/notes')}
                style={{ fontSize: 12, color: 'rgba(127,119,221,0.8)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(127,119,221,1)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(127,119,221,0.8)'}>
                View all →
              </button>
            </div>
          )}
        </div>

      </main>
    </div>
  )
}