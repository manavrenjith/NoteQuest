import { useState } from 'react'
import { checkAndUpdateStreak, getXP, saveXP, updateTopic } from '../utils/storage'

function isChapterComplete(chapter) {
  const topics = chapter?.topics || []
  return topics.length > 0 && topics.every((topic) => Boolean(topic.completed))
}

function TopicBoard({ subject, onSubjectUpdate, onGamificationEvent }) {
  const chapters = subject?.chapters || []
  const [activeTopicPopup, setActiveTopicPopup] = useState({})
  const [chapterToast, setChapterToast] = useState('')

  const handleToggle = (chapterId, topicId, completed) => {
    if (!subject?.id) {
      return
    }

    const previousChapter = chapters.find((chapter) => chapter.id === chapterId)
    const previousTopic = (previousChapter?.topics || []).find((topic) => topic.id === topicId)
    const wasTopicCompleted = Boolean(previousTopic?.completed)
    const wasChapterComplete = isChapterComplete(previousChapter)

    const updatedSubject = updateTopic(subject.id, chapterId, topicId, completed)

    if (!updatedSubject) {
      return
    }

    let awardedXP = 0
    let streak = null
    let chapterCompleted = false

    if (completed && !wasTopicCompleted) {
      saveXP(10)
      awardedXP += 10
      streak = checkAndUpdateStreak()

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

    if (!wasChapterComplete && isNowChapterComplete) {
      saveXP(50)
      awardedXP += 50
      chapterCompleted = true
      setChapterToast(`Chapter complete: ${updatedChapter?.title || 'Great work'} +50 XP`)
      window.setTimeout(() => setChapterToast(''), 2200)
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

  if (chapters.length === 0) {
    return <p className="rounded-xl bg-slate-800/70 p-4 text-slate-400">No chapters detected yet.</p>
  }

  return (
    <div className="space-y-4">
      {chapterToast ? (
        <div className="fixed right-4 top-5 z-40 rounded-xl border border-green-400/30 bg-green-500/20 px-4 py-2 text-sm font-semibold text-green-200 shadow-lg shadow-green-900/30 animate-[fadeIn_200ms_ease-out]">
          {chapterToast}
        </div>
      ) : null}

      {chapters.map((chapter) => (
        <section key={chapter.id} className="rounded-2xl border border-slate-700 bg-slate-800/70 p-4">
          <h3 className="mb-3 text-lg font-semibold text-slate-100">{chapter.title}</h3>
          <div className="space-y-3">
            {(chapter.topics || []).map((topic) => (
              <article
                key={topic.id}
                className="relative flex items-start gap-3 rounded-xl border border-slate-700/80 bg-slate-900 p-3"
              >
                <input
                  type="checkbox"
                  checked={Boolean(topic.completed)}
                  onChange={(event) => handleToggle(chapter.id, topic.id, event.target.checked)}
                  className="mt-1 h-5 w-5 cursor-pointer rounded border-slate-500 bg-slate-900 text-indigo-500 focus:ring-indigo-500"
                />
                <div>
                  <h4
                    className={`font-medium ${
                      topic.completed ? 'text-green-400 line-through' : 'text-slate-100'
                    }`}
                  >
                    {topic.title}
                  </h4>
                  <p className={`text-sm ${topic.completed ? 'text-green-500/90' : 'text-slate-300'}`}>
                    {topic.description}
                  </p>
                </div>
                {activeTopicPopup[topic.id] ? (
                  <span className="pointer-events-none absolute left-8 top-0 text-xs font-bold text-indigo-300 animate-[xpFloat_900ms_ease-out_forwards]">
                    +10 XP
                  </span>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export default TopicBoard
