import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  computeExamStats,
  deleteExam,
  getExamColor,
  getExams,
  getSubjects,
  isExamDayDone,
  markExamDayDone,
  saveExam,
} from '../utils/storage'
import Navbar from '../components/Navbar'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const STATUS_CONFIG = {
  'on-track': { label: 'On track', bg: 'rgba(99,153,34,0.15)', color: 'rgba(151,196,89,1)' },
  behind: { label: 'Behind', bg: 'rgba(239,159,39,0.15)', color: 'rgba(239,159,39,1)' },
  'at-risk': { label: 'At risk', bg: 'rgba(224,75,74,0.15)', color: 'rgba(240,149,149,1)' },
  complete: { label: 'Complete', bg: 'rgba(99,153,34,0.15)', color: 'rgba(151,196,89,1)' },
  'exam-day': { label: 'Today!', bg: 'rgba(127,119,221,0.15)', color: 'rgba(175,169,236,1)' },
}

const generateCalendarDays = (year, month) => {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days = []

  for (let i = 0; i < firstDay; i += 1) days.push(null)
  for (let day = 1; day <= daysInMonth; day += 1) days.push(day)

  return days
}

function ExamModal({ open, onClose, onSave, subjects }) {
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [subjectIds, setSubjectIds] = useState([])

  useEffect(() => {
    if (!open) return
    setName('')
    setDate('')
    setSubjectIds([])
  }, [open])

  if (!open) return null

  const toggleSubject = (id) => {
    setSubjectIds((prev) => (prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!name.trim() || !date) return

    onSave({
      name: name.trim(),
      date,
      subjectIds,
    })
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.72)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 80,
        padding: 16,
      }}
      onClick={onClose}
      role="presentation"
    >
      <form
        onClick={(event) => event.stopPropagation()}
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: 420,
          borderRadius: 12,
          border: '0.5px solid rgba(255,255,255,0.12)',
          background: 'rgba(0,0,0,1)',
          padding: 16,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: 15,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.96)',
          }}
        >
          Schedule exam
        </h2>

        <p
          style={{
            margin: '6px 0 0',
            fontSize: 12,
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          Create an exam and link the subjects you are preparing.
        </p>

        <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
          <label style={{ display: 'grid', gap: 5 }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>Exam name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Physics midterm"
              style={{
                borderRadius: 8,
                border: '0.5px solid rgba(255,255,255,0.14)',
                background: 'rgba(255,255,255,0.02)',
                color: 'rgba(255,255,255,0.94)',
                fontSize: 13,
                padding: '9px 10px',
                outline: 'none',
              }}
            />
          </label>

          <label style={{ display: 'grid', gap: 5 }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>Exam date</span>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              style={{
                borderRadius: 8,
                border: '0.5px solid rgba(255,255,255,0.14)',
                background: 'rgba(255,255,255,0.02)',
                color: 'rgba(255,255,255,0.94)',
                fontSize: 13,
                padding: '9px 10px',
                outline: 'none',
              }}
            />
          </label>

          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 6 }}>
              Linked subjects
            </div>
            <div
              style={{
                maxHeight: 144,
                overflow: 'auto',
                borderRadius: 8,
                border: '0.5px solid rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.01)',
                padding: 8,
              }}
            >
              {subjects.length === 0 ? (
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>No subjects found.</div>
              ) : (
                subjects.map((subject) => {
                  const checked = subjectIds.includes(subject.id)
                  return (
                    <label
                      key={subject.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '6px 4px',
                        cursor: 'pointer',
                        fontSize: 12,
                        color: checked ? 'rgba(255,255,255,0.94)' : 'rgba(255,255,255,0.7)',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSubject(subject.id)}
                        style={{ accentColor: 'rgba(127,119,221,1)' }}
                      />
                      {subject.subject}
                    </label>
                  )
                })
              )}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 14,
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 8,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              border: '0.5px solid rgba(255,255,255,0.14)',
              background: 'transparent',
              color: 'rgba(255,255,255,0.72)',
              borderRadius: 8,
              padding: '7px 10px',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              border: 'none',
              background: 'rgba(127,119,221,0.9)',
              color: 'rgba(255,255,255,1)',
              borderRadius: 8,
              padding: '7px 12px',
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Save exam
          </button>
        </div>
      </form>
    </div>
  )
}

function Calendar() {
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedExam, setSelectedExam] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [exams, setExams] = useState([])
  const [subjects, setSubjects] = useState([])
  const [fadeIn, setFadeIn] = useState(false)
  const [doneTick, setDoneTick] = useState(0)

  useEffect(() => {
    setExams(getExams())
    setSubjects(getSubjects())
    const timer = setTimeout(() => setFadeIn(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const monthExams = useMemo(() => {
    return exams.filter((exam) => {
      const d = new Date(exam.date)
      return d.getFullYear() === year && d.getMonth() === month
    })
  }, [exams, month, year])

  const calDays = useMemo(() => generateCalendarDays(year, month), [month, year])
  const todayStr = new Date().toISOString().split('T')[0]

  const upcomingExams = useMemo(() => {
    return [...exams]
      .filter((exam) => exam.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [exams, todayStr])

  const selectedStats = useMemo(() => {
    if (!selectedExam) return null
    return computeExamStats(selectedExam, subjects)
  }, [selectedExam, subjects, doneTick])

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))

  const getDateStr = (day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const handleDayClick = (day) => {
    if (!day) return
    const dateStr = getDateStr(day)
    const dayExams = exams.filter((exam) => exam.date === dateStr)
    if (dayExams.length > 0) {
      setSelectedDate(dateStr)
      setSelectedExam(dayExams[0])
    } else {
      setSelectedDate(null)
      setSelectedExam(null)
    }
  }

  const handleDeleteExam = (examId) => {
    deleteExam(examId)
    const next = getExams()
    setExams(next)
    setSelectedExam(null)
  }

  const handleSaveExam = (examData) => {
    saveExam(examData)
    setExams(getExams())
    setShowModal(false)
  }

  const getSubjectCompletionPct = (subject) => {
    const topics = (subject?.chapters || []).flatMap((chapter) => chapter?.topics || [])
    if (topics.length === 0) return 0
    const completed = topics.filter((topic) => topic?.completed).length
    return Math.round((completed / topics.length) * 100)
  }

  return (
    <div
      style={{
        background: 'rgba(0,0,0,1)',
        minHeight: '100vh',
        color: 'rgba(255,255,255,1)',
        opacity: fadeIn ? 1 : 0,
        transform: fadeIn ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
      }}
    >
      <Navbar />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            border: '0.5px solid rgba(255,255,255,0.14)',
            borderRadius: 8,
            background: 'transparent',
            color: 'rgba(255,255,255,0.68)',
            cursor: 'pointer',
            fontSize: 12,
            padding: '6px 10px',
            marginBottom: 14,
          }}
        >
          ← Back
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 500,
                color: 'rgba(255,255,255,1)',
              }}
            >
              Exam calendar
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.35)' }}>
              Schedule exams and track your preparation pace.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            style={{
              fontSize: 13,
              fontWeight: 500,
              padding: '8px 16px',
              borderRadius: 8,
              background: 'rgba(127,119,221,0.9)',
              border: 'none',
              color: 'rgba(255,255,255,1)',
              cursor: 'pointer',
            }}
          >
            + Schedule exam
          </button>
        </div>

        <div
          className="nq-calendar-shell"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.2fr 1fr',
            border: '0.5px solid rgba(255,255,255,0.07)',
            borderRadius: 14,
            overflow: 'hidden',
          }}
        >
          <section
            className="nq-calendar-left"
            style={{
              borderRight: '0.5px solid rgba(255,255,255,0.07)',
              padding: 14,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 10,
              }}
            >
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: 'rgba(255,255,255,0.95)' }}>
                  {currentDate.toLocaleDateString('en', { month: 'long', year: 'numeric' })}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.34)' }}>
                  {monthExams.length} exams this month
                </div>
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={prevMonth}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 6,
                    border: '0.5px solid rgba(255,255,255,0.1)',
                    background: 'transparent',
                    color: 'rgba(255,255,255,0.72)',
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  ‹
                </button>
                <button
                  onClick={nextMonth}
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 6,
                    border: '0.5px solid rgba(255,255,255,0.1)',
                    background: 'transparent',
                    color: 'rgba(255,255,255,0.72)',
                    fontSize: 14,
                    cursor: 'pointer',
                  }}
                >
                  ›
                </button>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                gap: 2,
                marginBottom: 4,
              }}
            >
              {DAY_LABELS.map((label) => (
                <div
                  key={label}
                  style={{
                    fontSize: 10,
                    color: 'rgba(255,255,255,0.25)',
                    textAlign: 'center',
                    padding: '4px 0',
                  }}
                >
                  {label}
                </div>
              ))}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                gap: 2,
              }}
            >
              {calDays.map((day, index) => {
                const dateStr = day ? getDateStr(day) : null
                const dayExams = day ? exams.filter((exam) => exam.date === dateStr) : []
                const isToday = dateStr === todayStr
                const isSelected = selectedDate === dateStr
                const hasExam = dayExams.length > 0

                const cellBorder = isSelected
                  ? '0.5px solid rgba(127,119,221,0.5)'
                  : isToday
                    ? '0.5px solid rgba(127,119,221,0.4)'
                    : '0.5px solid rgba(255,255,255,0)'

                const cellBg = isSelected
                  ? 'rgba(127,119,221,0.15)'
                  : isToday
                    ? 'rgba(127,119,221,0.08)'
                    : 'rgba(255,255,255,0)'

                return (
                  <button
                    key={`${index}-${day || 'empty'}`}
                    type="button"
                    onClick={() => handleDayClick(day)}
                    disabled={!day}
                    style={{
                      aspectRatio: '1 / 1',
                      borderRadius: 7,
                      border: cellBorder,
                      background: cellBg,
                      color: day ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0)',
                      fontSize: 11,
                      textAlign: 'left',
                      padding: 4,
                      cursor: day ? 'pointer' : 'default',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      justifyContent: 'flex-start',
                      overflow: 'hidden',
                    }}
                    onMouseEnter={(event) => {
                      if (!day || isSelected || isToday) return
                      event.currentTarget.style.background = 'rgba(255,255,255,0.05)'
                      event.currentTarget.style.border = '0.5px solid rgba(255,255,255,0.08)'
                    }}
                    onMouseLeave={(event) => {
                      if (!day || isSelected || isToday) return
                      event.currentTarget.style.background = 'rgba(255,255,255,0)'
                      event.currentTarget.style.border = '0.5px solid rgba(255,255,255,0)'
                    }}
                  >
                    {day && (
                      <>
                        <span
                          style={{
                            fontSize: 10,
                            color: hasExam ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.62)',
                          }}
                        >
                          {day}
                        </span>
                        {dayExams.slice(0, 2).map((exam) => {
                          const color = getExamColor(exams.findIndex((entry) => entry.id === exam.id))
                          return (
                            <div
                              key={exam.id}
                              style={{
                                fontSize: 9,
                                fontWeight: 500,
                                padding: '1px 4px',
                                borderRadius: 3,
                                background: color.bg,
                                color: color.text,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: '100%',
                                marginTop: 1,
                              }}
                            >
                              {exam.name.slice(0, 8)}
                            </div>
                          )
                        })}
                        {dayExams.length > 2 && (
                          <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.45)', marginTop: 1 }}>
                            +{dayExams.length - 2} more
                          </span>
                        )}
                      </>
                    )}
                  </button>
                )
              })}
            </div>

            <div
              style={{
                display: 'flex',
                gap: 14,
                marginTop: 12,
                fontSize: 10,
                color: 'rgba(255,255,255,0.3)',
                flexWrap: 'wrap',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: 'rgba(127,119,221,0.8)',
                  }}
                />
                Today/selected
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: 'rgba(239,159,39,0.8)',
                  }}
                />
                Exam scheduled
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: 'rgba(224,75,74,0.8)',
                  }}
                />
                Overdue
              </span>
            </div>
          </section>

          <section style={{ padding: 14 }}>
            <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
              Upcoming exams
            </div>

            <div style={{ marginTop: 10 }}>
              {upcomingExams.length === 0 && (
                <div
                  style={{
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.45)',
                    border: '0.5px dashed rgba(255,255,255,0.14)',
                    borderRadius: 10,
                    padding: 10,
                  }}
                >
                  No upcoming exams yet.
                </div>
              )}

              {upcomingExams.map((exam) => {
                const examIndex = exams.findIndex((entry) => entry.id === exam.id)
                const examColor = getExamColor(examIndex)
                const stats = computeExamStats(exam, subjects)
                const statusMeta = STATUS_CONFIG[stats.status] || STATUS_CONFIG['on-track']
                const selected = selectedExam?.id === exam.id
                const isOverdue = exam.date < todayStr && stats.remaining > 0

                return (
                  <div
                    key={exam.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setSelectedExam(exam)
                      setSelectedDate(exam.date)
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        setSelectedExam(exam)
                        setSelectedDate(exam.date)
                      }
                    }}
                    style={{
                      background: selected ? 'rgba(127,119,221,0.06)' : 'rgba(255,255,255,0.02)',
                      border: `0.5px solid ${selected ? examColor.border : 'rgba(255,255,255,0.07)'}`,
                      borderRadius: 10,
                      padding: '10px 12px',
                      cursor: 'pointer',
                      marginBottom: 8,
                      transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: 'rgba(255,255,255,0.95)',
                          marginRight: 8,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {exam.name}
                      </div>
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 500,
                          borderRadius: 999,
                          padding: '2px 6px',
                          background: isOverdue ? 'rgba(224,75,74,0.15)' : statusMeta.bg,
                          color: isOverdue ? 'rgba(240,149,149,1)' : statusMeta.color,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {isOverdue ? 'Overdue' : statusMeta.label}
                      </span>
                    </div>

                    <div
                      style={{
                        marginTop: 5,
                        fontSize: 11,
                        color: 'rgba(255,255,255,0.45)',
                      }}
                    >
                      {stats.examDate} · {stats.daysLeft > 0 ? `${stats.daysLeft}d left` : 'Today'} ·{' '}
                      {stats.remaining} topics left
                    </div>

                    <div
                      style={{
                        marginTop: 7,
                        height: 2,
                        width: '100%',
                        borderRadius: 99,
                        background: 'rgba(255,255,255,0.08)',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.max(2, stats.pct)}%`,
                          height: '100%',
                          background: examColor.text,
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            <button
              style={{
                width: '100%',
                padding: 8,
                borderRadius: 8,
                border: '0.5px dashed rgba(255,255,255,0.15)',
                background: 'transparent',
                color: 'rgba(255,255,255,0.35)',
                fontSize: 12,
                cursor: 'pointer',
                marginTop: 4,
              }}
              onClick={() => setShowModal(true)}
            >
              + Schedule new exam
            </button>

            {selectedExam && selectedStats && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 11, textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>
                  {selectedExam.name} · {selectedStats.examDate}
                </div>

                <div
                  style={{
                    marginTop: 8,
                    borderRadius: 10,
                    border: '0.5px solid rgba(255,255,255,0.07)',
                    background: 'rgba(255,255,255,0.02)',
                    padding: '6px 10px',
                  }}
                >
                  {[
                    { label: 'Required pace', value: `${selectedStats.requiredPace} topics/day` },
                    {
                      label: 'Your pace',
                      value: `${selectedStats.yourPace} topics/day`,
                      valueColor:
                        selectedStats.yourPace < selectedStats.requiredPace
                          ? 'rgba(239,159,39,1)'
                          : 'rgba(255,255,255,0.9)',
                    },
                    { label: 'Topics today', value: `Do ${selectedStats.todayTarget} topics` },
                    {
                      label: 'Forecast',
                      value:
                        selectedStats.forecastDays === null
                          ? 'No pace data'
                          : `Done in ${selectedStats.forecastDays}d`,
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '5px 0',
                        borderBottom: '0.5px solid rgba(255,255,255,0.04)',
                      }}
                    >
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{row.label}</span>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 500,
                          color: row.valueColor || 'rgba(255,255,255,0.9)',
                        }}
                      >
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 10, fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Linked subjects</div>
                <div style={{ marginTop: 6, display: 'grid', gap: 6 }}>
                  {selectedStats.linkedSubjects.length === 0 && (
                    <div
                      style={{
                        fontSize: 11,
                        color: 'rgba(255,255,255,0.45)',
                        border: '0.5px dashed rgba(255,255,255,0.14)',
                        borderRadius: 8,
                        padding: 8,
                      }}
                    >
                      No linked subjects.
                    </div>
                  )}

                  {selectedStats.linkedSubjects.map((subject) => (
                    <div
                      key={subject.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: '0.5px solid rgba(255,255,255,0.07)',
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.01)',
                        padding: '6px 8px',
                      }}
                    >
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.84)' }}>📘 {subject.subject}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>
                        {getSubjectCompletionPct(subject)}%
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 10, display: 'grid', gap: 6 }}>
                  <button
                    onClick={() => navigate(`/subject/${selectedStats.linkedSubjects[0]?.id}`)}
                    disabled={!selectedStats.linkedSubjects[0]?.id}
                    style={{
                      border: '0.5px solid rgba(255,255,255,0.12)',
                      background: 'rgba(255,255,255,0.03)',
                      color: 'rgba(255,255,255,0.82)',
                      borderRadius: 8,
                      padding: '8px 10px',
                      fontSize: 12,
                      textAlign: 'left',
                      cursor: selectedStats.linkedSubjects[0]?.id ? 'pointer' : 'not-allowed',
                      opacity: selectedStats.linkedSubjects[0]?.id ? 1 : 0.5,
                    }}
                  >
                    Open subject →
                  </button>

                  <button
                    onClick={() => {
                      markExamDayDone(selectedExam.id)
                      setDoneTick((value) => value + 1)
                    }}
                    style={{
                      border: '0.5px solid rgba(99,153,34,0.35)',
                      background: 'rgba(99,153,34,0.12)',
                      color: 'rgba(151,196,89,1)',
                      borderRadius: 8,
                      padding: '8px 10px',
                      fontSize: 12,
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    {isExamDayDone(selectedExam.id) ? 'Done today ✓' : 'Mark today complete'}
                  </button>

                  <button
                    onClick={() => handleDeleteExam(selectedExam.id)}
                    style={{
                      border: '0.5px solid rgba(224,75,74,0.35)',
                      background: 'rgba(224,75,74,0.08)',
                      color: 'rgba(240,149,149,0.7)',
                      borderRadius: 8,
                      padding: '8px 10px',
                      fontSize: 12,
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    Delete exam
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      <ExamModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveExam}
        subjects={subjects}
      />

      <style>{`
        @media (max-width: 980px) {
          .nq-calendar-shell {
            grid-template-columns: 1fr !important;
          }

          .nq-calendar-left {
            border-right: none !important;
            border-bottom: 0.5px solid rgba(255,255,255,0.07);
          }
        }
      `}</style>
    </div>
  )
}

export default Calendar
