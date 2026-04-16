import { useEffect, useState } from 'react'
import {
  checkAndUpdateStreak,
  clearDailyChallenge,
  getDailyChallenge,
  getSubjects,
  isChallengeCompleted,
  markChallengeCompleted,
  saveDailyChallenge,
  saveXP,
  updateTopic,
} from '../utils/storage'
import { pickDailyChallenge } from '../utils/gemini'

export default function DailyChallenge({ onTopicComplete }) {
  const [challenge, setChallenge] = useState(null)
  const [completed, setCompleted] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initChallenge()
  }, [])

  const initChallenge = async () => {
    setLoading(true)

    const saved = getDailyChallenge()
    const today = new Date().toISOString().split('T')[0]

    if (saved && saved.date === today) {
      setChallenge(saved)
      setCompleted(isChallengeCompleted())
      setLoading(false)
      return
    }

    clearDailyChallenge()

    const subjects = getSubjects()
    const incompleteTopics = subjects.flatMap((subject) =>
      (subject.chapters || []).flatMap((chapter) =>
        (chapter.topics || [])
          .filter((topic) => !topic.completed)
          .map((topic) => ({
            ...topic,
            topicId: topic.id,
            subjectName: subject.subject,
            subjectId: subject.id,
            chapterId: chapter.id,
            chapterTitle: chapter.title,
          })),
      ),
    )

    if (incompleteTopics.length === 0) {
      setChallenge(null)
      setLoading(false)
      return
    }

    try {
      const result = await pickDailyChallenge(incompleteTopics)
      const picked = incompleteTopics[result.index] || incompleteTopics[0]
      const nextChallenge = {
        ...picked,
        reason: result.reason || 'Chosen to strengthen your foundation today.',
        date: today,
        bonusXP: 50,
      }
      saveDailyChallenge(nextChallenge)
      setChallenge(nextChallenge)
    } catch {
      const random = incompleteTopics[Math.floor(Math.random() * incompleteTopics.length)]
      const fallback = {
        ...random,
        reason: 'Randomly selected for today.',
        date: today,
        bonusXP: 50,
      }
      saveDailyChallenge(fallback)
      setChallenge(fallback)
    }

    setLoading(false)
  }

  const handleComplete = () => {
    if (!challenge || completed) {
      return
    }

    updateTopic(challenge.subjectId, challenge.chapterId, challenge.topicId, true)
    saveXP(10 + Number(challenge.bonusXP || 0))
    checkAndUpdateStreak()
    markChallengeCompleted()
    setCompleted(true)

    if (onTopicComplete) {
      onTopicComplete(challenge)
    }
  }

  if (loading) {
    return (
      <div
        style={{
          background: 'var(--surface-1)',
          border: '0.5px solid var(--border-soft)',
          borderRadius: 12,
          padding: '1rem 1.25rem',
          marginBottom: 16,
          fontSize: 12,
          color: 'var(--text-muted)',
        }}
      >
        Loading today's challenge...
      </div>
    )
  }

  if (!challenge) {
    return (
      <div
        style={{
          background: 'var(--surface-1)',
          border: '0.5px solid var(--border-soft)',
          borderRadius: 12,
          padding: '1rem 1.25rem',
          marginBottom: 16,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 20, marginBottom: 6 }}>🎉</div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--text-primary)',
          }}
        >
          All caught up!
        </div>
        <div
          style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            marginTop: 4,
          }}
        >
          You have no incomplete topics. Upload new notes to continue.
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        background: 'var(--surface-1)',
        border: `0.5px solid ${completed ? 'var(--border-soft)' : 'color-mix(in srgb, var(--accent) 50%, var(--border-soft))'}`,
        borderRadius: 12,
        padding: '1rem 1.25rem',
        marginBottom: 16,
        transition: 'border-color 0.25s ease, box-shadow 0.25s ease',
        boxShadow: completed ? 'none' : '0 0 0 1px color-mix(in srgb, var(--accent) 22%, transparent)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: completed ? 'var(--surface-2)' : 'color-mix(in srgb, var(--accent) 22%, var(--surface-2))',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
            }}
          >
            ⚡
          </span>
          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: completed ? 'var(--text-muted)' : 'var(--accent)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Today's challenge
          </div>
        </div>
        <div
          style={{
            fontSize: 11,
            padding: '3px 8px',
            borderRadius: 99,
            background: 'color-mix(in srgb, var(--accent) 18%, var(--surface-2))',
            color: 'var(--accent)',
            fontWeight: 500,
          }}
        >
          +{challenge.bonusXP} bonus XP
        </div>
      </div>

      <div
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: completed ? 'var(--text-muted)' : 'var(--text-primary)',
          marginBottom: 4,
          textDecoration: completed ? 'line-through' : 'none',
        }}
      >
        {challenge.title}
      </div>

      <div
        style={{
          fontSize: 11,
          color: completed ? 'var(--text-muted)' : 'var(--text-faint)',
          marginBottom: 10,
        }}
      >
        {challenge.subjectName} · {challenge.chapterTitle}
      </div>

      {challenge.reason ? (
        <div
          style={{
            fontSize: 11,
            color: 'var(--text-dim)',
            marginBottom: 12,
            fontStyle: 'italic',
            background: 'var(--surface-2)',
            border: '0.5px solid var(--border-soft)',
            borderRadius: 8,
            padding: '8px 10px',
          }}
        >
          "{challenge.reason}"
        </div>
      ) : null}

      {!completed ? (
        <button
          type="button"
          onClick={handleComplete}
          style={{
            width: '100%',
            padding: '9px 10px',
            background: 'var(--accent)',
            color: 'var(--text-primary)',
            border: 'none',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          Mark as Complete · +{10 + Number(challenge.bonusXP || 0)} XP
        </button>
      ) : (
        <div
          style={{
            textAlign: 'center',
            fontSize: 12,
            color: '#3B6D11',
            background: 'color-mix(in srgb, #3B6D11 12%, var(--surface-1))',
            border: '0.5px solid color-mix(in srgb, #3B6D11 30%, var(--border-soft))',
            borderRadius: 8,
            padding: '8px 10px',
          }}
        >
          ✓ Challenge completed · Come back tomorrow for a new one
        </div>
      )}
    </div>
  )
}
