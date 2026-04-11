import { useRef } from 'react'

export default function CertificateModal({ subject, xp, level, onClose }) {
  const certRef = useRef(null)

  const downloadCertificate = async () => {
    if (!certRef.current || !subject) {
      return
    }

    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(certRef.current, {
      backgroundColor: '#0f172a',
      scale: 2,
    })

    const link = document.createElement('a')
    link.download = `NoteQuest-${subject.subject || 'Subject'}-Certificate.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  const shareText = `I just completed "${subject?.subject || 'a subject'}" on NoteQuest! 🎓\nLevel: ${level?.title || 'Unknown'} | XP: ${xp}\nBuilt for Nira Hackathon 2026`

  const date = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  if (!subject) {
    return null
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div style={{ maxWidth: 480, width: '100%' }}>
        <div
          ref={certRef}
          style={{
            background: '#0f172a',
            border: '2px solid #7F77DD',
            borderRadius: 16,
            padding: '2.5rem',
            textAlign: 'center',
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>🎓</div>

          <div
            style={{
              fontSize: 11,
              fontWeight: 500,
              color: '#7F77DD',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: 12,
            }}
          >
            Certificate of Completion
          </div>

          <div
            style={{
              fontSize: 22,
              fontWeight: 500,
              color: 'white',
              marginBottom: 8,
              lineHeight: 1.3,
            }}
          >
            {subject.subject}
          </div>

          <div
            style={{
              fontSize: 13,
              color: '#94a3b8',
              marginBottom: 24,
            }}
          >
            Successfully completed all {subject.chapters?.flatMap((chapter) => chapter.topics || []).length || 0}{' '}
            topics
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 24,
              marginBottom: 24,
            }}
          >
            <div>
              <div style={{ fontSize: 20, fontWeight: 500, color: '#7F77DD' }}>{xp}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>Total XP</div>
            </div>
            <div style={{ width: 1, background: '#1e293b' }} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 500, color: '#7F77DD' }}>{level?.title || 'Unknown'}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>Level</div>
            </div>
            <div style={{ width: 1, background: '#1e293b' }} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 500, color: '#7F77DD' }}>{subject.chapters?.length || 0}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>Chapters</div>
            </div>
          </div>

          <div
            style={{
              fontSize: 11,
              color: '#475569',
              borderTop: '0.5px solid #1e293b',
              paddingTop: 16,
            }}
          >
            Completed on {date} · NoteQuest
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={downloadCertificate}
            style={{
              flex: 1,
              padding: '10px',
              background: '#7F77DD',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Download Certificate
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(shareText)
            }}
            style={{
              flex: 1,
              padding: '10px',
              background: 'transparent',
              color: 'var(--color-text-primary, #e2e8f0)',
              border: '0.5px solid var(--color-border-secondary, #334155)',
              borderRadius: 8,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Copy Share Text
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '10px 14px',
              background: 'transparent',
              color: 'var(--color-text-secondary, #94a3b8)',
              border: '0.5px solid var(--color-border-secondary, #334155)',
              borderRadius: 8,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}
