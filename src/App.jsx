import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import LeaderboardPage from './pages/LeaderboardPage'
import Notes from './pages/Notes'
import Quiz from './pages/Quiz'
import Settings from './pages/Settings'
import SubjectDetail from './pages/SubjectDetail'
import Upload from './pages/Upload'
import Profile from './pages/profile'
import Calendar from './pages/Calendar'

function App() {
  const location = useLocation()

  return (
    <div className="route-transition-shell" key={location.pathname}>
      <Routes location={location}>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/subject/:id" element={<SubjectDetail />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/quiz/:subjectId/:chapterId" element={<Quiz />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
