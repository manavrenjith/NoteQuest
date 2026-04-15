import { useNavigate } from 'react-router-dom'
import UploadNotes from '../components/UploadNotes'

function Upload() {
  const navigate = useNavigate()

  return (
    <main style={{ background: '#000', color: '#fff', minHeight: '100vh', fontFamily: 'inherit' }}>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          background: 'rgba(0,0,0,0.96)',
          backdropFilter: 'blur(8px)',
          borderBottom: '0.5px solid #1a1a1a',
          transition: 'border-color 0.2s',
        }}
      >
        <div
          className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6"
        >
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#7F77DD', display: 'inline-block' }} />
            <span style={{ fontSize: 15, fontWeight: 500, color: '#fff' }}>NoteQuest</span>
          </button>

          <nav className="flex items-center gap-4 text-sm sm:gap-6">
            <button type="button" className="text-[#888] transition hover:text-white" onClick={() => navigate('/dashboard')}>
              Dashboard
            </button>
            <button type="button" className="font-semibold text-white" onClick={() => navigate('/upload')}>
              Upload notes
            </button>
            <button
              type="button"
              className="text-[#888] transition hover:text-white"
              onClick={() => navigate('/settings')}
            >
              Settings
            </button>
          </nav>
        </div>
      </header>

      <section style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 1.5rem', borderBottom: '0.5px solid #111' }}>
        <div style={{ marginBottom: '2rem' }}>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              color: '#888',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'color 0.2s',
              marginBottom: '2rem',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#888')}
          >
            ← Back to Dashboard
          </button>

          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: 32, fontWeight: 500, color: '#fff', marginBottom: 8 }}>Upload Notes</h1>
            <p style={{ fontSize: 14, color: '#555', marginBottom: 0 }}>Convert your notes into a structured learning path</p>
          </div>
        </div>

        {/* Info Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 1,
            background: '#111',
            border: '0.5px solid #111',
            borderRadius: 12,
            overflow: 'hidden',
            marginBottom: '2rem',
          }}
        >
          <article
            style={{ background: '#000', padding: '1.5rem', transition: 'background 0.2s', cursor: 'default' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#0a0a0a')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#000')}
          >
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#0d0d1f', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginBottom: 12 }}>
              📄
            </div>
            <h3 style={{ fontSize: 13, fontWeight: 500, color: '#fff', marginBottom: 6 }}>Paste Text</h3>
            <p style={{ fontSize: 12, color: '#444', lineHeight: 1.5 }}>Paste your notes directly or upload .txt files</p>
          </article>

          <article
            style={{ background: '#000', padding: '1.5rem', transition: 'background 0.2s', cursor: 'default' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#0a0a0a')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#000')}
          >
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#1a1000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginBottom: 12 }}>
              📕
            </div>
            <h3 style={{ fontSize: 13, fontWeight: 500, color: '#fff', marginBottom: 6 }}>PDF Support</h3>
            <p style={{ fontSize: 12, color: '#444', lineHeight: 1.5 }}>Upload PDF files (up to 30 pages)</p>
          </article>

          <article
            style={{ background: '#000', padding: '1.5rem', transition: 'background 0.2s', cursor: 'default' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#0a0a0a')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#000')}
          >
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#0d1a0d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, marginBottom: 12 }}>
              ✨
            </div>
            <h3 style={{ fontSize: 13, fontWeight: 500, color: '#fff', marginBottom: 6 }}>AI Processing</h3>
            <p style={{ fontSize: 12, color: '#444', lineHeight: 1.5 }}>AI extracts topics and chapters automatically</p>
          </article>
        </div>
      </section>

      {/* Upload Component */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 1.5rem', borderBottom: '0.5px solid #111' }}>
        <UploadNotes />
      </section>

      {/* Tips Section */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 1.5rem', borderBottom: '0.5px solid #111' }}>
        <div style={{ background: '#0a0a0a', border: '0.5px solid #1a1a1a', borderRadius: 12, padding: '1.5rem' }}>
          <h2 style={{ fontSize: 16, fontWeight: 500, color: '#fff', marginBottom: 16 }}>Tips for Best Results</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <li style={{ display: 'flex', gap: 10, fontSize: 13, color: '#888' }}>
              <span style={{ color: '#7F77DD', flexShrink: 0 }}>•</span>
              <span>Use clear, well-formatted notes for better topic extraction</span>
            </li>
            <li style={{ display: 'flex', gap: 10, fontSize: 13, color: '#888' }}>
              <span style={{ color: '#7F77DD', flexShrink: 0 }}>•</span>
              <span>PDFs should be text-based (not scanned images)</span>
            </li>
            <li style={{ display: 'flex', gap: 10, fontSize: 13, color: '#888' }}>
              <span style={{ color: '#7F77DD', flexShrink: 0 }}>•</span>
              <span>Include chapter or section headings for better organization</span>
            </li>
            <li style={{ display: 'flex', gap: 10, fontSize: 13, color: '#888' }}>
              <span style={{ color: '#7F77DD', flexShrink: 0 }}>•</span>
              <span>Longer notes with more content lead to more accurate topic extraction</span>
            </li>
            <li style={{ display: 'flex', gap: 10, fontSize: 13, color: '#888' }}>
              <span style={{ color: '#7F77DD', flexShrink: 0 }}>•</span>
              <span>Give your subject a meaningful name for easy identification</span>
            </li>
          </ul>
        </div>
      </section>

      <footer style={{ borderTop: '0.5px solid #111' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <p style={{ fontSize: 11, color: '#333', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7F77DD', display: 'inline-block' }} aria-hidden="true" />
            NoteQuest — Built for Nira Hackathon 2026
          </p>
          <p style={{ fontSize: 11, color: '#333' }}>Made with React + Groq AI</p>
        </div>
      </footer>
    </main>
  )
}

export default Upload
