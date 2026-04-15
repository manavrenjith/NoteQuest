import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CertificateModal from '../components/CertificateModal'
import DailyChallenge from '../components/DailyChallenge'
import Leaderboard from '../components/Leaderboard'
import LevelUpModal from '../components/LevelUpModal'
import Roadmap from '../components/Roadmap'
import StudyHeatmap from '../components/StudyHeatmap'
import VelocityChart from '../components/VelocityChart'
import {
  checkAndUpdateStreak,
  estimateSubjectTime,
  getCompletionEstimate,
  getLevel,
  getStreak,
  getSubjects,
  getWeakTopics,
  getXP,
  saveXP,
  updateTopic,
} from '../utils/storage'

function getSubjectEmoji(name = '') {
  const n = String(name).toLowerCase()
  if (n.includes('math') || n.includes('algebra') || n.includes('calculus')) return '📐'
  if (n.includes('chemistry') || n.includes('chem')) return '🧪'
  if (n.includes('physics')) return '⚡'
  if (n.includes('cs') || n.includes('computer') || n.includes('programming') || n.includes('data structure')) return '💻'
  if (n.includes('biology') || n.includes('bio')) return '🧬'
  if (n.includes('history')) return '📖'
  if (n.includes('english') || n.includes('literature')) return '✍️'
  if (n.includes('economics') || n.includes('econ')) return '📊'
  return '📚'
}

function getProgress(subject) {
  const chapters = subject?.chapters || []
  const totalTopics = chapters.reduce((count, chapter) => count + (chapter?.topics || []).length, 0)
  const completedTopics = chapters.reduce(
    (count, chapter) => count + (chapter?.topics || []).filter((topic) => Boolean(topic.completed)).length,
    0,
  )

  const ratio = totalTopics > 0 ? completedTopics / totalTopics : 0
  return {
    totalTopics,
    completedTopics,
    ratio,
    percent: Math.round(ratio * 100),
    isCompleted: totalTopics > 0 && completedTopics === totalTopics,
  }
}

function formatAddedDate(value) {
  if (!value) return 'Unknown date'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Unknown date'
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function sortSubjects(items, sortBy) {
  const sorted = [...items]

  if (sortBy === 'most_progress') {
    return sorted.sort((a, b) => getProgress(b).ratio - getProgress(a).ratio)
  }

  if (sortBy === 'least_progress') {
    return sorted.sort((a, b) => getProgress(a).ratio - getProgress(b).ratio)
  }

  if (sortBy === 'az') {
    return sorted.sort((a, b) => String(a.subject || '').localeCompare(String(b.subject || '')))
  }

  return sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
}

function getStatusBadge(progress) {
  if (progress.isCompleted) {
    return {
      label: 'Completed',
      className: 'bg-lime-100 text-lime-800',
    }
  }

  if (progress.completedTopics > 0) {
    return {
      label: 'In progress',
      className: 'text-indigo-800',
      style: { backgroundColor: '#EEEDFE', color: '#534AB7' },
    }
  }

  return {
    label: 'Not started',
    className: 'text-[#888] border border-[#2a2a2a]',
    style: { backgroundColor: '#0d0d0d' },
  }
}

function getWeakTopicCount(subject) {
  const weak = getWeakTopics()
  return (subject?.chapters || []).reduce((sum, chapter) => {
    const chapterCount = (chapter?.topics || []).filter((topic) => {
      return Boolean(weak[`${subject.id}_${chapter.id}_${topic.id}`])
    }).length
    return sum + chapterCount
  }, 0)
}

function getEstimateColor(days) {
  if (days <= 3) return '#3B6D11'
  if (days <= 7) return '#534AB7'
  return 'var(--color-text-secondary)'
}

function getEstimateEmoji(days) {
  if (days <= 3) return '🔥'
  if (days <= 7) return '⚡'
  return '📅'
}

function Dashboard() {
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState([])
  const [expandedMap, setExpandedMap] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('most_progress')
  const [xp, setXP] = useState(() => getXP())
  const [streak, setStreak] = useState(() => getStreak())
  const [isLevelUpOpen, setIsLevelUpOpen] = useState(false)
  const [newLevelTitle, setNewLevelTitle] = useState('')
  const [certSubject, setCertSubject] = useState(null)
  const [shownCerts, setShownCerts] = useState(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('nq_shown_certs') || '[]')
      return Array.isArray(parsed) ? parsed : []
    } catch (error) {
      return []
    }
  })
  const [cardsVisible, setCardsVisible] = useState(false)
  const [subjectViews, setSubjectViews] = useState({})

  useEffect(() => {
    const nextSubjects = getSubjects()
    setSubjects(nextSubjects)
    setXP(getXP())
    setStreak(getStreak())

    setExpandedMap(
      nextSubjects.reduce((acc, subject) => {
        acc[subject.id] = false
        return acc
      }, {}),
    )

    setSubjectViews(
      nextSubjects.reduce((acc, subject) => {
        acc[subject.id] = 'list'
        return acc
      }, {}),
    )

    const frame = window.requestAnimationFrame(() => setCardsVisible(true))
    return () => window.cancelAnimationFrame(frame)
  }, [])

  const checkCompletion = (subject, wasCompleted = false) => {
    if (!subject || wasCompleted) {
      return
    }

    const allTopics = (subject.chapters || []).flatMap((chapter) => chapter.topics || [])
    const allDone = allTopics.length > 0 && allTopics.every((topic) => Boolean(topic.completed))

    if (!allDone) {
      return
    }

    setShownCerts((prev) => {
      if (prev.includes(subject.id)) {
        return prev
      }

      const updated = [...prev, subject.id]
      localStorage.setItem('nq_shown_certs', JSON.stringify(updated))
      setCertSubject(subject)
      saveXP(200)

      import('canvas-confetti').then((module) =>
        module.default({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
        }),
      )

      return updated
    })
  }

  const level = useMemo(() => getLevel(xp), [xp])
  const nextLevel = useMemo(() => {
    const candidate = getLevel((level.next || level.minXP) + 1)
    return candidate.level === level.level ? null : candidate
  }, [level])

  const xpProgress = useMemo(() => {
    if (!level.next) {
      return {
        current: xp,
        target: xp,
        percent: 100,
        text: `${xp} XP maxed`,
      }
    }

    const range = Math.max(1, level.next - level.minXP)
    const currentInLevel = Math.max(0, xp - level.minXP)
    const percent = Math.max(0, Math.min(100, Math.round((currentInLevel / range) * 100)))

    return {
      current: xp,
      target: level.next,
      percent,
      text: `${xp} / ${level.next} XP to ${nextLevel?.title || 'Next level'}`,
    }
  }, [level, nextLevel, xp])

  const stats = useMemo(() => {
    const totalTopicsDone = subjects.reduce((sum, subject) => sum + getProgress(subject).completedTopics, 0)

    return {
      totalXP: xp,
      subjects: subjects.length,
      topicsDone: totalTopicsDone,
      streakDays: streak,
    }
  }, [subjects, streak, xp])

  const filteredSubjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return subjects

    return subjects.filter((subject) => String(subject.subject || '').toLowerCase().includes(query))
  }, [searchQuery, subjects])

  const groupedSubjects = useMemo(() => {
    const inProgress = []
    const completed = []

    filteredSubjects.forEach((subject) => {
      if (getProgress(subject).isCompleted) {
        completed.push(subject)
      } else {
        inProgress.push(subject)
      }
    })

    return {
      inProgress: sortSubjects(inProgress, sortBy),
      completed: sortSubjects(completed, sortBy),
    }
  }, [filteredSubjects, sortBy])

  const handleToggleSubject = (subjectId) => {
    setExpandedMap((prev) => ({ ...prev, [subjectId]: !prev[subjectId] }))
  }

  const handleSetSubjectView = (subjectId, view) => {
    setSubjectViews((prev) => ({ ...prev, [subjectId]: view }))
  }

  const handleRoadmapUpdate = (updatedSubject) => {
    if (!updatedSubject?.id) return

    const before = subjects.find((subject) => subject.id === updatedSubject.id)
    const wasCompleted = before ? getProgress(before).isCompleted : false
    const updatedProgress = getProgress(updatedSubject)

    setSubjects((prev) => prev.map((subject) => (subject.id === updatedSubject.id ? updatedSubject : subject)))

    checkCompletion(updatedSubject, wasCompleted)

    const nextXP = getXP()
    const previousLevel = getLevel(xp)
    const latestLevel = getLevel(nextXP)

    if (latestLevel.level > previousLevel.level) {
      setNewLevelTitle(latestLevel.title)
      setIsLevelUpOpen(true)
    }

    setXP(nextXP)
    setStreak(getStreak())
  }

  const handleToggleTopic = (subjectId, chapterId, topicId, nextChecked) => {
    const before = subjects.find((item) => item.id === subjectId)
    if (!before) return

    const previousSubjectProgress = getProgress(before)
    const previousChapter = (before.chapters || []).find((chapter) => chapter.id === chapterId)
    const wasTopicCompleted = Boolean((previousChapter?.topics || []).find((topic) => topic.id === topicId)?.completed)
    const wasChapterCompleted =
      (previousChapter?.topics || []).length > 0 &&
      (previousChapter?.topics || []).every((topic) => Boolean(topic.completed))

    const updatedSubject = updateTopic(subjectId, chapterId, topicId, nextChecked)
    if (!updatedSubject) return

    if (nextChecked && !wasTopicCompleted) {
      saveXP(10)
      const nextStreak = checkAndUpdateStreak()
      setStreak(nextStreak)
    }

    const updatedChapter = (updatedSubject.chapters || []).find((chapter) => chapter.id === chapterId)
    const isChapterCompleted =
      (updatedChapter?.topics || []).length > 0 &&
      (updatedChapter?.topics || []).every((topic) => Boolean(topic.completed))

    if (!wasChapterCompleted && isChapterCompleted) {
      saveXP(50)
    }

    const updatedProgress = getProgress(updatedSubject)
    checkCompletion(updatedSubject, previousSubjectProgress.isCompleted)

    const nextXP = getXP()
    const previousLevel = getLevel(xp)
    const latestLevel = getLevel(nextXP)

    if (latestLevel.level > previousLevel.level) {
      setNewLevelTitle(latestLevel.title)
      setIsLevelUpOpen(true)
    }

    setXP(nextXP)
    setSubjects(getSubjects())
  }

  const goToUpload = () => {
    navigate('/upload')
  }

  const renderListView = (subject) => (
    <div>
      {(subject.chapters || []).map((chapter) => (
        <section key={chapter.id} className="mb-4 last:mb-0">
          <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-[#666]">
            {chapter.title || 'Untitled chapter'}
          </h4>
          <div className="space-y-2">
            {(chapter.topics || []).map((topic) => (
              <label
                key={topic.id}
                className="flex items-center gap-3 rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] px-3 py-2"
              >
                <input
                  type="checkbox"
                  checked={Boolean(topic.completed)}
                  onChange={(event) => handleToggleTopic(subject.id, chapter.id, topic.id, event.target.checked)}
                  style={{ accentColor: '#7F77DD' }}
                  className="h-4 w-4 shrink-0"
                />
                <span
                  className={`min-w-0 flex-1 text-sm ${
                    topic.completed ? 'text-[#555] line-through' : 'text-white'
                  }`}
                >
                  {topic.title || 'Untitled topic'}
                </span>
                <span className="max-w-48 truncate text-right text-xs text-[#666]">{topic.description || ''}</span>
              </label>
            ))}
          </div>
        </section>
      ))}
    </div>
  )

  const renderExpandedContent = (subject) => {
    const view = subjectViews[subject.id] || 'list'
    const estimate = getCompletionEstimate(subject)
    const remainingTopics = (subject.chapters || []).flatMap((chapter) => chapter.topics || []).filter((topic) => !topic.completed).length

    return (
      <div className="border-t border-[#1a1a1a] bg-[#0a0a0a] px-4 py-4">
        {estimate && !estimate.done ? (
          <div
            style={{
              background: '#0d0d0d',
              border: '0.5px solid #1a1a1a',
              borderRadius: 8,
              padding: '8px 12px',
              fontSize: 12,
              color: '#888',
              marginBottom: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            📅 {estimate.message}
            <span style={{ marginLeft: 'auto', fontSize: 11 }}>{remainingTopics} topics remaining</span>
          </div>
        ) : null}

        <div className="mb-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSetSubjectView(subject.id, 'list')}
            className={`rounded-full border border-[#2a2a2a] px-3 py-1 text-xs transition ${
              view === 'list' ? 'text-white' : 'text-[#888] hover:text-white'
            }`}
            style={{ backgroundColor: view === 'list' ? '#7F77DD' : 'transparent' }}
          >
            List view
          </button>
          <button
            type="button"
            onClick={() => handleSetSubjectView(subject.id, 'roadmap')}
            className={`rounded-full border border-[#2a2a2a] px-3 py-1 text-xs transition ${
              view === 'roadmap' ? 'text-white' : 'text-[#888] hover:text-white'
            }`}
            style={{ backgroundColor: view === 'roadmap' ? '#7F77DD' : 'transparent' }}
          >
            Roadmap view
          </button>
        </div>

        {view === 'roadmap' ? (
          <Roadmap subject={subject} onUpdate={handleRoadmapUpdate} />
        ) : (
          renderListView(subject)
        )}
      </div>
    )
  }

  const hasAnySubjects = subjects.length > 0

  return (
    <main className="min-h-screen bg-black text-white">
      <LevelUpModal levelTitle={newLevelTitle} isOpen={isLevelUpOpen} onClose={() => setIsLevelUpOpen(false)} />
      {certSubject ? (
        <CertificateModal
          subject={certSubject}
          xp={getXP()}
          level={getLevel(getXP())}
          onClose={() => setCertSubject(null)}
        />
      ) : null}

      <header className="sticky top-0 z-30 border-b border-[#1a1a1a] bg-[rgba(0,0,0,0.96)] backdrop-blur-[8px]">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: '#7F77DD' }} aria-hidden="true" />
            <span style={{ fontSize: '15px', fontWeight: 500 }}>NoteQuest</span>
          </button>
          <nav className="flex items-center gap-4 text-sm sm:gap-6">
            <button type="button" className="font-semibold text-white" onClick={() => navigate('/dashboard')}>
              Dashboard
            </button>
            <button type="button" className="text-[#888] transition hover:text-white" onClick={goToUpload}>
              Upload notes
            </button>
            <button
              type="button"
              className="text-[#888] transition hover:text-white"
              onClick={() => navigate('/settings')}
            >
              Settings
            </button>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-7">

        <DailyChallenge
          onTopicComplete={() => {
            setSubjects(getSubjects())
            setXP(getXP())
            setStreak(getStreak())
          }}
        />

        <section className="mt-5 rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] px-4 py-4 sm:px-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-sm font-medium text-white">
              {level.title} Lv. {level.level}
            </div>

            <div className="w-full md:max-w-lg">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1a1a1a]">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${xpProgress.percent}%`, backgroundColor: '#7F77DD' }}
                />
              </div>
              <p className="mt-2 text-xs text-[#888]">{xpProgress.text}</p>
            </div>

            <div className="flex items-center gap-2 text-sm text-[#b0b0b0]">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-400" aria-hidden="true" />
              <span>{streak} day streak</span>
            </div>
          </div>
        </section>

        <section className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: 'Total XP', value: stats.totalXP },
            { label: 'Subjects', value: stats.subjects },
            { label: 'Topics done', value: stats.topicsDone },
            { label: 'Streak', value: `${stats.streakDays} days` },
          ].map((item) => (
            <article key={item.label} className="rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] px-4 py-4">
              <p className="text-xs text-[#888]">{item.label}</p>
              <p className="mt-1 text-xl font-medium text-white">{item.value}</p>
            </article>
          ))}
        </section>

        <section className="mt-5">
          <StudyHeatmap />
          <VelocityChart />
        </section>

        <Leaderboard />

        <section className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-medium text-white">Your subjects</h2>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <label className="w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search subjects"
                className="w-full rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 text-sm text-white placeholder-[#666] focus:border-[#444] focus:outline-none"
              />
            </label>

            <div className="flex items-center gap-2">
              <span className="hidden text-xs text-[#888] sm:block">Sort</span>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="rounded-lg border border-[#2a2a2a] bg-[#0a0a0a] px-3 py-2 text-sm text-white focus:border-[#444] focus:outline-none"
              >
                <option value="most_progress">Most progress</option>
                <option value="least_progress">Least progress</option>
                <option value="recent">Recently added</option>
                <option value="az">A to Z</option>
              </select>
            </div>
          </div>
        </section>

        {!hasAnySubjects ? (
          <section className="mt-10 rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] px-6 py-12 text-center">
            <div className="text-5xl" aria-hidden="true">
              📭
            </div>
            <h3 className="mt-4 text-xl font-medium text-white">No subjects yet</h3>
            <p className="mt-2 text-sm text-[#888]">
              Upload your notes and AI will build your syllabus automatically
            </p>
            <button
              type="button"
              onClick={goToUpload}
              className="mt-6 rounded-lg border border-[#2a2a2a] bg-transparent px-4 py-2 text-sm text-white transition hover:border-[#444]"
            >
              Upload your first notes {'->'}
            </button>
          </section>
        ) : filteredSubjects.length === 0 ? (
          <section className="mt-6 rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] px-5 py-8 text-center text-sm text-[#888]">
            No subjects match your search.
          </section>
        ) : (
          <section className="mt-5 space-y-3">
            {groupedSubjects.inProgress.map((subject, index) => {
              const progress = getProgress(subject)
              const isExpanded = Boolean(expandedMap[subject.id])
              const status = getStatusBadge(progress)
              const addedDate = formatAddedDate(subject.createdAt)
              const weakCount = getWeakTopicCount(subject)
              const estimate = getCompletionEstimate(subject)
              const allDone = progress.isCompleted

              return (
                <article
                  key={subject.id}
                  className="overflow-hidden rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] transition-opacity duration-300"
                  style={{
                    opacity: cardsVisible ? 1 : 0,
                    transitionDelay: `${index * 50}ms`,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleToggleSubject(subject.id)}
                    className="w-full px-4 py-4 text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#111] text-base">
                          {getSubjectEmoji(subject.subject)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-medium text-white">{subject.subject || 'Untitled Subject'}</h3>
                          <p className="mt-1 text-xs text-[#888]">
                            {progress.completedTopics} / {progress.totalTopics} topics · {estimateSubjectTime(subject)} total
                            · Added {addedDate}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
                          style={status.style}
                        >
                          {status.label}
                        </span>
                        <span
                          className="text-[#888] transition-transform duration-200"
                          style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                          aria-hidden="true"
                        >
                          ▼
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-1 w-full overflow-hidden rounded-full bg-[#1a1a1a]">
                        <div
                          className="h-full transition-all duration-500"
                          style={{
                            width: `${progress.percent}%`,
                            backgroundColor: progress.isCompleted ? '#639922' : '#7F77DD',
                            transitionProperty: 'width',
                            transitionDuration: '0.4s',
                            transitionTimingFunction: 'ease',
                          }}
                        />
                      </div>
                      <span className="text-xs text-[#888]">{progress.percent}%</span>
                    </div>

                    {!allDone && estimate && !estimate.done ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 11,
                          marginTop: 6,
                          color: getEstimateColor(estimate.days),
                        }}
                      >
                        <span>{getEstimateEmoji(estimate.days)}</span>
                        <span>{estimate.message}</span>
                      </div>
                    ) : null}

                    {!allDone && !estimate ? (
                      <div style={{ fontSize: 11, marginTop: 6, color: '#666' }}>
                        Start studying to see your completion estimate
                      </div>
                    ) : null}

                    {weakCount > 0 ? (
                      <p className="mt-2 text-xs text-amber-700">
                        ⚠ {weakCount} topic{weakCount > 1 ? 's' : ''} need review
                      </p>
                    ) : null}
                  </button>

                  {isExpanded ? renderExpandedContent(subject) : null}
                </article>
              )
            })}

            {groupedSubjects.completed.length > 0 ? (
              <div className="py-2">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-[#1a1a1a]" />
                  <span className="text-xs uppercase tracking-wide text-[#666]">completed</span>
                  <div className="h-px flex-1 bg-[#1a1a1a]" />
                </div>
              </div>
            ) : null}

            {groupedSubjects.completed.map((subject, index) => {
              const progress = getProgress(subject)
              const isExpanded = Boolean(expandedMap[subject.id])
              const status = getStatusBadge(progress)
              const addedDate = formatAddedDate(subject.createdAt)
              const weakCount = getWeakTopicCount(subject)
              const estimate = getCompletionEstimate(subject)
              const allDone = progress.isCompleted

              return (
                <article
                  key={subject.id}
                  className="overflow-hidden rounded-xl border border-[#1a1a1a] bg-[#0a0a0a] transition-opacity duration-300"
                  style={{
                    opacity: cardsVisible ? 1 : 0,
                    transitionDelay: `${(groupedSubjects.inProgress.length + index) * 50}ms`,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleToggleSubject(subject.id)}
                    className="w-full px-4 py-4 text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#111] text-base">
                          {getSubjectEmoji(subject.subject)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-medium text-white">{subject.subject || 'Untitled Subject'}</h3>
                          <p className="mt-1 text-xs text-[#888]">
                            {progress.completedTopics} / {progress.totalTopics} topics · {estimateSubjectTime(subject)} total
                            · Added {addedDate}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${status.className}`}
                          style={status.style}
                        >
                          {status.label}
                        </span>
                        <span
                          className="text-[#888] transition-transform duration-200"
                          style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                          aria-hidden="true"
                        >
                          ▼
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      <div className="h-1 w-full overflow-hidden rounded-full bg-[#1a1a1a]">
                        <div
                          className="h-full transition-all duration-500"
                          style={{
                            width: `${progress.percent}%`,
                            backgroundColor: progress.isCompleted ? '#639922' : '#7F77DD',
                            transitionProperty: 'width',
                            transitionDuration: '0.4s',
                            transitionTimingFunction: 'ease',
                          }}
                        />
                      </div>
                      <span className="text-xs text-[#888]">{progress.percent}%</span>
                    </div>

                    {!allDone && estimate && !estimate.done ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 11,
                          marginTop: 6,
                          color: getEstimateColor(estimate.days),
                        }}
                      >
                        <span>{getEstimateEmoji(estimate.days)}</span>
                        <span>{estimate.message}</span>
                      </div>
                    ) : null}

                    {!allDone && !estimate ? (
                      <div style={{ fontSize: 11, marginTop: 6, color: '#666' }}>
                        Start studying to see your completion estimate
                      </div>
                    ) : null}

                    {weakCount > 0 ? (
                      <p className="mt-2 text-xs text-amber-700">
                        ⚠ {weakCount} topic{weakCount > 1 ? 's' : ''} need review
                      </p>
                    ) : null}
                  </button>

                  {isExpanded ? renderExpandedContent(subject) : null}
                </article>
              )
            })}

            <button
              type="button"
              onClick={goToUpload}
              className="mt-2 w-full rounded-xl border-2 border-dashed border-[#2a2a2a] bg-transparent px-4 py-4 text-center text-sm font-medium text-[#bbb] transition hover:border-[#444]"
            >
              + Add new subject
            </button>
          </section>
        )}
      </div>
    </main>
  )
}

export default Dashboard
