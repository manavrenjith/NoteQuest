import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { ToastProvider } from './hooks/useToast'
import { seedDemoData } from './utils/storage'
import { applyTheme, getTheme } from './utils/theme'

applyTheme(getTheme())
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
