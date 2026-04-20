import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import RatingPrompt from './RatingPrompt'
import { getStudyTip } from '../utils/gemini'
import {
  checkAndUpdateStreak,
  estimateChapterTime,
  getSubjects,
  getTopicRating,
  getXP,
  isWeakTopic,
  markWeakTopic,
  recordStudyActivity,
  saveRevisionSchedule,
  saveTopicRating,
  saveXP,
  unmarkWeakTopic,
  updateTopic,
} from '../utils/storage'
import { useToast } from '../hooks/useToast'

function isChapterComplete(chapter) {
  const topics = chapter?.topics || []
  return topics.length > 0 && topics.every((topic) => Boolean(topic.completed))
}

function TopicBoard({ subject, onSubjectUpdate, onGamificationEvent, onQuizRequest }) {
  const chapters = useMemo(() => subject?.chapters || [], [subject])
  const { success, info } = useToast()
  const [activeTopicPopup, setActiveTopicPopup] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [collapsedChapters, setCollapsedChapters] = useState({})
  const [tips, setTips] = useState({})
  const [pendingRating, setPendingRating] = useState(null)

  const getChapterAvgDifficulty = (chapter) => {
    const ratings = (chapter?.topics || [])
      .map((topic) => getTopicRating(subject.id, chapter.id, topic.id))
      .filter((rating) => rating > 0)

    if (ratings.length === 0) return 0
    return Math.round(ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length)
  }

  const filteredChapters = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return chapters
      .map((chapter) => {
        const topicMatches = (chapter.topics || []).filter((topic) => {
          const byFilter =
            filter === 'completed' ? Boolean(topic.completed) : filter === 'remaining' ? !topic.completed : true
          const bySearch =
            !normalizedQuery ||
            String(topic.title || '').toLowerCase().includes(normalizedQuery) ||
            String(topic.description || '').toLowerCase().includes(normalizedQuery)
          return byFilter && bySearch
        })

        return {
          ...chapter,
          topics: topicMatches,
        }
      })
      .filter((chapter) => chapter.topics.length > 0)
  }, [chapters, filter, searchQuery])

  const handleToggle = (chapterId, topicId, completed) => {
    if (!subject?.id) {
      return
    }

    const previousChapter = chapters.find((chapter) => chapter.id === chapterId)
    const previousTopic = (previousChapter?.topics || []).find((topic) => topic.id === topicId)
    const wasTopicCompleted = Boolean(previousTopic?.completed)
    const wasChapterComplete = isChapterComplete(previousChapter)

    if (!completed && wasTopicCompleted) {
      markWeakTopic(subject.id, chapterId, topicId)
    }

    if (completed) {
      unmarkWeakTopic(subject.id, chapterId, topicId)
    }

    const updatedSubject = updateTopic(subject.id, chapterId, topicId, completed)

    if (!updatedSubject) {
      return
    }

    let awardedXP = 0
    let streak = null
    let chapterCompleted = false

    if (completed && !wasTopicCompleted) {
      saveXP(10)
      recordStudyActivity(1)
      awardedXP += 10
      streak = checkAndUpdateStreak()
      const existingRating = getTopicRating(subject.id, chapterId, topicId)
      if (existingRating > 0) {
        saveRevisionSchedule(subject.id, chapterId, topicId, existingRating)
      }
      success('+10 XP earned! ⚡')
      setPendingRating({ topicId, chapterId })

      setActiveTopicPopup((prev) => ({ ...prev, [topicId]: true }))
      window.setTimeout(() => {
        setActiveTopicPopup((prev) => {
          const next = { ...prev }
          delete next[topicId]
          return next
        })
      }, 900)
    }

    const updatedChapter = (updatedSubject.chapters || []).find((chapter) => chapter.id === chapterId)
    const isNowChapterComplete = isChapterComplete(updatedChapter)

    if (!completed) {
      setPendingRating(null)
    }

    if (!wasChapterComplete && isNowChapterComplete) {
      saveXP(50)
      awardedXP += 50
      chapterCompleted = true
      success('Chapter complete! 🏆')
    }

    if (onSubjectUpdate) {
      onSubjectUpdate(updatedSubject)
    }

    if (onGamificationEvent) {
      onGamificationEvent({
        subjectId: subject.id,
        updatedSubject,
        awardedXP,
        streak,
        chapterCompleted,
        currentXP: getXP(),
      })
    }
  }

  const fetchTip = async (topic) => {
    if (!topic?.id) {
      return
    }

    if (tips[topic.id]?.text) {
      setTips((prev) => ({
        ...prev,
        [topic.id]: {
          ...prev[topic.id],
          visible: !prev[topic.id]?.visible,
        },
      }))
      return
    }

    setTips((prev) => ({
      ...prev,
      [topic.id]: { loading: true, text: '', visible: false },
    }))

    try {
      const tip = await getStudyTip(topic.title, topic.description)
      setTips((prev) => ({
        ...prev,
        [topic.id]: { loading: false, text: tip || 'Click to retry.', visible: true },
      }))
    } catch (error) {
      setTips((prev) => ({
        ...prev,
        [topic.id]: { loading: false, text: 'Click to retry.', visible: true },
      }))
    }
  }

  if (chapters.length === 0) {
    return <p className="rounded-xl bg-slate-800/70 p-4 text-slate-400">No chapters detected yet.</p>
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3 rounded-xl border border-slate-700 bg-slate-900/60 p-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search topics..."
          className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
        />
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'completed', label: 'Completed' },
            { key: 'remaining', label: 'Remaining' },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 ${
                filter === item.key
                  ? 'bg-indigo-500 text-white'
                  : 'border border-slate-600 bg-slate-800 text-slate-200 hover:border-indigo-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {filteredChapters.length === 0 ? (
        <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-5 text-center text-slate-300">
          No topics found 🔍
        </div>
      ) : null}

      {filteredChapters.map((chapter) => {
        const allTopics = chapter.topics || []
        const totalInChapter = (subject.chapters || []).find((item) => item.id === chapter.id)?.topics?.length || 0
        const completedInChapter = (subject.chapters || [])
          .find((item) => item.id === chapter.id)
          ?.topics?.filter((topic) => Boolean(topic.completed)).length
        const chapterIsComplete = totalInChapter > 0 && completedInChapter === totalInChapter
        const isCollapsed = Boolean(collapsedChapters[chapter.id])
        const avgDifficulty = getChapterAvgDifficulty((subject.chapters || []).find((item) => item.id === chapter.id) || chapter)

        return (
          <section key={chapter.id} className="rounded-2xl border border-slate-700 bg-slate-800/70 p-4">
            <button
              type="button"
              onClick={() =>
                setCollapsedChapters((prev) => ({
                  ...prev,
                  [chapter.id]: !prev[chapter.id],
                }))
              }
              className="mb-3 flex w-full items-center justify-between rounded-lg px-1 py-1 text-left"
            >
              <div>
                <h3 className="text-lg font-semibold text-slate-100">
                  {chapter.title}
                  {avgDifficulty > 0 ? <span style={{ fontSize: 10, marginLeft: 8 }}>{'⭐'.repeat(avgDifficulty)}</span> : null}
                </h3>
                <p className="text-sm text-slate-300">
                  {chapter.title} ({completedInChapter || 0}/{totalInChapter} complete)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-slate-700 px-2.5 py-1 text-xs text-slate-200">
                  ⏱ {estimateChapterTime((subject.chapters || []).find((item) => item.id === chapter.id) || chapter)}
                </span>
                {isCollapsed ? (
                  <ChevronRight className="h-5 w-5 text-slate-300" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-300" />
                )}
              </div>
            </button>

            {chapterIsComplete ? (
              <button
                type="button"
                onClick={() => {
                  if (onQuizRequest) {
                    onQuizRequest(chapter, subject)
                  } else {
                    info('Quiz mode is not available yet.')
                  }
                }}
                className="mb-3 rounded-xl border border-indigo-400/40 bg-indigo-500/20 px-3 py-2 text-sm font-semibold text-indigo-100 transition hover:bg-indigo-500/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
              >
                Test Yourself 🧠
              </button>
            ) : null}

            {!isCollapsed ? (
              <div className="space-y-3">
                {allTopics.map((topic) => {
                  const rating = getTopicRating(subject.id, chapter.id, topic.id)

                  return (
                  <article key={topic.id} className="relative rounded-xl border border-slate-700/80 bg-slate-900 p-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={Boolean(topic.completed)}
                        onChange={(event) => handleToggle(chapter.id, topic.id, event.target.checked)}
                        className="mt-1 h-6 w-6 cursor-pointer rounded border-slate-500 bg-slate-900 text-indigo-500 focus:ring-indigo-500"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => fetchTip(topic)}
                            className={`text-left font-medium transition hover:opacity-90 ${
                              topic.completed ? 'text-green-400 line-through' : 'text-slate-100'
                            }`}
                          >
                            {topic.title}
                          </button>

                          {isWeakTopic(subject.id, chapter.id, topic.id) && !topic.completed ? (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                              needs review
                            </span>
                          ) : null}

                          {topic.completed && rating > 0 ? (
                            <div style={{ display: 'flex', gap: 1, marginLeft: 'auto' }}>
                              {[1, 2, 3].map((star) => (
                                <span
                                  key={star}
                                  style={{
                                    fontSize: 11,
                                    opacity: star <= rating ? 1 : 0.2,
                                  }}
                                >
                                  ⭐
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>

                        <p className={`mt-1 text-sm ${topic.completed ? 'text-green-500/90' : 'text-slate-300'}`}>
                          {topic.description}
                        </p>

                        {tips[topic.id]?.loading ? (
                          <div className="pt-1 text-xs italic text-slate-400">Thinking...</div>
                        ) : null}

                        {tips[topic.id]?.visible && tips[topic.id]?.text ? (
                          <div className="mt-2 rounded-md bg-indigo-100 px-2.5 py-1.5 text-xs leading-relaxed text-indigo-900">
                            💡 {tips[topic.id].text}
                          </div>
                        ) : null}

                        {pendingRating?.topicId === topic.id && pendingRating?.chapterId === chapter.id ? (
                          <RatingPrompt
                            onRate={(rating) => {
                              saveTopicRating(subject.id, chapter.id, topic.id, rating)
                              if (topic.completed) {
                                saveRevisionSchedule(subject.id, chapter.id, topic.id, rating)
                              }
                              const bonusXP = [0, 0, 5, 15][rating]
                              const refreshedSubject = getSubjects().find((item) => item.id === subject.id) || subject

                              if (bonusXP > 0) {
                                saveXP(bonusXP)
                                success(`+${bonusXP} bonus XP for difficulty rating!`)
                              }

                              setPendingRating(null)

                              if (onSubjectUpdate) {
                                onSubjectUpdate(refreshedSubject)
                              }

                              if (onGamificationEvent) {
                                onGamificationEvent({
                                  subjectId: subject.id,
                                  updatedSubject: refreshedSubject,
                                  awardedXP: bonusXP,
                                  streak: null,
                                  chapterCompleted: false,
                                  currentXP: getXP(),
                                })
                              }
                            }}
                            onSkip={() => setPendingRating(null)}
                          />
                        ) : null}
                      </div>
                    </div>

                    {activeTopicPopup[topic.id] ? (
                      <span className="pointer-events-none absolute left-9 top-1 text-xs font-bold text-indigo-300 animate-[xpFloat_900ms_ease-out_forwards]">
                        +10 XP
                      </span>
                    ) : null}
                  </article>
                  )
                })}
              </div>
            ) : null}
          </section>
        )
      })}
    </div>
  )
}

export default TopicBoard
