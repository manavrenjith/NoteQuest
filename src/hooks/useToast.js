import { createContext, createElement, useCallback, useContext, useMemo, useState } from 'react'
import Toast from '../components/Toast'

const ToastContext = createContext(null)

function createToastId() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const pushToast = useCallback((message, type = 'info') => {
    const id = createToastId()

    setToasts((prev) => [...prev, { id, message, type }])

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }, 3000)
  }, [])

  const value = useMemo(
    () => ({
      success: (message) => pushToast(message, 'success'),
      info: (message) => pushToast(message, 'info'),
      warning: (message) => pushToast(message, 'warning'),
      dismissToast,
    }),
    [dismissToast, pushToast],
  )

  return createElement(
    ToastContext.Provider,
    { value },
    children,
    createElement(Toast, { toasts, onDismiss: dismissToast }),
  )
}

export function useToast() {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  return context
}
