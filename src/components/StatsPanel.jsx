import { BookOpen, CheckCircle2, Flame, Sparkles } from 'lucide-react'

function StatsPanel({ totalCompletedTopics, totalSubjects, streak, xp }) {
  const stats = [
    {
      label: 'Topics Completed',
      value: totalCompletedTopics,
      icon: CheckCircle2,
    },
    {
      label: 'Subjects Added',
      value: totalSubjects,
      icon: BookOpen,
    },
    {
      label: 'Current Streak',
      value: streak,
      suffix: 'days',
      icon: Flame,
    },
    {
      label: 'Total XP',
      value: xp,
      icon: Sparkles,
    },
  ]

  return (
    <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat) => (
        <article key={stat.label} className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <div className="mb-3 inline-flex rounded-lg bg-indigo-500/20 p-2 text-indigo-300">
            <stat.icon className="h-4 w-4" />
          </div>
          <p className="text-xs uppercase tracking-wide text-slate-400">{stat.label}</p>
          <p className="mt-1 text-2xl font-bold text-indigo-400">
            {stat.value} {stat.suffix ? <span className="text-sm text-slate-300">{stat.suffix}</span> : null}
          </p>
        </article>
      ))}
    </section>
  )
}

export default StatsPanel
