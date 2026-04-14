import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { ToastProvider } from './hooks/useToast'
import { seedDemoData } from './utils/storage'

function getInitialTheme() {
  try {
    return localStorage.getItem('notequest_theme') || 'dark'
  } catch (error) {
    return 'dark'
  }
}

const savedTheme = getInitialTheme()
document.documentElement.setAttribute('data-theme', savedTheme)
seedDemoData()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ToastProvider>
  </StrictMode>,
)
