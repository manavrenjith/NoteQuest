import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useToast } from '../hooks/useToast'
import { generateQuiz } from '../utils/gemini'
import { getSubjects, getXP, saveXP } from '../utils/storage'

function Quiz() {
  const navigate = useNavigate()
  const location = useLocation()
  const { subjectId, chapterId } = useParams()
  const { success, warning, info } = useToast()

  const stateChapter = location.state?.chapter
  const stateSubject = location.state?.subject

  const subject = useMemo(() => {
    if (stateSubject) return stateSubject
    if (!subjectId) return null
    return getSubjects().find((item) => item.id === subjectId) || null
  }, [stateSubject, subjectId])

  const chapter = useMemo(() => {
    if (stateChapter) return stateChapter
    if (!subject || !chapterId) return null
    return (subject.chapters || []).find((item) => item.id === chapterId) || null
  }, [chapterId, stateChapter, subject])

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [didAwardAttemptXP, setDidAwardAttemptXP] = useState(false)
  const [isRewardsClaimed, setIsRewardsClaimed] = useState(false)

  useEffect(() => {
    if (!chapter?.topics?.length) {
      setIsLoading(false)
      return
    }

    let isMounted = true

    const run = async () => {
      setIsLoading(true)
      setError('')
      try {
        const quiz = await generateQuiz(chapter.topics)
        if (isMounted) {
          if (!quiz.questions.length) {
            setError('Could not generate quiz questions for this chapter.')
          }
          setQuestions(quiz.questions)
        }
      } catch (quizError) {
        console.error(quizError)
        if (isMounted) {
          setError('Failed to generate quiz. Please try again in a moment.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    run()

    return () => {
      isMounted = false
    }
  }, [chapter])

  const total = questions.length
  const currentQuestion = questions[currentIndex]
  const selectedAnswer = answers[currentIndex]

  const score = useMemo(
    () =>
      questions.reduce((sum, question, index) => {
        if (answers[index] === question.correct) {
          return sum + 1
        }
        return sum
      }, 0),
    [answers, questions],
  )

  const isComplete = total > 0 && Object.keys(answers).length === total

  const handleSelect = (optionIndex) => {
    if (typeof answers[currentIndex] !== 'undefined') {
      return
    }

    if (!didAwardAttemptXP) {
      saveXP(30)
      setDidAwardAttemptXP(true)
      info('+30 XP earned! ⚡')
    }

    setAnswers((prev) => ({ ...prev, [currentIndex]: optionIndex }))
  }

  const handleFinish = () => {
    if (isRewardsClaimed) {
      return
    }

    if (!isComplete) {
      warning('Please answer all questions before finishing.')
      return
    }

    if (score === total && total > 0) {
      saveXP(20)
      success('Perfect score bonus! +20 XP')
    }

    success('Quiz complete! 🧠')
    setIsRewardsClaimed(true)
  }

  const handleSkip = () => {
    warning('Quiz skipped')
    navigate('/dashboard')
  }

  if (!chapter || !subject) {
    return (
      <main className="min-h-screen bg-slate-900 text-slate-100">
        <Navbar />
        <div className="mx-auto max-w-4xl px-4 py-10">
          <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-6 text-center">
            <h1 className="text-2xl font-bold text-white">Quiz data not found</h1>
            <p className="mt-2 text-slate-300">Open a completed chapter from your dashboard to start a quiz.</p>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="mt-4 rounded-xl bg-indigo-500 px-5 py-2.5 font-semibold text-white transition hover:bg-indigo-400"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100">
      <Navbar />
      <div className="mx-auto max-w-4xl px-4 py-8">
        <header className="mb-6">
          <p className="text-sm uppercase tracking-wide text-indigo-300">Quiz Mode</p>
          <h1 className="text-3xl font-black text-white">{subject.subject}</h1>
          <p className="mt-1 text-slate-300">{chapter.title}</p>
        </header>

        {isLoading ? (
          <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-6 text-slate-200">Generating quiz...</div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 p-6 text-rose-200">{error}</div>
        ) : isComplete ? (
          <section className="rounded-2xl border border-slate-700 bg-slate-800/80 p-6 text-center">
            <h2 className="text-3xl font-black text-white">{score}/{total} correct!</h2>
            <p className="mt-2 text-slate-300">You earned +30 XP for attempting the quiz.</p>
            {score === total ? <p className="mt-1 text-indigo-300">Perfect score bonus: +20 XP</p> : null}
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={handleFinish}
                disabled={isRewardsClaimed}
                className="rounded-xl bg-indigo-500 px-5 py-2.5 font-semibold text-white transition hover:bg-indigo-400"
              >
                {isRewardsClaimed ? 'Rewards Claimed' : 'Claim Rewards'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="rounded-xl border border-slate-600 px-5 py-2.5 font-semibold text-slate-100 transition hover:border-indigo-400"
              >
                Back to Dashboard
              </button>
            </div>
          </section>
        ) : (
          <section className="rounded-2xl border border-slate-700 bg-slate-800/80 p-5 sm:p-6">
            <p className="mb-3 text-sm text-indigo-300">
              Question {currentIndex + 1} of {total}
            </p>
            <h2 className="text-xl font-semibold text-white">{currentQuestion?.question}</h2>

            <div className="mt-5 grid gap-3">
              {(currentQuestion?.options || []).map((option, optionIndex) => {
                const hasAnswered = typeof selectedAnswer !== 'undefined'
                const isSelected = selectedAnswer === optionIndex
                const isCorrect = currentQuestion.correct === optionIndex

                let optionClass = 'border-slate-600 bg-slate-900 text-slate-100 hover:border-indigo-400'
                if (hasAnswered && isCorrect) {
                  optionClass = 'border-emerald-400/50 bg-emerald-500/20 text-emerald-100'
                } else if (hasAnswered && isSelected && !isCorrect) {
                  optionClass = 'border-rose-400/50 bg-rose-500/20 text-rose-100'
                }

                return (
                  <button
                    key={`${option}_${optionIndex}`}
                    type="button"
                    onClick={() => handleSelect(optionIndex)}
                    disabled={hasAnswered}
                    className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 ${optionClass}`}
                  >
                    {option}
                  </button>
                )
              })}
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={handleSkip}
                className="rounded-xl border border-slate-600 px-4 py-2 font-semibold text-slate-200 transition hover:border-amber-400 hover:text-amber-300"
              >
                Skip Quiz
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="rounded-xl border border-slate-600 px-4 py-2 font-semibold text-slate-100 transition hover:border-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.min(total - 1, prev + 1))}
                  disabled={currentIndex === total - 1}
                  className="rounded-xl bg-indigo-500 px-4 py-2 font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        )}

        <p className="mt-4 text-sm text-slate-400">Current XP: {getXP()}</p>
      </div>
    </main>
  )
}

export default Quiz
