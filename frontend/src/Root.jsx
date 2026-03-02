import React, { useState, useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import ErrorBoundary from './components/common/ErrorBoundary'

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-logo">
          <span className="logo-icon">📚</span>
          <span className="logo-text">Seat Genie</span>
        </div>
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
        </div>
        <p className="loading-message">正在加载...</p>
      </div>
    </div>
  )
}

export default function Root() {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 300)
    return () => clearTimeout(timer)
  }, [])

  if (!isReady) {
    return <LoadingScreen />
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  )
}
