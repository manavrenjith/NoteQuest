import { useEffect, useMemo, useState } from 'react'
import { getLeaderboard, submitScore } from '../utils/supabase'
import { getLevel, getStreak, getSubjects, getXP } from '../utils/storage'

export default function Leaderboard() {
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState(() => localStorage.getItem('nq_username') || '')
  const [inputName, setInputName] = useState(() => localStorage.getItem('nq_username') || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchScores()
  }, [])

  const fetchScores = async () => {
    setLoading(true)
    setError('')

    try {
      const data = await getLeaderboard()
      setScores(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err?.message || 'Could not load leaderboard.')
    }

    setLoading(false)
  }

  const handleSubmit = async () => {
    const selectedName = (username || inputName).trim()

    if (!selectedName || selectedName.length < 2) {
      setError('Name must be at least 2 characters.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const xp = getXP()
      const level = getLevel(xp)
      const subjects = getSubjects()
      const topicsCompleted = subjects
        .flatMap((subject) => (subject.chapters || []).flatMap((chapter) => chapter.topics || []))
        .filter((topic) => topic.completed).length

      await submitScore({
        username: selectedName,
        xp,
        level: level.title,
        subjectsCount: subjects.length,
        topicsCompleted,
        streak: getStreak(),
      })

      localStorage.setItem('nq_username', selectedName)
      setUsername(selectedName)
      setInputName(selectedName)
      await fetchScores()
    } catch (err) {
      setError(err?.message || 'Failed to submit. Try again.')
    }

    setSubmitting(false)
  }

  const myRank = useMemo(() => {
    if (!username) return 0
    return scores.findIndex((entry) => entry.username === username) + 1
  }, [scores, username])

  const medalColor = (rank) => {
    if (rank === 1) return '#EF9F27'
    if (rank === 2) return '#888780'
    if (rank === 3) return '#D85A30'
    return 'var(--color-text-secondary)'
  }

  return (
    <div
      style={{
        background: 'var(--color-background-primary)',
        border: '0.5px solid var(--color-border-tertiary)',
        borderRadius: 12,
        padding: '1rem 1.25rem',
        marginBottom: 16,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}>🏆 Leaderboard</div>
        {myRank > 0 ? (
          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Your rank: #{myRank}</div>
        ) : null}
      </div>

      {!username ? (
        <div
          style={{
            background: 'var(--color-background-secondary)',
            borderRadius: 8,
            padding: '10px 12px',
            marginBottom: 14,
          }}
        >
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
            Enter your name to join the leaderboard
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={inputName}
              onChange={(event) => setInputName(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && handleSubmit()}
              placeholder="Your name..."
              maxLength={20}
              style={{
                flex: 1,
                fontSize: 13,
                padding: '6px 10px',
                borderRadius: 8,
                border: '0.5px solid var(--color-border-secondary)',
                background: 'var(--color-background-primary)',
                color: 'var(--color-text-primary)',
              }}
            />
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                padding: '6px 14px',
                background: '#7F77DD',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                fontSize: 13,
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? '...' : 'Join'}
            </button>
          </div>
          {error ? <div style={{ fontSize: 11, color: '#D85A30', marginTop: 6 }}>{error}</div> : null}
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
            Playing as <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{username}</span>
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              fontSize: 11,
              padding: '4px 10px',
              background: 'transparent',
              color: '#7F77DD',
              border: '0.5px solid #7F77DD',
              borderRadius: 6,
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? 'Updating...' : 'Sync score'}
          </button>
        </div>
      )}

      {loading ? (
        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', padding: '1rem 0', textAlign: 'center' }}>
          Loading...
        </div>
      ) : (
        <div>
          {scores.map((entry, index) => {
            const rank = index + 1
            const isMe = entry.username === username

            return (
              <div
                key={entry.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  borderBottom: '0.5px solid var(--color-border-tertiary)',
                  background: isMe ? '#EEEDFE' : 'transparent',
                  borderRadius: isMe ? 6 : 0,
                  padding: isMe ? '8px 8px' : '8px 0',
                }}
              >
                <div
                  style={{
                    width: 20,
                    fontSize: 12,
                    fontWeight: 500,
                    color: medalColor(rank),
                    textAlign: 'center',
                    flexShrink: 0,
                  }}
                >
                  {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : rank}
                </div>

                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: isMe ? '#7F77DD' : 'var(--color-background-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 500,
                    flexShrink: 0,
                    color: isMe ? 'white' : 'var(--color-text-secondary)',
                  }}
                >
                  {String(entry.username || '').slice(0, 2).toUpperCase()}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: isMe ? 500 : 400,
                      color: isMe ? '#3C3489' : 'var(--color-text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {entry.username}
                    {isMe ? <span style={{ fontSize: 10, color: '#7F77DD', marginLeft: 4 }}>you</span> : null}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>
                    {entry.level} · {entry.topics_completed} topics
                  </div>
                </div>

                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: isMe ? '#534AB7' : 'var(--color-text-primary)',
                    flexShrink: 0,
                  }}
                >
                  {entry.xp} XP
                </div>
              </div>
            )
          })}
        </div>
      )}

      {error && username ? <div style={{ fontSize: 11, color: '#D85A30', marginTop: 8 }}>{error}</div> : null}

      <button
        type="button"
        onClick={fetchScores}
        style={{
          marginTop: 10,
          width: '100%',
          padding: '6px',
          background: 'transparent',
          fontSize: 11,
          color: 'var(--color-text-secondary)',
          border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: 6,
          cursor: 'pointer',
        }}
      >
        Refresh leaderboard
      </button>
    </div>
  )
}
