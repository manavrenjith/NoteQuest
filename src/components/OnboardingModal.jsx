function OnboardingModal({ isOpen, onClose, onGoUpload }) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end bg-slate-950/80 p-0 sm:items-center sm:justify-center sm:px-4 animate-[fadeIn_220ms_ease-out]">
      <div className="h-full w-full overflow-y-auto border border-slate-700 bg-slate-900 p-6 sm:h-auto sm:max-h-[90vh] sm:max-w-xl sm:rounded-2xl animate-[scaleIn_220ms_ease-out]">
        <p className="text-sm uppercase tracking-wide text-indigo-300">Welcome</p>
        <h2 className="mt-2 text-3xl font-black text-white">Welcome to NoteQuest! 👋</h2>
        <p className="mt-3 text-slate-300">Your study flow in 3 simple steps:</p>

        <div className="mt-6 space-y-3">
          <div className="rounded-xl border border-slate-700 bg-slate-800/70 p-4">
            <p className="font-semibold text-white">1. Upload Notes</p>
            <p className="text-sm text-slate-300">Paste notes or upload a text file to begin.</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-800/70 p-4">
            <p className="font-semibold text-white">2. Get Topics</p>
            <p className="text-sm text-slate-300">AI breaks your syllabus into chapters and topics.</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-800/70 p-4">
            <p className="font-semibold text-white">3. Track Progress</p>
            <p className="text-sm text-slate-300">Complete topics, earn XP, and unlock badges.</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-600 px-4 py-2.5 font-semibold text-slate-200 transition hover:border-slate-400 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
          >
            Maybe Later
          </button>
          <button
            type="button"
            onClick={onGoUpload}
            className="rounded-xl bg-indigo-500 px-4 py-2.5 font-semibold text-white transition hover:bg-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
          >
            Let's Go!
          </button>
        </div>
      </div>
    </div>
  )
}

export default OnboardingModal
