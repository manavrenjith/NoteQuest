import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CertificateModal from '../components/CertificateModal'
import Navbar from '../components/Navbar'
import Roadmap from '../components/Roadmap'
import TopicBoard from '../components/TopicBoard'
import { getSubjectStudyTip } from '../utils/gemini'
import {
  estimateChapterTime,
  estimateSubjectTime,
  getCompletionEstimate,
  getLevel,
  getSubjects,
  getXP,
  isWeakTopic,
} from '../utils/storage'

const TABS = ['Overview', 'Roadmap', 'Topics', 'Quiz']

function getSubjectEmoji(name = '') {
  const n = String(name).toLowerCase()
  if (n.includes('math') || n.includes('algebra') || n.includes('calculus')) return '📐'
  if (n.includes('chemistry') || n.includes('chem')) return '🧪'
  if (n.includes('physics')) return '⚡'
  if (n.includes('cs') || n.includes('computer') || n.includes('programming') || n.includes('data structure')) return '💻'
  if (n.includes('biology') || n.includes('bio')) return '🧬'
  if (n.includes('history')) return '📖'
  if (n.includes('english') || n.includes('literature')) return '✍️'
  if (n.includes('economics') || n.includes('econ')) return '📊'
  return '📚'
}

function getStatus(pct) {
  if (pct === 100) return 'completed'
  if (pct > 0) return 'in-progress'
  return 'not-started'
}

function StatusBadge({ status }) {
  if (status === 'completed') {
    return (
      <span
        style={{
          background: 'rgba(99,153,34,0.15)',
          color: '#97C459',
          fontSize: 12,
          fontWeight: 500,
          padding: '4px 10px',
          borderRadius: 999,
          marginLeft: 'auto',
        }}
      >
        Completed ✓
      </span>
    )
  }

  if (status === 'in-progress') {
    return (
      <span
        style={{
          background: 'rgba(127,119,221,0.15)',
          color: '#AFA9EC',
          fontSize: 12,
          fontWeight: 500,
          padding: '4px 10px',
          borderRadius: 999,
          marginLeft: 'auto',
        }}
      >
        In progress
      </span>
    )
  }

  return (
    <span
      style={{
        background: 'rgba(255,255,255,0.05)',
        color: 'rgba(255,255,255,0.3)',
        fontSize: 12,
        fontWeight: 500,
        padding: '4px 10px',
        borderRadius: 999,
        marginLeft: 'auto',
      }}
    >
      Not started
    </span>
  )
}

export default function SubjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [subject, setSubject] = useState(null)
  const [activeTab, setActiveTab] = useState('Overview')
  const [subjectTip, setSubjectTip] = useState('')
  const [tipLoading, setTipLoading] = useState(false)
  const [certSubject, setCertSubject] = useState(null)
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [quizStarted, setQuizStarted] = useState(false)

  useEffect(() => {
    const all = getSubjects()
    const found = all.find((item) => item.id === id)
    if (!found) {
      navigate('/notes')
      return
    }

    setSubject(found)
  }, [id, navigate])

  const chapters = subject?.chapters || []
  const totalTopics = chapters.reduce((sum, chapter) => sum + (chapter?.topics || []).length, 0)
  const done = chapters.reduce(
    (sum, chapter) => sum + (chapter?.topics || []).filter((topic) => Boolean(topic.completed)).length,
    0,
  )
  const pct = totalTopics > 0 ? Math.round((done / totalTopics) * 100) : 0
  const status = getStatus(pct)
  const emoji = getSubjectEmoji(subject?.subject)

  const weakTopics = useMemo(() => {
    if (!subject) return []

    return chapters.flatMap((chapter) => {
      return (chapter?.topics || [])
        .filter((topic) => isWeakTopic(subject.id, chapter.id, topic.id))
        .map((topic) => ({
          ...topic,
          chapterTitle: chapter.title,
        }))
    })
  }, [chapters, subject])

  const weakCount = weakTopics.length
  const estimate = subject ? getCompletionEstimate(subject) : null
  const remaining = Math.max(0, totalTopics - done)

  const stats = [
    { label: 'Topics done', value: `${done}/${totalTopics}` },
    { label: 'Chapters', value: chapters.length },
    { label: 'Est. time left', value: estimateSubjectTime(subject) },
    { label: 'Weak topics', value: weakCount },
  ]

  const handleUpdate = (updatedSubject) => {
    const all = getSubjects()
    const idx = all.findIndex((item) => item.id === id)
    if (idx !== -1) {
      all[idx] = updatedSubject
      localStorage.setItem('notequest_subjects', JSON.stringify(all))
      setSubject(updatedSubject)
    }
  }

  const fetchSubjectTip = async () => {
    if (!subject) return

    setTipLoading(true)
    try {
      const tip = await getSubjectStudyTip(subject.subject, chapters)
      setSubjectTip(tip)
    } catch (error) {
      setSubjectTip('Try active recall after each chapter and revisit weak topics tomorrow.')
    } finally {
      setTipLoading(false)
    }
  }

  if (!subject) {
    return null
  }

  return (
    <main style={{ background: '#000', minHeight: '100vh', color: 'rgba(255,255,255,0.95)' }}>
      <Navbar showXpPill />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '1.5rem 1.5rem 2.5rem' }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            fontSize: 12,
            color: 'rgba(255,255,255,0.45)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginBottom: 14,
            padding: 0,
          }}
        >
          ← Back
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 32 }}>{emoji}</div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 500, color: 'rgba(255,255,255,1)' }}>{subject.subject}</h1>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
              {chapters.length} chapters · {totalTopics} topics
            </div>
          </div>
          <StatusBadge status={status} />
        </div>

        <div style={{ marginTop: 16 }}>
          <div
            style={{
              height: 6,
              background: 'rgba(255,255,255,0.07)',
              borderRadius: 99,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${pct}%`,
                background: pct === 100 ? '#639922' : '#7F77DD',
                borderRadius: 99,
                transition: 'width 0.5s ease',
              }}
            />
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 6 }}>
            {done} / {totalTopics} topics completed · {pct}%
          </div>
        </div>

        <div
          style={{
            marginTop: 18,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: 10,
          }}
        >
          {stats.map((item) => (
            <div
              key={item.label}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '0.5px solid rgba(255,255,255,0.07)',
                borderRadius: 10,
                padding: '1rem',
              }}
            >
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{item.label}</div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 500,
                  color: item.label === 'Weak topics' && weakCount > 0 ? '#EF9F27' : 'rgba(255,255,255,1)',
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 18,
            borderBottom: '0.5px solid rgba(255,255,255,0.07)',
            display: 'flex',
            gap: 6,
            overflowX: 'auto',
          }}
        >
          {TABS.map((tab) => {
            const active = activeTab === tab
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                style={{
                  fontSize: 13,
                  color: active ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.4)',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: active ? '2px solid #7F77DD' : '2px solid transparent',
                  padding: '10px 10px 9px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {tab}
              </button>
            )
          })}
        </div>

        <div style={{ marginTop: 16 }}>
          {activeTab === 'Overview' ? (
            <>
              {chapters.map((chapter) => {
                const chapterTotal = (chapter?.topics || []).length
                const chapterDone = (chapter?.topics || []).filter((topic) => Boolean(topic.completed)).length
                const chapterPct = chapterTotal > 0 ? Math.round((chapterDone / chapterTotal) * 100) : 0

                return (
                  <div
                    key={chapter.id}
                    style={{
                      background: '#0a0a0a',
                      border: '0.5px solid rgba(255,255,255,0.07)',
                      borderRadius: 10,
                      padding: '1rem',
                      marginBottom: 8,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: 8,
                        gap: 8,
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,1)' }}>{chapter.title}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                          {chapterDone}/{chapterTotal} topics · {estimateChapterTime(chapter)}
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: chapterPct === 100 ? '#97C459' : '#AFA9EC' }}>{chapterPct}%</div>
                    </div>
                    <div
                      style={{
                        height: 3,
                        background: 'rgba(255,255,255,0.07)',
                        borderRadius: 99,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${chapterPct}%`,
                          background: chapterPct === 100 ? '#639922' : '#7F77DD',
                          borderRadius: 99,
                        }}
                      />
                    </div>
                  </div>
                )
              })}

              {weakTopics.length > 0 ? (
                <div style={{ marginTop: 24 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#EF9F27', marginBottom: 12 }}>
                    ⚠ {weakTopics.length} topic{weakTopics.length > 1 ? 's' : ''} need review
                  </div>
                  {weakTopics.map((topic) => (
                    <div
                      key={`${topic.id}_${topic.chapterTitle}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 12px',
                        borderRadius: 8,
                        marginBottom: 6,
                        background: 'rgba(239,159,39,0.05)',
                        border: '0.5px solid rgba(239,159,39,0.15)',
                      }}
                    >
                      <span style={{ fontSize: 12 }}>⚠</span>
                      <span style={{ fontSize: 13, color: '#EF9F27' }}>{topic.title}</span>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' }}>
                        {topic.chapterTitle}
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}

              <div style={{ marginTop: 24 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 12,
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,1)' }}>💡 Study tips</div>
                  <button
                    type="button"
                    onClick={fetchSubjectTip}
                    style={{
                      fontSize: 11,
                      color: '#7F77DD',
                      background: 'none',
                      border: '0.5px solid rgba(127,119,221,0.3)',
                      borderRadius: 6,
                      padding: '3px 8px',
                      cursor: 'pointer',
                    }}
                  >
                    {tipLoading ? 'Thinking...' : 'Get tip'}
                  </button>
                </div>
                {subjectTip ? (
                  <div
                    style={{
                      fontSize: 13,
                      color: 'rgba(255,255,255,0.7)',
                      background: 'rgba(127,119,221,0.08)',
                      border: '0.5px solid rgba(127,119,221,0.2)',
                      borderRadius: 8,
                      padding: '10px 14px',
                      lineHeight: 1.6,
                    }}
                  >
                    {subjectTip}
                  </div>
                ) : null}
              </div>

              {estimate && !estimate.done ? (
                <div
                  style={{
                    marginTop: 24,
                    padding: '10px 14px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '0.5px solid rgba(255,255,255,0.07)',
                    borderRadius: 8,
                    fontSize: 12,
                    color: 'rgba(255,255,255,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  📅 {estimate.message}
                  <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.3)' }}>{remaining} topics remaining</span>
                </div>
              ) : null}
            </>
          ) : null}

          {activeTab === 'Roadmap' ? <Roadmap subject={subject} onUpdate={handleUpdate} /> : null}

          {activeTab === 'Topics' ? <TopicBoard subject={subject} onSubjectUpdate={handleUpdate} /> : null}

          {activeTab === 'Quiz' ? (
            <div>
              {!quizStarted ? (
                <div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>
                    Select a chapter to test yourself
                  </div>
                  {chapters.map((chapter) => {
                    const chapterDone = (chapter.topics || []).filter((topic) => Boolean(topic.completed)).length
                    const canQuiz = chapterDone > 0

                    return (
                      <div
                        key={chapter.id}
                        onClick={() => canQuiz && setSelectedChapter(chapter)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          borderRadius: 10,
                          marginBottom: 8,
                          cursor: canQuiz ? 'pointer' : 'not-allowed',
                          background: selectedChapter?.id === chapter.id ? 'rgba(127,119,221,0.1)' : '#0a0a0a',
                          border: `0.5px solid ${selectedChapter?.id === chapter.id ? 'rgba(127,119,221,0.4)' : 'rgba(255,255,255,0.07)'}`,
                          opacity: canQuiz ? 1 : 0.4,
                          transition: 'all 0.15s',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,1)' }}>{chapter.title}</div>
                          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                            {chapterDone}/{chapter.topics.length} topics complete
                            {!canQuiz ? ' · Complete topics first' : ''}
                          </div>
                        </div>
                        {selectedChapter?.id === chapter.id ? (
                          <span style={{ fontSize: 11, color: '#AFA9EC' }}>Selected ✓</span>
                        ) : null}
                      </div>
                    )
                  })}

                  {selectedChapter ? (
                    <button
                      type="button"
                      onClick={() => {
                        setQuizStarted(true)
                        navigate(`/quiz/${subject.id}/${selectedChapter.id}`, {
                          state: { subject, chapter: selectedChapter },
                        })
                      }}
                      style={{
                        marginTop: 16,
                        width: '100%',
                        padding: '10px',
                        background: '#7F77DD',
                        border: 'none',
                        borderRadius: 8,
                        color: 'rgba(255,255,255,1)',
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: 'pointer',
                      }}
                    >
                      Start quiz for {selectedChapter.title} →
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        {pct === 100 ? (
          <div
            style={{
              marginTop: 32,
              background: 'rgba(99,153,34,0.08)',
              border: '0.5px solid rgba(99,153,34,0.25)',
              borderRadius: 12,
              padding: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontSize: 15, fontWeight: 500, color: '#97C459', marginBottom: 4 }}>🎓 Subject complete!</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                You've completed all topics in {subject.subject}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCertSubject(subject)}
              style={{
                fontSize: 13,
                fontWeight: 500,
                padding: '8px 16px',
                background: '#639922',
                border: 'none',
                borderRadius: 8,
                color: 'rgba(255,255,255,1)',
                cursor: 'pointer',
              }}
            >
              Download certificate
            </button>
          </div>
        ) : null}

        {certSubject ? (
          <CertificateModal
            subject={certSubject}
            xp={getXP()}
            level={getLevel(getXP())}
            onClose={() => setCertSubject(null)}
          />
        ) : null}
      </div>
    </main>
  )
}
