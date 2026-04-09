import { Lock, ShieldCheck } from 'lucide-react'

function BadgeCard({ title, description, unlocked }) {
  return (
    <article
      className={`rounded-xl border p-4 transition-all duration-300 ${
        unlocked
          ? 'border-yellow-400/40 bg-yellow-300/10 shadow-[0_0_18px_rgba(250,204,21,0.35)]'
          : 'border-slate-700 bg-slate-800/70 opacity-75'
      }`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h4 className={`text-base font-semibold ${unlocked ? 'text-yellow-200' : 'text-slate-300'}`}>{title}</h4>
        {unlocked ? <ShieldCheck className="h-5 w-5 text-yellow-300" /> : <Lock className="h-5 w-5 text-slate-500" />}
      </div>
      <p className="text-sm text-slate-300">{description}</p>
    </article>
  )
}

export default BadgeCard
