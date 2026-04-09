import { useEffect, useState } from 'react'
import { updateTopic } from '../utils/storage'

function TopicBoard({ subject, onSubjectUpdate }) {
  const [chapters, setChapters] = useState(subject?.chapters || [])

  useEffect(() => {
    setChapters(subject?.chapters || [])
  }, [subject])

  const handleToggle = (chapterId, topicId, completed) => {
    if (!subject?.id) {
      return
    }

    const updatedSubject = updateTopic(subject.id, chapterId, topicId, completed)

    if (!updatedSubject) {
      return
    }

    setChapters(updatedSubject.chapters || [])

    if (onSubjectUpdate) {
      onSubjectUpdate(updatedSubject)
    }
  }

  if (chapters.length === 0) {
    return <p className="rounded-xl bg-slate-800/70 p-4 text-slate-400">No chapters detected yet.</p>
  }

  return (
    <div className="space-y-4">
      {chapters.map((chapter) => (
        <section key={chapter.id} className="rounded-2xl border border-slate-700 bg-slate-800/70 p-4">
          <h3 className="mb-3 text-lg font-semibold text-slate-100">{chapter.title}</h3>
          <div className="space-y-3">
            {(chapter.topics || []).map((topic) => (
              <article
                key={topic.id}
                className="flex items-start gap-3 rounded-xl border border-slate-700/80 bg-slate-900 p-3"
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
                      topic.completed ? 'text-slate-500 line-through' : 'text-slate-100'
                    }`}
                  >
                    {topic.title}
                  </h4>
                  <p className={`text-sm ${topic.completed ? 'text-slate-500' : 'text-slate-300'}`}>
                    {topic.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

export default TopicBoard
