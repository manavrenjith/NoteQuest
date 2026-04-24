import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoaderCircle, Sparkles } from 'lucide-react'
import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { extractTopics } from '../utils/gemini'
import { saveSubject } from '../utils/storage'
import { useToast } from '../hooks/useToast'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

function UploadNotes() {
  const navigate = useNavigate()
  const { success } = useToast()
  const [subjectName, setSubjectName] = useState('')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isPdfLoading, setIsPdfLoading] = useState(false)
  const [error, setError] = useState('')
  const [pdfName, setPdfName] = useState('')
  const [pdfWarning, setPdfWarning] = useState('')

  const extractPdfText = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

      if (!pdf.numPages) {
        throw new Error('This PDF appears to be empty.')
      }

      let fullText = ''

      const maxPages = Math.min(pdf.numPages, 30)
      if (pdf.numPages > 30) {
        console.warn('Large PDF - extracting first 30 pages only')
        setPdfWarning('Large PDF detected. Extracting first 30 pages only.')
      } else {
        setPdfWarning('')
      }

      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        const pageText = content.items
          .map((item) => item.str)
          .join(' ')
        fullText += pageText + '\n\n'
      }

      const trimmedText = fullText.trim()

      if (!trimmedText) {
        throw new Error('No text found. This PDF may be a scanned image. Please use a text-based PDF.')
      }

      return trimmedText
    } catch (pdfError) {
      if (pdfError?.name === 'PasswordException' || String(pdfError?.message || '').toLowerCase().includes('password')) {
        throw new Error('This PDF is password protected. Please remove the password and try again.')
      }

      if (pdfError instanceof Error) {
        throw pdfError
      }

      console.error('PDF extraction error:', pdfError)
      throw new Error('Failed to read PDF. Please make sure it is not password protected.')
    }
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const fileName = file.name.toLowerCase()

    setError('')
    setPdfWarning('')

    if (fileName.endsWith('.txt')) {
      const reader = new FileReader()

      reader.onload = () => {
        setNotes(String(reader.result || ''))
        setPdfName('')
        setError('')
      }

      reader.onerror = () => {
        setError('Could not read the file. Please try again.')
      }

      reader.readAsText(file)
      return
    }

    if (fileName.endsWith('.pdf')) {
      setIsPdfLoading(true)
      setError('')
      setPdfName(file.name)

      try {
        const text = await extractPdfText(file)

        if (!text || text.length < 50) {
          throw new Error('Could not extract enough text from this PDF. Try a text-based PDF (not scanned images).')
        }

        setNotes(text)
      } catch (uploadError) {
        setNotes('')
        setPdfName('')
        setError(uploadError?.message || 'Failed to read PDF. Please make sure it is not password protected.')
      } finally {
        setIsPdfLoading(false)
      }

      return
    }

    setError('Please upload a .txt or .pdf file only.')
    setPdfName('')

    if (event.target) {
      event.target.value = ''
    }
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
      navigate(`/subject/${subjectId}`)
    } catch (extractError) {
      console.error(extractError)
      setError('Failed to extract topics. Please check your API key and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-[#1a1a1a] bg-[#0a0a0a] p-6">
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
          className="w-full rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] px-4 py-3 text-slate-100 placeholder-slate-500 outline-none transition focus:border-indigo-500"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="notes" className="mb-2 block text-sm font-medium text-slate-300">
          Paste Notes
        </label>
        {pdfName && notes ? (
          <div
            className="mb-2 flex items-center gap-1.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs text-emerald-200"
          >
            ✓ PDF loaded - {notes.split(/\s+/).filter(Boolean).length} words extracted from {pdfName}
          </div>
        ) : null}
        <textarea
          id="notes"
          rows={10}
          placeholder="Paste your class notes here..."
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          className="w-full resize-y rounded-xl border border-[#1a1a1a] bg-[#0d0d0d] px-4 py-3 text-slate-100 placeholder-slate-500 outline-none transition focus:border-indigo-500"
        />
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2.5">
            <label className="cursor-pointer">
              <input type="file" accept=".txt,.pdf" onChange={handleFileUpload} className="hidden" />
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-[#1a1a1a] bg-[#0d0d0d] px-3.5 py-1.5 text-sm text-slate-300 transition hover:border-indigo-500 hover:text-white">
                <span>{pdfName ? '📄' : '📁'}</span>
                <span>{pdfName || 'Upload .txt or .pdf'}</span>
              </div>
            </label>

            {pdfName ? (
              <button
                type="button"
                onClick={() => {
                  setPdfName('')
                  setNotes('')
                  setPdfWarning('')
                  setError('')
                }}
                className="rounded-md bg-transparent px-1.5 py-1 text-xs text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                ✕ clear
              </button>
            ) : null}
          </div>

          {isPdfLoading ? <div className="text-xs text-slate-400">Reading PDF...</div> : null}
          {pdfWarning ? <div className="text-xs text-amber-300">{pdfWarning}</div> : null}
        </div>

        <button
          type="button"
          onClick={handleExtractTopics}
          disabled={isLoading || isPdfLoading}
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
