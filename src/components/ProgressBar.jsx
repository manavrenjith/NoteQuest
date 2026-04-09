function ProgressBar({ totalTopics, completedTopics }) {
  const percent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
        <span>
          {completedTopics} / {totalTopics} topics completed ({percent}%)
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-700">
        <div
          className="h-full bg-green-500 transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

export default ProgressBar
