import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronRight, Plus, Search, Trash2 } from 'lucide-react'
import confetti from 'canvas-confetti'
import ProgressBar from '../components/ProgressBar'
import TopicBoard from '../components/TopicBoard'
import XPBar from '../components/XPBar'
import StatsPanel from '../components/StatsPanel'
import BadgeCard from '../components/BadgeCard'
import LevelUpModal from '../components/LevelUpModal'
import Navbar from '../components/Navbar'
import OnboardingModal from '../components/OnboardingModal'
import { useToast } from '../hooks/useToast'
import { checkBadges, deleteSubject, getLevel, getStreak, getSubjects, getXP, saveXP } from '../utils/storage'

const ONBOARDED_KEY = 'notequest_onboarded'

function getSubjectEmoji(name = '') {
  const lower = name.toLowerCase()
  if (/(math|algebra|geometry|calculus|statistics|trigonometry)/.test(lower)) return '📐'
  if (/(chemistry|organic|inorganic|biochem)/.test(lower)) return '🧪'
  if (/(computer|coding|programming|software|cs|data structure|algorithm)/.test(lower)) return '💻'
  if (/(physics|mechanics|quantum|thermo)/.test(lower)) return '⚛️'
  if (/(biology|botany|zoology|genetics)/.test(lower)) return '🧬'
  if (/(history|civics|politics|geography)/.test(lower)) return '🌍'
  return '📘'
}

function getProgress(subject) {
  const totalTopics = (subject.chapters || []).reduce(
    (chapterCount, chapter) => chapterCount + (chapter.topics || []).length,
    0,
  )

  const completedTopics = (subject.chapters || []).reduce(
    (chapterCount, chapter) =>
      chapterCount + (chapter.topics || []).filter((topic) => Boolean(topic.completed)).length,
    0,
  )

  return { totalTopics, completedTopics }
}

function Dashboard() {
  const navigate = useNavigate()
  const { info } = useToast()
  const [subjects, setSubjects] = useState(() => getSubjects())
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [showOnboarding, setShowOnboarding] = useState(() => {
    const hasSeen = localStorage.getItem(ONBOARDED_KEY) === 'true'
    return !hasSeen && getSubjects().length === 0
  })
  const [expanded, setExpanded] = useState(() =>
    getSubjects().reduce((acc, subject) => {
      acc[subject.id] = true
      return acc
    }, {}),
  )
  const [xp, setXP] = useState(() => getXP())
  const [streak, setStreak] = useState(() => getStreak())
  const [badges, setBadges] = useState(() => checkBadges(getSubjects(), getStreak()))
  const [isLevelUpOpen, setIsLevelUpOpen] = useState(false)
  const [newLevelTitle, setNewLevelTitle] = useState('')
  const [subjectCompleteOverlay, setSubjectCompleteOverlay] = useState('')
  const [completedSubjects, setCompletedSubjects] = useState(() => {
    const existingSubjects = getSubjects()
    const completedIds = existingSubjects
      .filter((subject) => {
        const progress = getProgress(subject)
        return progress.totalTopics > 0 && progress.completedTopics === progress.totalTopics
      })
      .map((subject) => subject.id)

    return new Set(completedIds)
  })
  const previousXPRef = useRef(getXP())

  const applyXPUpdate = (nextXP) => {
    const previousLevel = getLevel(previousXPRef.current)
    const currentLevel = getLevel(nextXP)

    if (currentLevel.level > previousLevel.level) {
      setNewLevelTitle(currentLevel.title)
      setIsLevelUpOpen(true)
    }

    previousXPRef.current = nextXP
    setXP(nextXP)
  }

  const orderedSubjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const filtered = [...subjects].filter((subject) =>
      String(subject.subject || '').toLowerCase().includes(normalizedQuery),
    )

    if (sortBy === 'progress_desc') {
      return filtered.sort((a, b) => {
        const aProgress = getProgress(a)
        const bProgress = getProgress(b)
        const aRatio = aProgress.totalTopics ? aProgress.completedTopics / aProgress.totalTopics : 0
        const bRatio = bProgress.totalTopics ? bProgress.completedTopics / bProgress.totalTopics : 0
        return bRatio - aRatio
      })
    }

    if (sortBy === 'progress_asc') {
      return filtered.sort((a, b) => {
        const aProgress = getProgress(a)
        const bProgress = getProgress(b)
        const aRatio = aProgress.totalTopics ? aProgress.completedTopics / aProgress.totalTopics : 0
        const bRatio = bProgress.totalTopics ? bProgress.completedTopics / bProgress.totalTopics : 0
        return aRatio - bRatio
      })
    }

    if (sortBy === 'az') {
      return filtered.sort((a, b) => String(a.subject || '').localeCompare(String(b.subject || '')))
    }

    return filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
  }, [query, sortBy, subjects])

  const handleDeleteSubject = (subjectId, subjectName) => {
    const confirmed = window.confirm(`Delete ${subjectName}? This cannot be undone.`)
    if (!confirmed) {
      return
    }

    const nextSubjects = deleteSubject(subjectId)
    setSubjects(nextSubjects)
    setBadges(checkBadges(nextSubjects, streak))
    setExpanded((prev) => {
      const next = { ...prev }
      delete next[subjectId]
      return next
    })
    setCompletedSubjects((current) => {
      const next = new Set(current)
      next.delete(subjectId)
      return next
    })
    info('Subject deleted')
  }

  const closeOnboarding = () => {
    localStorage.setItem(ONBOARDED_KEY, 'true')
    setShowOnboarding(false)
  }

  const handleOnboardingUpload = () => {
    closeOnboarding()
    navigate('/#upload')
  }

  const handleSubjectUpdate = (updatedSubject) => {
    setSubjects((prev) => {
      const next = prev.map((subject) => (subject.id === updatedSubject.id ? updatedSubject : subject))
      setBadges(checkBadges(next, streak))
      return next
    })
  }

  const handleGamificationEvent = ({ updatedSubject, streak: updatedStreak, currentXP }) => {
    if (typeof currentXP === 'number') {
      applyXPUpdate(currentXP)
    }

    const nextStreak = typeof updatedStreak === 'number' ? updatedStreak : streak
    if (typeof updatedStreak === 'number') {
      setStreak(updatedStreak)
    }

    setSubjects((prev) => {
      const previousSubject = prev.find((subject) => subject.id === updatedSubject.id)
      const previousProgress = previousSubject ? getProgress(previousSubject) : { totalTopics: 0, completedTopics: 0 }
      const updatedProgress = getProgress(updatedSubject)
      const wasComplete =
        previousProgress.totalTopics > 0 && previousProgress.completedTopics === previousProgress.totalTopics
      const isComplete = updatedProgress.totalTopics > 0 && updatedProgress.completedTopics === updatedProgress.totalTopics

      const next = prev.map((subject) => (subject.id === updatedSubject.id ? updatedSubject : subject))

      if (!wasComplete && isComplete && !completedSubjects.has(updatedSubject.id)) {
        saveXP(200)
        const latestXP = getXP()
        applyXPUpdate(latestXP)
        setSubjectCompleteOverlay(updatedSubject.subject || 'Subject')
        window.setTimeout(() => setSubjectCompleteOverlay(''), 2000)

        setCompletedSubjects((current) => {
          const cloned = new Set(current)
          cloned.add(updatedSubject.id)
          return cloned
        })

        confetti({ particleCount: 90, spread: 75, origin: { y: 0.62 } })
      }

      setBadges(checkBadges(next, nextStreak))
      return next
    })
  }

  const toggleExpand = (subjectId) => {
    setExpanded((prev) => ({ ...prev, [subjectId]: !prev[subjectId] }))
  }

  const totalSubjects = subjects.length
  const totalCompletedTopics = subjects.reduce((sum, subject) => sum + getProgress(subject).completedTopics, 0)

  const badgeItems = [
    {
      key: 'firstTopic',
      title: 'First Topic ✅',
      description: 'Complete your first topic',
    },
    {
      key: 'chapterChampion',
      title: 'Chapter Champion 🏆',
      description: 'Complete a full chapter',
    },
    {
      key: 'subjectMaster',
      title: 'Subject Master 🎓',
      description: 'Complete all topics in a subject',
    },
    {
      key: 'streak3',
      title: '3 Day Streak 🔥',
      description: 'Maintain a 3 day streak',
    },
    {
      key: 'streak5',
      title: '5 Day Streak ⚡',
      description: 'Maintain a 5 day streak',
    },
  ]

  const hasUnlockedBadges = Object.values(badges).some(Boolean)

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar />
      <OnboardingModal isOpen={showOnboarding} onClose={closeOnboarding} onGoUpload={handleOnboardingUpload} />
      <LevelUpModal levelTitle={newLevelTitle} isOpen={isLevelUpOpen} onClose={() => setIsLevelUpOpen(false)} />
      {subjectCompleteOverlay ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 px-4 animate-[fadeIn_200ms_ease-out]">
          <div className="rounded-2xl border border-green-400/30 bg-slate-900/90 px-8 py-6 text-center shadow-2xl shadow-green-900/20 animate-[scaleIn_220ms_ease-out]">
            <p className="text-sm uppercase tracking-wide text-green-300">Subject Complete</p>
            <h3 className="mt-2 text-3xl font-black text-white">{subjectCompleteOverlay} 🎓</h3>
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
        <XPBar xp={xp} streak={streak} />
        <StatsPanel
          totalCompletedTopics={totalCompletedTopics}
          totalSubjects={totalSubjects}
          streak={streak}
          xp={xp}
        />

        <section className="mb-8 rounded-2xl border border-slate-700 bg-slate-800/70 p-4">
          <h2 className="mb-4 text-xl font-semibold text-white">Badges</h2>
          {hasUnlockedBadges ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {badgeItems.map((badge) => (
                <BadgeCard
                  key={badge.key}
                  title={badge.title}
                  description={badge.description}
                  unlocked={Boolean(badges[badge.key])}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-4 text-sm text-slate-300">
              Complete topics to unlock badges
            </div>
          )}
        </section>

        <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Dashboard</h1>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate('/settings')}
              className="inline-flex items-center justify-center rounded-xl border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-100 transition hover:border-indigo-400 hover:text-white"
            >
              Settings
            </button>
            <button
              type="button"
              onClick={() => navigate('/#upload')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400"
            >
              <Plus className="h-4 w-4" />
              Add New Subject
            </button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_220px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search subjects..."
              className="w-full rounded-xl border border-slate-600 bg-slate-800 px-9 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </label>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="rounded-xl border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm font-medium text-slate-100 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            <option value="recent">Sort by: Recently Added</option>
            <option value="progress_desc">Sort by: Most Progress</option>
            <option value="progress_asc">Sort by: Least Progress</option>
            <option value="az">Sort by: A-Z</option>
          </select>
        </div>

        {subjects.length === 0 ? (
          <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-8 text-center text-slate-300">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/20 text-3xl">
              📚
            </div>
            <p className="text-lg font-semibold text-slate-100">Upload your first notes to get started</p>
            <button
              type="button"
              onClick={() => navigate('/#upload')}
              className="mt-5 inline-flex rounded-xl bg-indigo-500 px-6 py-3 font-semibold text-white transition hover:bg-indigo-400"
            >
              Upload Notes
            </button>
          </div>
        ) : orderedSubjects.length === 0 ? (
          <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-8 text-center text-slate-300">
            No subjects match your search.
          </div>
        ) : (
          <div className="space-y-4">
            {orderedSubjects.map((subject) => {
              const { totalTopics, completedTopics } = getProgress(subject)
              const isExpanded = Boolean(expanded[subject.id])
              const createdDate = subject.createdAt
                ? new Date(subject.createdAt).toLocaleDateString()
                : 'Unknown date'
              const emoji = getSubjectEmoji(subject.subject)

              return (
                <section key={subject.id} className="w-full rounded-2xl border border-slate-700 bg-slate-800/70 p-4 sm:p-5">
                  <button
                    type="button"
                    onClick={() => toggleExpand(subject.id)}
                    className="mb-4 flex w-full items-center justify-between gap-4 text-left"
                  >
                    <div>
                      <h2 className="text-xl font-semibold text-white sm:text-2xl">
                        <span className="mr-2" aria-hidden="true">
                          {emoji}
                        </span>
                        {subject.subject}
                      </h2>
                      <p className="mt-1 text-xs text-slate-400">Added on {createdDate}</p>
                      <p className="mt-1 text-sm text-slate-300">
                        {completedTopics}/{totalTopics} topics
                      </p>
                      {totalTopics > 0 && completedTopics === totalTopics ? (
                        <span className="mt-1 inline-block rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-300">
                          Completed ✅
                        </span>
                      ) : null}
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-slate-300" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-slate-300" />
                    )}
                  </button>

                  <div className="mb-4">
                    <ProgressBar totalTopics={totalTopics} completedTopics={completedTopics} />
                  </div>

                  <div className="mb-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleDeleteSubject(subject.id, subject.subject)}
                      className="inline-flex items-center gap-2 rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Subject
                    </button>
                  </div>

                  {isExpanded ? (
                    <TopicBoard
                      subject={subject}
                      onSubjectUpdate={handleSubjectUpdate}
                      onGamificationEvent={handleGamificationEvent}
                      onQuizRequest={(chapter, quizSubject) => {
                        navigate('/quiz', {
                          state: {
                            chapter,
                            subject: quizSubject,
                          },
                        })
                      }}
                    />
                  ) : null}
                </section>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}

export default Dashboard
