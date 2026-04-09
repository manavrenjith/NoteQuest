function LevelUpModal({ levelTitle, isOpen, onClose }) {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 animate-[fadeIn_220ms_ease-out]">
      <div className="w-full max-w-md rounded-2xl border border-indigo-300/20 bg-gradient-to-br from-indigo-600 to-indigo-900 p-6 text-center shadow-2xl shadow-indigo-900/50 animate-[scaleIn_220ms_ease-out]">
        <div className="text-6xl">🎉</div>
        <h3 className="mt-3 text-3xl font-black text-white">Level Up!</h3>
        <p className="mt-2 text-lg text-indigo-100">You are now a {levelTitle}!</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 rounded-xl bg-white px-5 py-2.5 font-semibold text-indigo-700 transition hover:bg-indigo-100"
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default LevelUpModal
