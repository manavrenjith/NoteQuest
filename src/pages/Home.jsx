import UploadNotes from '../components/UploadNotes'

function Home() {
  return (
    <main className="min-h-screen bg-slate-900 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl">NoteQuest</h1>
          <p className="mt-3 text-lg text-slate-300">Turn your notes into a learning roadmap</p>
        </header>

        <UploadNotes />
      </div>
    </main>
  )
}

export default Home
