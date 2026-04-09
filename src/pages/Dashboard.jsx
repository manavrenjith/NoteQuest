import { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronRight, Plus } from 'lucide-react'
import confetti from 'canvas-confetti'
import ProgressBar from '../components/ProgressBar'
import TopicBoard from '../components/TopicBoard'
import XPBar from '../components/XPBar'
import StatsPanel from '../components/StatsPanel'
import BadgeCard from '../components/BadgeCard'
import LevelUpModal from '../components/LevelUpModal'
import { checkBadges, getLevel, getStreak, getSubjects, getXP, saveXP } from '../utils/storage'

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
  const [subjects, setSubjects] = useState(() => getSubjects())
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

  const orderedSubjects = useMemo(
    () => [...subjects].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
    [subjects],
  )

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

  return (
    <main className="min-h-screen bg-slate-900 px-4 py-10 text-slate-100">
      <LevelUpModal levelTitle={newLevelTitle} isOpen={isLevelUpOpen} onClose={() => setIsLevelUpOpen(false)} />
      {subjectCompleteOverlay ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 px-4 animate-[fadeIn_200ms_ease-out]">
          <div className="rounded-2xl border border-green-400/30 bg-slate-900/90 px-8 py-6 text-center shadow-2xl shadow-green-900/20 animate-[scaleIn_220ms_ease-out]">
            <p className="text-sm uppercase tracking-wide text-green-300">Subject Complete</p>
            <h3 className="mt-2 text-3xl font-black text-white">{subjectCompleteOverlay} 🎓</h3>
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-5xl">
        <XPBar xp={xp} streak={streak} />
        <StatsPanel
          totalCompletedTopics={totalCompletedTopics}
          totalSubjects={totalSubjects}
          streak={streak}
          xp={xp}
        />

        <section className="mb-8 rounded-2xl border border-slate-700 bg-slate-800/70 p-4">
          <h2 className="mb-4 text-xl font-semibold text-white">Badges</h2>
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
        </section>

        <div className="mb-8 flex items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Dashboard</h1>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400"
          >
            <Plus className="h-4 w-4" />
            Add New Subject
          </button>
        </div>

        {orderedSubjects.length === 0 ? (
          <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-8 text-center text-slate-300">
            No subjects yet. Upload your notes to get started!
          </div>
        ) : (
          <div className="space-y-4">
            {orderedSubjects.map((subject) => {
              const { totalTopics, completedTopics } = getProgress(subject)
              const isExpanded = Boolean(expanded[subject.id])

              return (
                <section key={subject.id} className="rounded-2xl border border-slate-700 bg-slate-800/70 p-5">
                  <button
                    type="button"
                    onClick={() => toggleExpand(subject.id)}
                    className="mb-4 flex w-full items-center justify-between gap-4 text-left"
                  >
                    <div>
                      <h2 className="text-xl font-semibold text-white sm:text-2xl">{subject.subject}</h2>
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

                  {isExpanded ? (
                    <TopicBoard
                      subject={subject}
                      onSubjectUpdate={handleSubjectUpdate}
                      onGamificationEvent={handleGamificationEvent}
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
