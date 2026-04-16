const THEME_KEY = 'notequest_theme'
const THEME_CHANGE_EVENT = 'notequest-theme-change'

function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY)
  } catch (error) {
    return null
  }
}

export function getTheme() {
  const stored = getStoredTheme()
  return stored === 'light' ? 'light' : 'dark'
}

export function applyTheme(theme) {
  const nextTheme = theme === 'light' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', nextTheme)
  localStorage.setItem(THEME_KEY, nextTheme)
  window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: nextTheme }))
  return nextTheme
}

export function toggleTheme() {
  const nextTheme = getTheme() === 'dark' ? 'light' : 'dark'
  return applyTheme(nextTheme)
}

export function onThemeChange(callback) {
  const handleCustomThemeEvent = (event) => callback(event.detail)
  const handleStorageEvent = (event) => {
    if (event.key === THEME_KEY && event.newValue) {
      callback(event.newValue === 'light' ? 'light' : 'dark')
    }
  }

  window.addEventListener(THEME_CHANGE_EVENT, handleCustomThemeEvent)
  window.addEventListener('storage', handleStorageEvent)

  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, handleCustomThemeEvent)
    window.removeEventListener('storage', handleStorageEvent)
  }
}

export { THEME_KEY }
