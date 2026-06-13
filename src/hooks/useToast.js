import { useState, useCallback } from 'react'

let toastIdCounter = 0

export function useToast() {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const id = ++toastIdCounter
    setToasts((prev) => [...prev, { id, message, type, duration }])
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showSuccess = useCallback(
    (message, duration) => addToast(message, 'success', duration),
    [addToast]
  )

  const showError = useCallback(
    (message, duration) => addToast(message, 'error', duration),
    [addToast]
  )

  const showWarning = useCallback(
    (message, duration) => addToast(message, 'warning', duration),
    [addToast]
  )

  const showInfo = useCallback(
    (message, duration) => addToast(message, 'info', duration),
    [addToast]
  )

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  }
}

export default useToast
