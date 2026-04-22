const STORAGE_KEY = 'notequest_subjects'
const XP_KEY = 'notequest_xp'
const STREAK_KEY = 'notequest_streak'
const LAST_ACTIVE_KEY = 'notequest_last_active'
const BADGES_KEY = 'notequest_badges'
const WEAK_TOPICS_KEY = 'studyquest_weak_topics'
const STUDY_ACTIVITY_KEY = 'nq_study_activity'
const DAILY_CHALLENGE_KEY = 'nq_daily_challenge'
const CHALLENGE_COMPLETED_KEY = 'nq_challenge_completed'
const TOPIC_RATINGS_KEY = 'nq_topic_ratings'
const DEMO_SEEDED_KEY = 'nq_demo_seeded'
const REVISION_SCHEDULES_KEY = 'nq_revision_schedules'
const REVISION_STREAK_KEY = 'nq_revision_streak'
const REVISION_LAST_DATE_KEY = 'nq_revision_last_date'
const EXAMS_KEY = 'nq_exams'

const LEVELS = [
  { level: 1, title: 'Novice', minXP: 0, next: 100 },
  { level: 2, title: 'Learner', minXP: 100, next: 300 },
  { level: 3, title: 'Scholar', minXP: 300, next: 600 },
  { level: 4, title: 'Expert', minXP: 600, next: 1000 },
  { level: 5, title: 'Master', minXP: 1000, next: null },
]

const EXAM_COLORS = [
  { bg: 'rgba(127,119,221,0.2)', text: 'rgba(175,169,236,1)', border: 'rgba(127,119,221,0.4)' },
  { bg: 'rgba(239,159,39,0.15)', text: 'rgba(239,159,39,1)', border: 'rgba(239,159,39,0.35)' },
  { bg: 'rgba(99,153,34,0.15)', text: 'rgba(151,196,89,1)', border: 'rgba(99,153,34,0.35)' },
  { bg: 'rgba(224,75,74,0.15)', text: 'rgba(240,149,149,1)', border: 'rgba(224,75,74,0.35)' },
  { bg: 'rgba(29,158,117,0.15)', text: 'rgba(93,202,165,1)', border: 'rgba(29,158,117,0.35)' },
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

export function seedDemoData() {
  if (localStorage.getItem(DEMO_SEEDED_KEY)) return

  // Heatmap activity: 9 weeks of realistic demo activity.
  const activity = {}
  const today = new Date()
  const pattern = [
    0, 3, 2, 0, 4, 1, 0,
    2, 0, 5, 3, 0, 2, 0,
    0, 4, 3, 2, 5, 0, 1,
    3, 2, 0, 4, 3, 2, 0,
    0, 5, 4, 3, 6, 2, 0,
    4, 3, 5, 4, 7, 1, 0,
    0, 6, 5, 8, 5, 4, 2,
    3, 7, 6, 8, 9, 5, 0,
    0, 8, 6, 0, 0, 0, 0,
  ]

  pattern.forEach((count, index) => {
    if (count === 0) return
    const date = new Date(today)
    date.setDate(today.getDate() - (pattern.length - 1 - index))
    const key = date.toISOString().split('T')[0]
    activity[key] = count
  })

  localStorage.setItem(STUDY_ACTIVITY_KEY, JSON.stringify(activity))

  // XP: default to Scholar-level progress.
  if (!localStorage.getItem(XP_KEY)) {
    localStorage.setItem(XP_KEY, '350')
  }

  // Streak: default to a 5-day streak and mark today active.
  if (!localStorage.getItem(STREAK_KEY)) {
    localStorage.setItem(STREAK_KEY, '5')
    localStorage.setItem(LAST_ACTIVE_KEY, new Date().toISOString().split('T')[0])
  }

  localStorage.setItem(DEMO_SEEDED_KEY, 'true')
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
  localStorage.removeItem(STUDY_ACTIVITY_KEY)
  localStorage.removeItem(DAILY_CHALLENGE_KEY)
  localStorage.removeItem(CHALLENGE_COMPLETED_KEY)
  localStorage.removeItem(TOPIC_RATINGS_KEY)
  localStorage.removeItem(REVISION_SCHEDULES_KEY)
  localStorage.removeItem(REVISION_STREAK_KEY)
  localStorage.removeItem(REVISION_LAST_DATE_KEY)

  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('nq_revised_')) {
      localStorage.removeItem(key)
    }
  })
}

export function saveTopicRating(subjectId, chapterId, topicId, rating) {
  const ratings = getTopicRatings()
  ratings[`${subjectId}_${chapterId}_${topicId}`] = rating
  localStorage.setItem(TOPIC_RATINGS_KEY, JSON.stringify(ratings))
}

export function getTopicRatings() {
  try {
    return JSON.parse(localStorage.getItem(TOPIC_RATINGS_KEY) || '{}')
  } catch {
    return {}
  }
}

export function getTopicRating(subjectId, chapterId, topicId) {
  const ratings = getTopicRatings()
  return ratings[`${subjectId}_${chapterId}_${topicId}`] || 0
}

export function saveRevisionSchedule(subjectId, chapterId, topicId, difficultyRating) {
  const schedules = getRevisionSchedules()
  const key = `${subjectId}_${chapterId}_${topicId}`
  const now = new Date()

  const intervals = {
    1: [3, 7, 14, 30],
    2: [2, 5, 10, 21],
    3: [1, 3, 7, 14],
  }

  const existing = schedules[key]
  const reviewCount = existing ? existing.reviewCount + 1 : 0
  const rating = difficultyRating || existing?.difficulty || 2
  const levelIntervals = intervals[rating] || intervals[2]
  const daysUntilNext = levelIntervals[Math.min(reviewCount, levelIntervals.length - 1)]

  const nextReview = new Date(now)
  nextReview.setDate(nextReview.getDate() + daysUntilNext)

  schedules[key] = {
    subjectId,
    chapterId,
    topicId,
    difficulty: rating,
    lastReviewed: now.toISOString(),
    nextReview: nextReview.toISOString(),
    reviewCount,
    interval: daysUntilNext,
  }

  localStorage.setItem(REVISION_SCHEDULES_KEY, JSON.stringify(schedules))
}

export function getRevisionSchedules() {
  try {
    return JSON.parse(localStorage.getItem(REVISION_SCHEDULES_KEY) || '{}')
  } catch {
    return {}
  }
}

export function getRevisionStreak() {
  try {
    return parseInt(localStorage.getItem(REVISION_STREAK_KEY) || '0', 10)
  } catch {
    return 0
  }
}

export function updateRevisionStreak() {
  const today = new Date().toISOString().split('T')[0]
  const lastRevision = localStorage.getItem(REVISION_LAST_DATE_KEY)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  let streak = getRevisionStreak()
  if (lastRevision === yesterdayStr) {
    streak += 1
  } else if (lastRevision !== today) {
    streak = 1
  }

  localStorage.setItem(REVISION_STREAK_KEY, streak.toString())
  localStorage.setItem(REVISION_LAST_DATE_KEY, today)
  return streak
}

export function getDueRevisions(subjects = []) {
  const schedules = getRevisionSchedules()
  const today = new Date()
  const ratings = getTopicRatings()
  const due = []

  subjects.forEach((subject) => {
    ;(subject.chapters || []).forEach((chapter) => {
      ;(chapter.topics || []).forEach((topic) => {
        if (!topic.completed) return

        const key = `${subject.id}_${chapter.id}_${topic.id}`
        const schedule = schedules[key]
        const difficulty = ratings[key] || 2

        if (!schedule) {
          due.push({
            topicId: topic.id,
            topicTitle: topic.title,
            subjectId: subject.id,
            subjectName: subject.subject,
            chapterId: chapter.id,
            chapterTitle: chapter.title,
            difficulty,
            daysOverdue: 0,
            nextReview: null,
            isNew: true,
            score: 100 + difficulty * 10,
          })
          return
        }

        const nextReview = new Date(schedule.nextReview)
        const diffDays = Math.round((today - nextReview) / (1000 * 60 * 60 * 24))

        if (diffDays >= -1) {
          const overdueWeight = Math.max(0, diffDays) * 15
          const difficultyWeight = difficulty * 10
          const recencyDecay = Math.max(0, 10 - schedule.reviewCount * 2)
          const score = overdueWeight + difficultyWeight + recencyDecay

          due.push({
            topicId: topic.id,
            topicTitle: topic.title,
            subjectId: subject.id,
            subjectName: subject.subject,
            chapterId: chapter.id,
            chapterTitle: chapter.title,
            difficulty,
            daysOverdue: diffDays,
            nextReview: schedule.nextReview,
            reviewCount: schedule.reviewCount,
            score,
          })
        }
      })
    })
  })

  return due.sort((a, b) => b.score - a.score).slice(0, 5)
}

export function markTopicRevised(subjectId, chapterId, topicId) {
  const ratings = getTopicRatings()
  const key = `${subjectId}_${chapterId}_${topicId}`
  const difficulty = ratings[key] || 2
  saveRevisionSchedule(subjectId, chapterId, topicId, difficulty)
  updateRevisionStreak()
  saveXP(5)
}

export function getTodayRevisionProgress() {
  const today = new Date().toISOString().split('T')[0]
  try {
    return JSON.parse(localStorage.getItem(`nq_revised_${today}`) || '[]')
  } catch {
    return []
  }
}

export function markRevisedToday(key) {
  const today = new Date().toISOString().split('T')[0]
  const done = getTodayRevisionProgress()
  if (!done.includes(key)) {
    done.push(key)
    localStorage.setItem(`nq_revised_${today}`, JSON.stringify(done))
  }
}

export function getDailyChallenge() {
  try {
    return JSON.parse(localStorage.getItem(DAILY_CHALLENGE_KEY) || 'null')
  } catch {
    return null
  }
}

export function saveDailyChallenge(challenge) {
  localStorage.setItem(DAILY_CHALLENGE_KEY, JSON.stringify(challenge))
}

export function isChallengeCompleted() {
  try {
    return JSON.parse(localStorage.getItem(CHALLENGE_COMPLETED_KEY) || 'false')
  } catch {
    return false
  }
}

export function markChallengeCompleted() {
  localStorage.setItem(CHALLENGE_COMPLETED_KEY, 'true')
}

export function clearDailyChallenge() {
  localStorage.removeItem(DAILY_CHALLENGE_KEY)
  localStorage.removeItem(CHALLENGE_COMPLETED_KEY)
}

export function recordStudyActivity(topicsCompletedCount) {
  const today = new Date().toISOString().split('T')[0]
  const activity = getStudyActivity()
  const increment = Math.max(0, Number(topicsCompletedCount || 0))

  activity[today] = (activity[today] || 0) + increment
  localStorage.setItem(STUDY_ACTIVITY_KEY, JSON.stringify(activity))

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('nq-study-activity-updated'))
  }
}

export function getStudyActivity() {
  try {
    return JSON.parse(localStorage.getItem(STUDY_ACTIVITY_KEY) || '{}')
  } catch {
    return {}
  }
}

// Exam storage
export const getExams = () => {
  try {
    return JSON.parse(localStorage.getItem(EXAMS_KEY) || '[]')
  } catch {
    return []
  }
}

export const saveExam = (exam) => {
  // exam = { id, name, date, subjectIds[], color, createdAt }
  const exams = getExams()
  const existing = exams.findIndex((e) => e.id === exam.id)
  if (existing >= 0) {
    exams[existing] = { ...exams[existing], ...exam, updatedAt: new Date().toISOString() }
  } else {
    exams.push({
      ...exam,
      id: exam.id || `exam_${Date.now()}`,
      createdAt: new Date().toISOString(),
    })
  }
  localStorage.setItem(EXAMS_KEY, JSON.stringify(exams))
  return exams
}

export const deleteExam = (examId) => {
  const exams = getExams().filter((e) => e.id !== examId)
  localStorage.setItem(EXAMS_KEY, JSON.stringify(exams))
  return exams
}

export const getExamById = (examId) => {
  return getExams().find((e) => e.id === examId) || null
}

export const getExamsForDate = (dateStr) => {
  // dateStr = 'YYYY-MM-DD'
  return getExams().filter((e) => e.date === dateStr)
}

export const getExamsForMonth = (year, month) => {
  // month = 0-indexed (0 = January)
  return getExams().filter((e) => {
    const d = new Date(e.date)
    return d.getFullYear() === year && d.getMonth() === month
  })
}

// Exam status computation
export const computeExamStats = (exam, subjects) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const examDate = new Date(exam.date)
  examDate.setHours(0, 0, 0, 0)
  const daysLeft = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24))

  // Aggregate topics across all linked subjects
  const linkedSubjects = subjects.filter((s) => exam.subjectIds?.includes(s.id))
  const allTopics = linkedSubjects.flatMap((s) => s.chapters?.flatMap((c) => c.topics) ?? [])
  const total = allTopics.length
  const completed = allTopics.filter((t) => t.completed).length
  const remaining = total - completed
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  // Pace calculation
  const activity = getStudyActivity()
  const last7 = []
  for (let i = 1; i <= 7; i += 1) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    if (activity[key] > 0) last7.push(activity[key])
  }
  const yourPace =
    last7.length > 0
      ? parseFloat((last7.reduce((s, v) => s + v, 0) / last7.length).toFixed(1))
      : 0

  const requiredPace = daysLeft > 0 ? parseFloat((remaining / daysLeft).toFixed(1)) : remaining

  const todayTarget = daysLeft > 0 ? Math.ceil(requiredPace) : 0
  const forecastDays = yourPace > 0 ? Math.ceil(remaining / yourPace) : null

  // Status
  let status = 'on-track'
  if (daysLeft <= 0) status = 'exam-day'
  else if (remaining === 0) status = 'complete'
  else if (yourPace === 0 && remaining > 0) status = 'at-risk'
  else if (yourPace < requiredPace * 0.7) status = 'at-risk'
  else if (yourPace < requiredPace) status = 'behind'
  else status = 'on-track'

  return {
    daysLeft,
    remaining,
    completed,
    total,
    pct,
    requiredPace,
    yourPace,
    todayTarget,
    forecastDays,
    status,
    linkedSubjects,
    examDate: examDate.toLocaleDateString('en', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
  }
}

// Exam color assignment
export const getExamColor = (index) => {
  return EXAM_COLORS[index % EXAM_COLORS.length]
}

export const getExamColorById = (examId) => {
  const exams = getExams()
  const index = exams.findIndex((e) => e.id === examId)
  return getExamColor(index >= 0 ? index : 0)
}

// Mark exam day done
export const markExamDayDone = (examId) => {
  const today = new Date().toISOString().split('T')[0]
  const key = `nq_exam_day_${today}`
  const done = JSON.parse(localStorage.getItem(key) || '[]')
  if (!done.includes(examId)) {
    done.push(examId)
    localStorage.setItem(key, JSON.stringify(done))
  }
}

export const isExamDayDone = (examId) => {
  const today = new Date().toISOString().split('T')[0]
  const key = `nq_exam_day_${today}`
  const done = JSON.parse(localStorage.getItem(key) || '[]')
  return done.includes(examId)
}

export function getCompletionEstimate(subject) {
  const activity = getStudyActivity()

  const last7Days = []
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    last7Days.push(activity[key] || 0)
  }

  const totalLast7 = last7Days.reduce((sum, dayCount) => sum + dayCount, 0)
  const activeDays = last7Days.filter((dayCount) => dayCount > 0).length

  if (totalLast7 === 0) {
    return null
  }

  const allTopics = (subject?.chapters || []).flatMap((chapter) => chapter?.topics || [])
  const remaining = allTopics.filter((topic) => !topic?.completed).length

  if (remaining === 0) {
    return { done: true }
  }

  const dailyAvg = activeDays > 0 ? totalLast7 / activeDays : 0
  if (dailyAvg === 0) {
    return null
  }

  const daysToFinish = Math.ceil(remaining / dailyAvg)

  if (daysToFinish === 0) return { message: 'Almost done!', days: 0 }
  if (daysToFinish === 1) return { message: 'At your pace, done by tomorrow', days: 1 }
  if (daysToFinish <= 7) return { message: `At your pace, done in ~${daysToFinish} days`, days: daysToFinish }
  if (daysToFinish <= 30) return { message: `At your pace, done in ~${daysToFinish} days`, days: daysToFinish }

  return { message: `${remaining} topics left - keep going!`, days: daysToFinish }
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
