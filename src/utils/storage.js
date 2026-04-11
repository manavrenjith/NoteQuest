const STORAGE_KEY = 'notequest_subjects'
const XP_KEY = 'notequest_xp'
const STREAK_KEY = 'notequest_streak'
const LAST_ACTIVE_KEY = 'notequest_last_active'
const BADGES_KEY = 'notequest_badges'
const WEAK_TOPICS_KEY = 'studyquest_weak_topics'

const LEVELS = [
  { level: 1, title: 'Novice', minXP: 0, next: 100 },
  { level: 2, title: 'Learner', minXP: 100, next: 300 },
  { level: 3, title: 'Scholar', minXP: 300, next: 600 },
  { level: 4, title: 'Expert', minXP: 600, next: 1000 },
  { level: 5, title: 'Master', minXP: 1000, next: null },
]

function readNumber(key, fallback = 0) {
  const raw = localStorage.getItem(key)
  const value = Number(raw)
  return Number.isFinite(value) ? value : fallback
}

function toDateOnly(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function getBadgeState() {
  try {
    const raw = localStorage.getItem(BADGES_KEY)
    const parsed = raw ? JSON.parse(raw) : {}
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch (error) {
    console.error('Failed to read badges from storage:', error)
    return {}
  }
}

function setBadgeState(state) {
  localStorage.setItem(BADGES_KEY, JSON.stringify(state))
}

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

export function deleteSubject(subjectId) {
  const subjects = getSubjects()
  const nextSubjects = subjects.filter((subject) => subject.id !== subjectId)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSubjects))
  return nextSubjects
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
  localStorage.removeItem(XP_KEY)
  localStorage.removeItem(STREAK_KEY)
  localStorage.removeItem(LAST_ACTIVE_KEY)
  localStorage.removeItem(BADGES_KEY)
  localStorage.removeItem(WEAK_TOPICS_KEY)
}

export function getWeakTopics() {
  try {
    const weakTopics = JSON.parse(localStorage.getItem(WEAK_TOPICS_KEY) || '{}')
    return weakTopics && typeof weakTopics === 'object' ? weakTopics : {}
  } catch (error) {
    console.error('Failed to read weak topics from storage:', error)
    return {}
  }
}

export function markWeakTopic(subjectId, chapterId, topicId) {
  const weak = getWeakTopics()
  const key = `${subjectId}_${chapterId}_${topicId}`
  weak[key] = true
  localStorage.setItem(WEAK_TOPICS_KEY, JSON.stringify(weak))
}

export function unmarkWeakTopic(subjectId, chapterId, topicId) {
  const weak = getWeakTopics()
  const key = `${subjectId}_${chapterId}_${topicId}`
  delete weak[key]
  localStorage.setItem(WEAK_TOPICS_KEY, JSON.stringify(weak))
}

export function isWeakTopic(subjectId, chapterId, topicId) {
  const weak = getWeakTopics()
  return Boolean(weak[`${subjectId}_${chapterId}_${topicId}`])
}

function calculateTopicMinutes(topics = []) {
  const topicCount = topics.length
  if (topicCount === 0) {
    return 0
  }

  const avgDescLength =
    topics.reduce((sum, topic) => sum + (topic?.description?.length || 0), 0) / topicCount

  const minsPerTopic = avgDescLength > 80 ? 12 : avgDescLength > 40 ? 9 : 7
  return topicCount * minsPerTopic
}

function formatMinutesEstimate(totalMinutes) {
  const rounded = Math.round(totalMinutes)
  if (rounded < 60) {
    return `~${rounded} mins`
  }

  const hours = Math.floor(rounded / 60)
  const minutes = rounded % 60
  return minutes > 0 ? `~${hours}h ${minutes}m` : `~${hours}h`
}

export function estimateChapterTime(chapter) {
  const topics = chapter?.topics || []
  return formatMinutesEstimate(calculateTopicMinutes(topics))
}

export function estimateSubjectTime(subject) {
  const totalMins = (subject?.chapters || []).reduce((sum, chapter) => {
    return sum + calculateTopicMinutes(chapter?.topics || [])
  }, 0)

  return formatMinutesEstimate(totalMins)
}

// XP & Level System
export function saveXP(amount) {
  const currentXP = getXP()
  const nextXP = Math.max(0, currentXP + Number(amount || 0))
  localStorage.setItem(XP_KEY, String(nextXP))
  return nextXP
}

export function getXP() {
  return readNumber(XP_KEY, 0)
}

export function getLevel(xp = getXP()) {
  const safeXP = Math.max(0, Number(xp || 0))

  for (let index = LEVELS.length - 1; index >= 0; index -= 1) {
    if (safeXP >= LEVELS[index].minXP) {
      return LEVELS[index]
    }
  }

  return LEVELS[0]
}

// Streak System
export function checkAndUpdateStreak() {
  const now = new Date()
  const today = toDateOnly(now)
  const todayISO = today.toISOString().slice(0, 10)

  const lastActiveRaw = localStorage.getItem(LAST_ACTIVE_KEY)
  const currentStreak = Math.max(0, readNumber(STREAK_KEY, 0))

  let nextStreak = currentStreak

  if (!lastActiveRaw) {
    nextStreak = 1
  } else {
    const lastActive = toDateOnly(new Date(lastActiveRaw))
    const diffDays = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays <= 0) {
      nextStreak = currentStreak || 1
    } else if (diffDays === 1) {
      nextStreak = currentStreak + 1
    } else {
      nextStreak = 1
    }
  }

  localStorage.setItem(STREAK_KEY, String(nextStreak))
  localStorage.setItem(LAST_ACTIVE_KEY, todayISO)

  const badges = getBadgeState()
  if (nextStreak >= 3 && !badges.streak3) {
    saveXP(100)
    badges.streak3 = true
    setBadgeState(badges)
  }

  return nextStreak
}

export function getStreak() {
  return readNumber(STREAK_KEY, 0)
}

export function checkBadges(subjects = getSubjects(), streak = getStreak()) {
  const topicCounts = subjects.reduce(
    (acc, subject) => {
      ;(subject.chapters || []).forEach((chapter) => {
        const topics = chapter.topics || []
        acc.total += topics.length
        const completedInChapter = topics.filter((topic) => Boolean(topic.completed)).length
        acc.completed += completedInChapter
        if (topics.length > 0 && completedInChapter === topics.length) {
          acc.hasCompletedChapter = true
        }
      })

      const subjectTotal = (subject.chapters || []).reduce(
        (sum, chapter) => sum + (chapter.topics || []).length,
        0,
      )
      const subjectCompleted = (subject.chapters || []).reduce(
        (sum, chapter) => sum + (chapter.topics || []).filter((topic) => Boolean(topic.completed)).length,
        0,
      )

      if (subjectTotal > 0 && subjectCompleted === subjectTotal) {
        acc.hasCompletedSubject = true
      }

      return acc
    },
    { total: 0, completed: 0, hasCompletedChapter: false, hasCompletedSubject: false },
  )

  const unlocked = {
    firstTopic: topicCounts.completed >= 1,
    chapterChampion: topicCounts.hasCompletedChapter,
    subjectMaster: topicCounts.hasCompletedSubject,
    streak3: streak >= 3,
    streak5: streak >= 5,
  }

  setBadgeState(unlocked)
  return unlocked
}

export function getSubjectStats(subjects = getSubjects()) {
  return subjects.reduce(
    (acc, subject) => {
      const chapterTopics = (subject.chapters || []).flatMap((chapter) => chapter.topics || [])
      acc.totalTopics += chapterTopics.length
      acc.completedTopics += chapterTopics.filter((topic) => Boolean(topic.completed)).length
      return acc
    },
    { totalSubjects: subjects.length, totalTopics: 0, completedTopics: 0 },
  )
}
