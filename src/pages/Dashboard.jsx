import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, ChevronRight, Plus } from 'lucide-react'
import ProgressBar from '../components/ProgressBar'
import TopicBoard from '../components/TopicBoard'
import { getSubjects } from '../utils/storage'

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
  const [subjects, setSubjects] = useState([])
  const [expanded, setExpanded] = useState({})

  useEffect(() => {
    const storedSubjects = getSubjects()
    setSubjects(storedSubjects)

    const initialExpanded = storedSubjects.reduce((acc, subject) => {
      acc[subject.id] = true
      return acc
    }, {})

    setExpanded(initialExpanded)
  }, [])

  const orderedSubjects = useMemo(
    () => [...subjects].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)),
    [subjects],
  )

  const handleSubjectUpdate = (updatedSubject) => {
    setSubjects((prev) => prev.map((subject) => (subject.id === updatedSubject.id ? updatedSubject : subject)))
  }

  const toggleExpand = (subjectId) => {
    setExpanded((prev) => ({ ...prev, [subjectId]: !prev[subjectId] }))
  }

  return (
    <main className="min-h-screen bg-slate-900 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-5xl">
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
                    <h2 className="text-xl font-semibold text-white sm:text-2xl">{subject.subject}</h2>
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
                    <TopicBoard subject={subject} onSubjectUpdate={handleSubjectUpdate} />
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
