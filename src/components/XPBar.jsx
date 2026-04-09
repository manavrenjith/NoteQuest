import { Flame } from 'lucide-react'
import { getLevel } from '../utils/storage'

const LEVEL_THRESHOLDS = {
  1: 0,
  2: 100,
  3: 300,
  4: 600,
  5: 1000,
}

function XPBar({ xp, streak }) {
  const level = getLevel(xp)
  const previousThreshold = LEVEL_THRESHOLDS[level.level] ?? 0
  const nextThreshold = level.next ?? previousThreshold
  const progressTotal = nextThreshold - previousThreshold
  const progressValue = level.next === null ? progressTotal : Math.max(0, xp - previousThreshold)
  const progressPercent = level.next === null ? 100 : Math.max(0, Math.min(100, (progressValue / progressTotal) * 100))

  return (
    <section className="mb-5 rounded-2xl border border-slate-700 bg-slate-800 p-4 shadow-lg shadow-black/20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-xl">
          <p className="mb-1 text-sm font-medium uppercase tracking-wide text-indigo-300">Level {level.level}</p>
          <h2 className="text-xl font-semibold text-slate-100">{level.title}</h2>
          <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-slate-700">
            <div
              className="h-full rounded-full bg-indigo-500 shadow-[0_0_16px_rgba(99,102,241,0.9)] transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-slate-300">
            {level.next === null ? `${xp} / MAX XP` : `${xp} / ${level.next} XP`}
          </p>
        </div>

        <div className="inline-flex items-center gap-2 self-start rounded-xl border border-orange-300/20 bg-orange-400/10 px-3 py-2 text-orange-300">
          <Flame className="h-4 w-4" />
          <span className="text-sm font-semibold">{streak} day streak</span>
        </div>
      </div>
    </section>
  )
}

export default XPBar
