import { useEffect, useState } from 'react'
import { Sun } from 'lucide-react'
import { getTheme, onThemeChange, toggleTheme } from '../utils/theme'

function ThemeToggle() {
  const [theme, setTheme] = useState(() => getTheme())

  useEffect(() => {
    return onThemeChange(setTheme)
  }, [])

  const nextTheme = theme === 'dark' ? 'light' : 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(toggleTheme())}
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
      style={{
        width: 34,
        height: 34,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        border: '0.5px solid var(--border-soft)',
        background: 'var(--surface-1)',
        color: 'var(--text-primary)',
        cursor: 'pointer',
      }}
    >
      <Sun size={16} />
    </button>
  )
}

export default ThemeToggle
