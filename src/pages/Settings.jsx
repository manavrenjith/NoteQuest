import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useToast } from '../hooks/useToast'
import { clearAll, getSubjectStats, getSubjects, getXP, saveXP } from '../utils/storage'
import { applyTheme, getTheme, onThemeChange } from '../utils/theme'

function Settings() {
  const navigate = useNavigate()
  const { success, warning, info } = useToast()
  const [theme, setTheme] = useState(() => getTheme())
  const [subjects, setSubjects] = useState(() => getSubjects())
  const [xp, setXP] = useState(() => getXP())

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  useEffect(() => onThemeChange(setTheme), [])

  const stats = useMemo(() => getSubjectStats(subjects), [subjects])

  const handleResetAll = () => {
    if (!window.confirm('Reset all progress? This clears subjects, XP, streak, and badges.')) {
      return
    }

    clearAll()
    setSubjects([])
    setXP(0)
    warning('All progress reset')
    navigate('/')
  }

  const handleResetXPOnly = () => {
    if (!window.confirm('Reset XP only?')) {
      return
    }

    saveXP(-getXP())
    setXP(0)
    info('XP reset to 0')
  }

  const handleExportData = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      subjects: getSubjects(),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'notequest-data.json'
    anchor.click()
    URL.revokeObjectURL(url)
    success('Data export started')
  }

  return (
    <main className="min-h-screen bg-black text-slate-100">
      <Navbar />
      <div className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-3xl font-black text-white">Settings</h1>
        <p className="mt-2 text-slate-300">Manage your NoteQuest data and visual preferences.</p>

        <section className="mt-6 rounded-2xl border border-[#888] bg-[#0a0a0a] p-5">
          <h2 className="text-xl font-semibold text-white">Current Stats</h2>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-[#888] bg-[#0a0a0a] p-4">
              <p className="text-sm text-slate-300">Total Subjects</p>
              <p className="mt-1 text-2xl font-bold text-indigo-300">{stats.totalSubjects}</p>
            </div>
            <div className="rounded-xl border border-[#888] bg-[#0a0a0a] p-4">
              <p className="text-sm text-slate-300">Total Topics</p>
              <p className="mt-1 text-2xl font-bold text-indigo-300">{stats.totalTopics}</p>
            </div>
            <div className="rounded-xl border border-[#888] bg-[#0a0a0a] p-4">
              <p className="text-sm text-slate-300">Total XP</p>
              <p className="mt-1 text-2xl font-bold text-indigo-300">{xp}</p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-[#888] bg-[#0a0a0a] p-5">
          <h2 className="text-xl font-semibold text-white">Theme</h2>
          <div className="mt-3 inline-flex rounded-xl border border-[#888] bg-[#0d0d0d] p-1">
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                theme === 'dark' ? 'bg-indigo-500 text-white' : 'text-slate-200 hover:text-white'
              }`}
            >
              Dark
            </button>
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                theme === 'light' ? 'bg-indigo-500 text-white' : 'text-slate-200 hover:text-white'
              }`}
            >
              Lighter
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-[#888] bg-[#0a0a0a] p-5">
          <h2 className="text-xl font-semibold text-white">Data Controls</h2>
          <div className="mt-4 flex flex-col gap-3">
            <button
              type="button"
              onClick={handleExportData}
              className="rounded-xl border border-[#888] bg-[#0a0a0a] px-4 py-2.5 text-left font-semibold text-slate-100 transition hover:border-indigo-400"
            >
              Export My Data
            </button>
            <button
              type="button"
              onClick={handleResetXPOnly}
              className="rounded-xl border border-[#888] bg-amber-500/10 px-4 py-2.5 text-left font-semibold text-amber-100 transition hover:bg-amber-500/20"
            >
              Reset XP Only
            </button>
            <button
              type="button"
              onClick={handleResetAll}
              className="rounded-xl border border-[#888] bg-rose-500/10 px-4 py-2.5 text-left font-semibold text-rose-100 transition hover:bg-rose-500/20"
            >
              Reset All Progress
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}

export default Settings
