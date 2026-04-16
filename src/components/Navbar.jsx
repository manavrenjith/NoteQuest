import { useState } from 'react'
import { GraduationCap, Menu, X } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

const navItems = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Leaderboard', to: '/leaderboard' },
  { label: 'Upload Notes', to: '/upload' },
  { label: 'Settings', to: '/settings' },
]

function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const closeMenu = () => setIsOpen(false)

  const getLinkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
      isActive ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-200 hover:bg-slate-800 hover:text-white'
    }`

  return (
    <header className="sticky top-0 z-50 border-b border-[#888] bg-black/95 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          onClick={closeMenu}
        >
          <GraduationCap className="h-6 w-6 text-indigo-400" />
          <span className="text-lg font-black tracking-tight">NoteQuest</span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={getLinkClass}>
                {item.label}
              </NavLink>
            ))}
          </div>

          <ThemeToggle />

          <button
            type="button"
            className="inline-flex rounded-lg border border-slate-600 p-2 text-slate-200 transition hover:bg-slate-800 md:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {isOpen ? (
        <div className="border-t border-slate-700 px-4 py-3 md:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-2">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={getLinkClass} onClick={closeMenu}>
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      ) : null}
    </header>
  )
}

export default Navbar
