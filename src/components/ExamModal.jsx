import { useState, useEffect, useRef } from 'react'

const EMOJI_MAP = (name = '') => {
  const n = name.toLowerCase()
  if (n.includes('math') || n.includes('algebra') || n.includes('calculus')) return '📐'
  if (n.includes('chemistry') || n.includes('chem')) return '🧪'
  if (n.includes('physics')) return '⚡'
  if (n.includes('cs') || n.includes('computer') || n.includes('programming') || n.includes('data structure') || n.includes('algorithm')) return '💻'
  if (n.includes('biology') || n.includes('bio')) return '🧬'
  if (n.includes('history')) return '📖'
  return '📚'
}

export default function ExamModal({ onSave, onClose, editExam = null, subjects = [] }) {
  const [name, setName]   = useState(editExam?.name || '')
  const [date, setDate]   = useState(editExam?.date || '')
  const [selectedIds, setSelectedIds] = useState(editExam?.subjectIds || [])
  const [error, setError] = useState('')
  const nameRef = useRef()

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => { nameRef.current?.focus() }, [])

  const toggleSubject = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const handleSave = () => {
    if (!name.trim()) { setError('Please enter an exam name.'); return }
    if (!date) { setError('Please pick an exam date.'); return }
    if (selectedIds.length === 0) { setError('Please link at least one subject.'); return }
    setError('')
    onSave({
      id: editExam?.id || `exam_${Date.now()}`,
      name: name.trim(),
      date,
      subjectIds: selectedIds,
    })
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '1rem',
    }}>
      <div style={{
        background: '#0a0a0a',
        border: '0.5px solid rgba(255,255,255,0.1)',
        borderRadius: 14, padding: '1.5rem',
        width: '100%', maxWidth: 380,
        maxHeight: '90vh', overflowY: 'auto',
      }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>
            {editExam ? 'Edit exam' : 'Schedule an exam'}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 16, padding: 0, lineHeight: 1, transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
            ✕
          </button>
        </div>

        {/* Exam name */}
        <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
          Exam name
        </label>
        <input
          ref={nameRef}
          value={name}
          onChange={e => { setName(e.target.value); setError('') }}
          placeholder="e.g. Data Structures Final"
          maxLength={50}
          style={{
            width: '100%', fontSize: 13, padding: '8px 10px',
            borderRadius: 8, outline: 'none', marginBottom: 14,
            border: '0.5px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.05)', color: '#fff',
          }}
        />

        {/* Date */}
        <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 6 }}>
          Exam date
        </label>
        <input
          type="date"
          value={date}
          min={today}
          onChange={e => { setDate(e.target.value); setError('') }}
          style={{
            width: '100%', fontSize: 13, padding: '8px 10px',
            borderRadius: 8, outline: 'none', marginBottom: 14,
            border: '0.5px solid rgba(255,255,255,0.12)',
            background: 'rgba(255,255,255,0.05)', color: '#fff',
            colorScheme: 'dark',
          }}
        />

        {/* Days until exam preview */}
        {date && (
          <div style={{ fontSize: 11, color: 'rgba(127,119,221,0.8)', marginTop: -10, marginBottom: 14 }}>
            {Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24))} days from today
          </div>
        )}

        {/* Link subjects */}
        <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: 8 }}>
          Link subjects
        </label>

        {subjects.length === 0 ? (
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', padding: '12px 0', textAlign: 'center' }}>
            No subjects yet — upload notes first
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14, maxHeight: 200, overflowY: 'auto' }}>
            {subjects.map(s => {
              const sel = selectedIds.includes(s.id)
              const emoji = EMOJI_MAP(s.subject)
              const allTopics = s.chapters?.flatMap(c => c.topics) ?? []
              const done = allTopics.filter(t => t.completed).length
              const total = allTopics.length
              return (
                <div
                  key={s.id}
                  onClick={() => toggleSubject(s.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                    border: `0.5px solid ${sel ? 'rgba(127,119,221,0.4)' : 'rgba(255,255,255,0.07)'}`,
                    background: sel ? 'rgba(127,119,221,0.08)' : 'rgba(255,255,255,0.02)',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { if (!sel) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)' }}
                  onMouseLeave={e => { if (!sel) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}
                >
                  {/* Checkbox */}
                  <div style={{
                    width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                    border: `0.5px solid ${sel ? 'rgba(127,119,221,0.8)' : 'rgba(255,255,255,0.2)'}`,
                    background: sel ? 'rgba(127,119,221,0.85)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, color: '#fff',
                    transition: 'all 0.15s',
                  }}>
                    {sel && '✓'}
                  </div>

                  {/* Emoji */}
                  <span style={{ fontSize: 14 }}>{emoji}</span>

                  {/* Name + progress */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: sel ? 500 : 400, color: sel ? '#fff' : 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.subject}
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 1 }}>
                      {done}/{total} topics done
                    </div>
                  </div>

                  {/* Progress pill */}
                  <div style={{ fontSize: 10, padding: '2px 6px', borderRadius: 99, background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
                    {total > 0 ? Math.round(done / total * 100) : 0}%
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ fontSize: 11, color: 'rgba(240,149,149,0.9)', marginBottom: 12, padding: '6px 10px', background: 'rgba(224,75,74,0.08)', borderRadius: 6 }}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleSave}
            style={{
              flex: 1, padding: '9px', borderRadius: 8, border: 'none',
              background: 'rgba(127,119,221,0.9)', color: '#fff',
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
            {editExam ? 'Save changes' : 'Schedule exam'}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '9px 16px', borderRadius: 8,
              border: '0.5px solid rgba(255,255,255,0.1)',
              background: 'transparent', color: 'rgba(255,255,255,0.4)',
              fontSize: 13, cursor: 'pointer',
            }}>
            Cancel
          </button>
        </div>

      </div>
    </div>
  )
}
