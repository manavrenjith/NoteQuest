import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, LoaderCircle, Sparkles } from 'lucide-react'
import { extractTopics } from '../utils/gemini'
import { saveSubject } from '../utils/storage'
import { useToast } from '../hooks/useToast'

function UploadNotes() {
  const navigate = useNavigate()
  const { success } = useToast()
  const [subjectName, setSubjectName] = useState('')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    if (!file.name.toLowerCase().endsWith('.txt')) {
      setError('Please upload a .txt file only.')
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      setNotes(String(reader.result || ''))
      setError('')
    }

    reader.onerror = () => {
      setError('Could not read the file. Please try again.')
    }

    reader.readAsText(file)
  }

  const handleExtractTopics = async () => {
    if (!notes.trim()) {
      setError('Paste or upload your notes before extracting topics.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const result = await extractTopics(notes)
      const subjectId = `subject_${Date.now()}`

      const subjectPayload = {
        id: subjectId,
        subject: subjectName.trim() || result.subject || 'Untitled Subject',
        chapters: Array.isArray(result.chapters) ? result.chapters : [],
        createdAt: new Date().toISOString(),
      }

      saveSubject(subjectPayload)
      success('Topics extracted successfully! ✅')
      navigate('/dashboard')
    } catch (extractError) {
      console.error(extractError)
      setError('Failed to extract topics. Please check your API key and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-800/80 p-6 shadow-xl shadow-black/20">
      <div className="mb-4">
        <label htmlFor="subjectName" className="mb-2 block text-sm font-medium text-slate-300">
          Subject Name
        </label>
        <input
          id="subjectName"
          type="text"
          placeholder="e.g. Physics"
          value={subjectName}
          onChange={(event) => setSubjectName(event.target.value)}
          className="w-full rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none transition focus:border-indigo-500"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="notes" className="mb-2 block text-sm font-medium text-slate-300">
          Paste Notes
        </label>
        <textarea
          id="notes"
          rows={10}
          placeholder="Paste your class notes here..."
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="w-full resize-y rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none transition focus:border-indigo-500"
        />
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-600 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-indigo-500 hover:text-white">
          <FileText className="h-4 w-4" />
          Upload .txt
          <input type="file" accept=".txt,text/plain" onChange={handleFileUpload} className="hidden" />
        </label>

        <button
          type="button"
          onClick={handleExtractTopics}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Extracting...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Extract Topics
            </>
          )}
        </button>
      </div>

      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
    </div>
  )
}

export default UploadNotes
