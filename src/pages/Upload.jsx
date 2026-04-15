import { ArrowLeft, Upload as UploadIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import UploadNotes from '../components/UploadNotes'

function Upload() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar />
      
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-6 flex items-center gap-2 text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>

          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-indigo-500/20 p-3">
              <UploadIcon className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Upload Notes</h1>
              <p className="text-slate-400">Convert your notes into a structured learning path</p>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
            <div className="mb-2 text-2xl">📄</div>
            <h3 className="mb-1 font-semibold text-white">Paste Text</h3>
            <p className="text-sm text-slate-400">Paste your notes directly or upload .txt files</p>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
            <div className="mb-2 text-2xl">📕</div>
            <h3 className="mb-1 font-semibold text-white">PDF Support</h3>
            <p className="text-sm text-slate-400">Upload PDF files (up to 30 pages)</p>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-4">
            <div className="mb-2 text-2xl">✨</div>
            <h3 className="mb-1 font-semibold text-white">AI Processing</h3>
            <p className="text-sm text-slate-400">AI extracts topics and chapters automatically</p>
          </div>
        </div>

        {/* Upload Component */}
        <div className="mb-8">
          <UploadNotes />
        </div>

        {/* Tips Section */}
        <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Tips for Best Results</h2>
          <ul className="space-y-2 text-slate-300">
            <li className="flex gap-3">
              <span className="text-indigo-400">•</span>
              <span>Use clear, well-formatted notes for better topic extraction</span>
            </li>
            <li className="flex gap-3">
              <span className="text-indigo-400">•</span>
              <span>PDFs should be text-based (not scanned images)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-indigo-400">•</span>
              <span>Include chapter or section headings for better organization</span>
            </li>
            <li className="flex gap-3">
              <span className="text-indigo-400">•</span>
              <span>Longer notes with more content lead to more accurate topic extraction</span>
            </li>
            <li className="flex gap-3">
              <span className="text-indigo-400">•</span>
              <span>Give your subject a meaningful name for easy identification</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Upload
