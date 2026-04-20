import { useEffect, useState } from 'react'
import {
  getDueRevisions,
  getRevisionStreak,
  getSubjects,
  getTodayRevisionProgress,
  markRevisedToday,
  markTopicRevised,
} from '../utils/storage'

const DIFFICULTY_LABELS = { 1: 'Easy', 2: 'Medium', 3: 'Hard' }

const DIFFICULTY_STYLE = {
  1: { background: 'rgba(99,153,34,0.12)', color: 'rgba(151,196,89,1)' },
  2: { background: 'rgba(127,119,221,0.12)', color: 'rgba(175,169,236,1)' },
  3: { background: 'rgba(239,159,39,0.12)', color: 'rgba(239,159,39,1)' },
}

const getDueLabel = (daysOverdue, isNew) => {
  if (isNew) return { text: 'Never reviewed', style: { color: 'rgba(127,119,221,0.9)' } }
  if (daysOverdue > 1) return { text: `Overdue by ${daysOverdue}d`, style: { color: 'rgba(224,75,74,0.9)' } }
  if (daysOverdue === 1) return { text: 'Overdue by 1d', style: { color: 'rgba(239,159,39,0.9)' } }
  if (daysOverdue === 0) return { text: 'Due today', style: { color: 'rgba(127,119,221,0.9)' } }
  return { text: 'Due tomorrow', style: { color: 'rgba(255,255,255,0.3)' } }
}

export default function SmartRevision({ onRevisionComplete }) {
  const [dueItems, setDueItems] = useState([])
  const [revisedToday, setRevisedToday] = useState([])
  const [revisionStreak, setRevisionStreak] = useState(0)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const subjects = getSubjects()
    setDueItems(getDueRevisions(subjects))
    setRevisedToday(getTodayRevisionProgress())
    setRevisionStreak(getRevisionStreak())
  }, [])

  const handleRevised = (item) => {
    const key = `${item.subjectId}_${item.chapterId}_${item.topicId}`
    markTopicRevised(item.subjectId, item.chapterId, item.topicId)
    markRevisedToday(key)

    const updated = [...revisedToday, key]
    setRevisedToday(updated)
    setRevisionStreak(getRevisionStreak())

    if (onRevisionComplete) {
      onRevisionComplete()
    }
  }

  const isRevised = (item) => {
    const key = `${item.subjectId}_${item.chapterId}_${item.topicId}`
    return revisedToday.includes(key)
  }

  const totalDue = dueItems.length
  const doneCount = dueItems.filter(isRevised).length
  const progressPct = totalDue > 0 ? Math.round((doneCount / totalDue) * 100) : 100
  const allDone = totalDue === 0 || doneCount === totalDue

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '0.5px solid rgba(255,255,255,0.07)',
        borderRadius: 12,
        marginBottom: 16,
        overflow: 'hidden',
      }}
    >
      <div
        onClick={() => setCollapsed((prev) => !prev)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 15 }}>🧠</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>Smart revision for today</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
              {allDone
                ? 'All caught up!'
                : `${totalDue - doneCount} topic${totalDue - doneCount !== 1 ? 's' : ''} due`}
              {revisionStreak > 0 ? (
                <span style={{ marginLeft: 8, color: 'rgba(239,159,39,0.8)' }}>🔁 {revisionStreak}d revision streak</span>
              ) : null}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div
              style={{
                width: 60,
                height: 3,
                background: 'rgba(255,255,255,0.07)',
                borderRadius: 99,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progressPct}%`,
                  background: allDone ? 'rgba(99,153,34,0.8)' : 'rgba(127,119,221,0.8)',
                  borderRadius: 99,
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
              {doneCount}/{totalDue}
            </span>
          </div>
          <span
            style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.25)',
              transform: collapsed ? 'rotate(-90deg)' : 'rotate(0)',
              transition: 'transform 0.2s',
            }}
          >
            ▼
          </span>
        </div>
      </div>

      {!collapsed ? (
        <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.05)', padding: '0.75rem 1.25rem 1rem' }}>
          {allDone ? (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>✅</div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: 'rgba(151,196,89,1)',
                  marginBottom: 4,
                }}
              >
                You are fully caught up today!
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
                Start tomorrow&apos;s preview revisions below ↓
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {dueItems.map((item) => {
                const done = isRevised(item)
                const dueInfo = getDueLabel(item.daysOverdue, item.isNew)
                const diffStyle = DIFFICULTY_STYLE[item.difficulty] || DIFFICULTY_STYLE[2]
                const key = `${item.subjectId}_${item.chapterId}_${item.topicId}`

                return (
                  <div
                    key={key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '10px 12px',
                      borderRadius: 9,
                      background: done ? 'rgba(99,153,34,0.04)' : 'rgba(255,255,255,0.02)',
                      border: `0.5px solid ${
                        done
                          ? 'rgba(99,153,34,0.15)'
                          : item.daysOverdue > 1
                            ? 'rgba(224,75,74,0.2)'
                            : 'rgba(255,255,255,0.05)'
                      }`,
                      opacity: done ? 0.5 : 1,
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: done ? 'rgba(255,255,255,0.4)' : '#fff',
                          textDecoration: done ? 'line-through' : 'none',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.topicTitle}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                          {item.subjectName} · {item.chapterTitle}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 500, ...dueInfo.style }}>{dueInfo.text}</span>
                        <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 99, ...diffStyle }}>
                          {DIFFICULTY_LABELS[item.difficulty]}
                        </span>
                      </div>
                    </div>

                    {!done ? (
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <button
                          onClick={() => handleRevised(item)}
                          style={{
                            fontSize: 11,
                            padding: '5px 10px',
                            borderRadius: 6,
                            border: '0.5px solid rgba(127,119,221,0.35)',
                            background: 'rgba(127,119,221,0.1)',
                            color: 'rgba(175,169,236,1)',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={(event) => {
                            event.currentTarget.style.background = 'rgba(127,119,221,0.2)'
                          }}
                          onMouseLeave={(event) => {
                            event.currentTarget.style.background = 'rgba(127,119,221,0.1)'
                          }}
                        >
                          Revise now
                        </button>
                        <button
                          onClick={() => handleRevised(item)}
                          style={{
                            fontSize: 11,
                            padding: '5px 10px',
                            borderRadius: 6,
                            border: '0.5px solid rgba(99,153,34,0.35)',
                            background: 'rgba(99,153,34,0.1)',
                            color: 'rgba(151,196,89,1)',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={(event) => {
                            event.currentTarget.style.background = 'rgba(99,153,34,0.2)'
                          }}
                          onMouseLeave={(event) => {
                            event.currentTarget.style.background = 'rgba(99,153,34,0.1)'
                          }}
                        >
                          Done ✓
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: 11, color: 'rgba(151,196,89,0.8)', flexShrink: 0 }}>Revised ✓</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
