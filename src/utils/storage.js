const STORAGE_KEY = 'notequest_subjects'

export function getSubjects() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.error('Failed to read subjects from storage:', error)
    return []
  }
}

export function saveSubject(subjectData) {
  const subjects = getSubjects()
  subjects.push(subjectData)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects))
  return subjects
}

export function updateTopic(subjectId, chapterId, topicId, completed) {
  const subjects = getSubjects()

  const updatedSubjects = subjects.map((subject) => {
    if (subject.id !== subjectId) {
      return subject
    }

    return {
      ...subject,
      chapters: (subject.chapters || []).map((chapter) => {
        if (chapter.id !== chapterId) {
          return chapter
        }

        return {
          ...chapter,
          topics: (chapter.topics || []).map((topic) =>
            topic.id === topicId ? { ...topic, completed } : topic,
          ),
        }
      }),
    }
  })

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSubjects))
  return updatedSubjects.find((subject) => subject.id === subjectId) || null
}

export function clearAll() {
  localStorage.removeItem(STORAGE_KEY)
}
