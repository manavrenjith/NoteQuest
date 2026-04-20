import { useEffect, useMemo, useState } from 'react'
import RatingPrompt from './RatingPrompt'
import { getStudyTip } from '../utils/gemini'
import {
  checkAndUpdateStreak,
  getCompletionEstimate,
  getSubjects,
  getTopicRating,
  isWeakTopic,
  markWeakTopic,
  recordStudyActivity,
  saveRevisionSchedule,
  saveTopicRating,
  saveXP,
  unmarkWeakTopic,
  updateTopic,
} from '../utils/storage'

function toChapterStats(chapter) {
  const topics = chapter?.topics || []
  const done = topics.filter((topic) => Boolean(topic.completed)).length
  const total = topics.length

  let state = 'not-started'
  if (total > 0 && done === total) {
    state = 'completed'
  } else if (done > 0) {
    state = 'in-progress'
  }

  return { done, total, state }
}

function Roadmap({ subject, onUpdate }) {
  const [selectedChapterId, setSelectedChapterId] = useState(null)
  const [localSubject, setLocalSubject] = useState(subject)
  const [xpPopups, setXpPopups] = useState([])
  const [panelVisible, setPanelVisible] = useState(true)
  const [tips, setTips] = useState({})
  const [pendingRating, setPendingRating] = useState(null)

  useEffect(() => {
    setLocalSubject(subject)
    setSelectedChapterId(null)
  }, [subject])

  const chapterStats = useMemo(() => {
    return (localSubject?.chapters || []).map((chapter) => ({
      chapter,
      ...toChapterStats(chapter),
    }))
  }, [localSubject])

  const allCompleted = useMemo(() => {
    return chapterStats.length > 0 && chapterStats.every((item) => item.total > 0 && item.done === item.total)
  }, [chapterStats])

  useEffect(() => {
    if (selectedChapterId === null) {
      return
    }

    setPanelVisible(false)
    const timer = window.setTimeout(() => setPanelVisible(true), 30)
    return () => window.clearTimeout(timer)
  }, [selectedChapterId])

  const selected = chapterStats.find((item) => item.chapter.id === selectedChapterId)
  const selectedChapter = selected?.chapter || null
  const selectedPercent = selected?.total ? Math.round((selected.done / selected.total) * 100) : 0
  const estimate = getCompletionEstimate(localSubject)
  const remainingTopics = (localSubject?.chapters || [])
    .flatMap((chapter) => chapter?.topics || [])
    .filter((topic) => !topic?.completed).length

  const pushXpPopup = (event) => {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    const x = event?.clientX || 24
    const y = event?.clientY || 24

    setXpPopups((prev) => [...prev, { id, x, y }])
    window.setTimeout(() => {
      setXpPopups((prev) => prev.filter((item) => item.id !== id))
    }, 1000)
  }

  const getChapterAvgDifficulty = (chapter) => {
    const ratings = (chapter?.topics || [])
      .map((topic) => getTopicRating(localSubject.id, chapter.id, topic.id))
      .filter((rating) => rating > 0)

    if (ratings.length === 0) return 0
    return Math.round(ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length)
  }

  const toggleTopic = (chapterId, topicId, completed, event) => {
    const previousChapter = (localSubject?.chapters || []).find((chapter) => chapter.id === chapterId)
    const previousTopic = (previousChapter?.topics || []).find((topic) => topic.id === topicId)
    const wasCompleted = Boolean(previousTopic?.completed)

    if (!completed && wasCompleted) {
      markWeakTopic(localSubject.id, chapterId, topicId)
    }

    if (completed) {
      unmarkWeakTopic(localSubject.id, chapterId, topicId)
    }

    const updatedSubject = updateTopic(localSubject.id, chapterId, topicId, completed)
    if (!updatedSubject) {
      return
    }

    if (completed && !wasCompleted) {
      saveXP(10)
      recordStudyActivity(1)
      checkAndUpdateStreak()
      const existingRating = getTopicRating(localSubject.id, chapterId, topicId)
      if (existingRating > 0) {
        saveRevisionSchedule(localSubject.id, chapterId, topicId, existingRating)
      }
      pushXpPopup(event)
      setPendingRating({ topicId, chapterId })
    }

    if (!completed) {
      setPendingRating(null)
    }

    setLocalSubject(updatedSubject)

    if (onUpdate) {
      onUpdate(updatedSubject)
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

  return (
    <div className="relative">
      <style>{`@keyframes floatUp { 0% { opacity: 1; transform: translateY(0); } 100% { opacity: 0; transform: translateY(-30px); } } @media (min-width: 768px) { .roadmap-topic-panel { width: 260px; } }`}</style>

      {xpPopups.map((popup) => (
        <div
          key={popup.id}
          style={{
            position: 'fixed',
            left: popup.x,
            top: popup.y,
            fontSize: '12px',
            fontWeight: 500,
            color: '#7F77DD',
            animation: 'floatUp 1s ease forwards',
            pointerEvents: 'none',
            zIndex: 999,
          }}
        >
          +10 XP
        </div>
      ))}

      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <div className="relative flex-1 rounded-lg border border-slate-700 bg-slate-900 p-4">
          {estimate && !estimate.done ? (
            <div
              style={{
                background: 'var(--color-background-secondary)',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 12,
                color: 'var(--color-text-secondary)',
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              ?? {estimate.message}
              <span style={{ marginLeft: 'auto', fontSize: 11 }}>{remainingTopics} topics remaining</span>
            </div>
          ) : null}

          <div className="pointer-events-none absolute bottom-8 left-5 top-8 border-l-2 border-dashed border-slate-700" />

          <div className="relative mb-5 pl-10">
            <span className="inline-flex rounded-full bg-lime-200 px-2.5 py-1 text-xs font-medium text-lime-900">START</span>
          </div>

          <div className="space-y-4">
            {chapterStats.map((item, index) => {
              const isActive = item.chapter.id === selectedChapterId
              const chapterNumber = String(index + 1).padStart(2, '0')
              const avgDifficulty = getChapterAvgDifficulty(item.chapter)

              let nodeClass = 'bg-slate-700'
              if (item.state === 'completed') nodeClass = ''
              if (item.state === 'in-progress') nodeClass = ''

              const progressTextClass =
                item.state === 'completed'
                  ? 'text-lime-700'
                  : item.state === 'in-progress'
                    ? 'text-indigo-700'
                    : 'text-slate-400'

              const cardClasses =
                item.state === 'completed'
                  ? 'border text-slate-900'
                  : item.state === 'in-progress'
                    ? 'border text-slate-900'
                    : 'border border-slate-700 bg-slate-800 text-white'

              const cardStyle =
                item.state === 'completed'
                  ? { borderColor: '#7F77DD', backgroundColor: '#EEEDFE' }
                  : item.state === 'in-progress'
                    ? { borderColor: '#AFA9EC', backgroundColor: '#EEEDFE' }
                    : undefined

              return (
                <div key={item.chapter.id} className="relative pl-10">
                  <button
                    type="button"
                    onClick={() => setSelectedChapterId(item.chapter.id)}
                    className={`relative block w-full rounded-lg px-3 py-3 text-left ${cardClasses}`}
                    style={{
                      ...cardStyle,
                      borderWidth: isActive ? 2 : 1,
                      borderColor: isActive ? '#7F77DD' : cardStyle?.borderColor,
                    }}
                  >
                    <div className="absolute -left-10 top-4 h-px w-5 bg-slate-600" />

                    <span
                      className={`absolute -left-14 top-0 flex h-9 w-9 items-center justify-center rounded-full text-xs text-white ${nodeClass}`}
                      style={{
                        backgroundColor:
                          item.state === 'completed' || item.state === 'in-progress' ? '#7F77DD' : undefined,
                        boxShadow: item.state === 'completed' ? '0 0 0 2px rgba(99,153,34,0.6)' : 'none',
                        fontSize: '11px',
                      }}
                    >
                      {chapterNumber}
                    </span>

                    <p className="text-xs font-medium">
                      {item.chapter.title || 'Untitled chapter'}
                      {avgDifficulty > 0 ? <span style={{ fontSize: 10, marginLeft: 8 }}>{'?'.repeat(avgDifficulty)}</span> : null}
                    </p>
                    <p className={`mt-1 text-xs ${progressTextClass}`}>
                      {item.done}/{item.total}{' '}
                      {item.state === 'completed'
                        ? 'complete ?'
                        : item.state === 'in-progress'
                          ? 'in progress'
                          : 'not started'}
                    </p>
                  </button>
                </div>
              )
            })}
          </div>

          <div className="relative mt-5 pl-10">
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                allCompleted ? 'bg-lime-200 text-lime-900' : 'bg-slate-700 text-slate-300'
              }`}
            >
              FINISH
            </span>
          </div>
        </div>

        <aside className="roadmap-topic-panel w-full border-slate-700 md:shrink-0 md:border-l md:pl-4">
          {!selectedChapter ? (
            <div className="flex min-h-44 items-center justify-center rounded-lg border border-slate-700 bg-slate-800 p-4 text-center text-sm text-slate-400">
              <p>
                ? Click a stop
                <br />
                to see its topics
                <br />
                and check them off
              </p>
            </div>
          ) : (
            <div
              className="rounded-lg border border-slate-700 bg-slate-800 p-4"
              style={{
                opacity: panelVisible ? 1 : 0,
                transform: panelVisible ? 'translateY(0)' : 'translateY(6px)',
                transition: 'opacity 0.2s ease, transform 0.2s ease',
              }}
            >
              <h4 className="text-sm font-medium text-white">
                {selectedChapter.title || 'Untitled chapter'}
                {getChapterAvgDifficulty(selectedChapter) > 0 ? (
                  <span style={{ fontSize: 10, marginLeft: 8 }}>{'?'.repeat(getChapterAvgDifficulty(selectedChapter))}</span>
                ) : null}
              </h4>
              <p className="mt-1 text-xs text-slate-400">
                {selected.done} / {selected.total} topics completed
              </p>

              <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-slate-700">
                <div
                  className="h-full"
                  style={{
                    width: `${selectedPercent}%`,
                    backgroundColor: '#7F77DD',
                    transition: 'width 0.4s ease',
                  }}
                />
              </div>
              <p className="mt-1 text-xs text-slate-400">{selectedPercent}% complete</p>

              <div className="mt-3 space-y-2">
                {(selectedChapter.topics || []).map((topic) => {
                  const rating = getTopicRating(localSubject.id, selectedChapter.id, topic.id)

                  return (
                    <div key={topic.id} className="rounded-md border border-slate-700 bg-slate-900 px-2.5 py-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={Boolean(topic.completed)}
                          onChange={(event) =>
                            toggleTopic(selectedChapter.id, topic.id, event.target.checked, event.nativeEvent)
                          }
                          className="h-3.5 w-3.5 rounded-sm border-slate-500"
                          style={{ accentColor: '#7F77DD' }}
                        />

                        <button
                          type="button"
                          onClick={() => fetchTip(topic)}
                          className={`text-left text-xs ${topic.completed ? 'text-slate-400 line-through' : 'text-white'}`}
                        >
                          {topic.title || 'Untitled topic'}
                        </button>

                        {isWeakTopic(localSubject.id, selectedChapter.id, topic.id) && !topic.completed ? (
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
                                ?
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      {tips[topic.id]?.loading ? <p className="mt-1 pl-5 text-[11px] italic text-slate-400">Thinking...</p> : null}

                      {tips[topic.id]?.visible && tips[topic.id]?.text ? (
                        <div className="mt-1 ml-5 rounded-md bg-indigo-100 px-2.5 py-1.5 text-[11px] leading-relaxed text-indigo-900">
                          ?? {tips[topic.id].text}
                        </div>
                      ) : null}

                      {pendingRating?.topicId === topic.id && pendingRating?.chapterId === selectedChapter.id ? (
                        <RatingPrompt
                          onRate={(value) => {
                            saveTopicRating(localSubject.id, selectedChapter.id, topic.id, value)
                            if (topic.completed) {
                              saveRevisionSchedule(localSubject.id, selectedChapter.id, topic.id, value)
                            }
                            const bonusXP = [0, 0, 5, 15][value]

                            if (bonusXP > 0) {
                              saveXP(bonusXP)
                            }

                            setPendingRating(null)

                            if (onUpdate) {
                              const refreshedSubject = getSubjects().find((item) => item.id === localSubject.id)
                              if (refreshedSubject) {
                                setLocalSubject(refreshedSubject)
                                onUpdate(refreshedSubject)
                              }
                            }
                          }}
                          onSkip={() => setPendingRating(null)}
                        />
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

export default Roadmap
