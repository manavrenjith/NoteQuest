const TYPE_STYLES = {
  success: 'border-emerald-400/50 bg-emerald-500/20 text-emerald-100',
  info: 'border-indigo-400/50 bg-indigo-500/20 text-indigo-100',
  warning: 'border-amber-400/50 bg-amber-500/20 text-amber-100',
}

function Toast({ toasts, onDismiss }) {
  if (!toasts.length) {
    return null
  }

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[90] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 sm:bottom-6 sm:right-6 sm:w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-xl border px-4 py-3 text-sm shadow-xl backdrop-blur transition ${
            TYPE_STYLES[toast.type] || TYPE_STYLES.info
          } animate-[fadeIn_180ms_ease-out]`}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="font-semibold">{toast.message}</p>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="rounded-md px-2 py-0.5 text-xs text-slate-100/80 transition hover:bg-slate-950/30 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
            >
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Toast
