import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { initDatabase } from './services/sqliteService'
import { initializeData } from './services/initData'

// Loading screen component
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
        <p className="loading-message">正在初始化...</p>
      </div>
    </div>
  )
}

// Root component with async initialization
function Root() {
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const init = async () => {
      try {
        // Initialize database
        await initDatabase()
        // Initialize demo data if not exists
        initializeData()
        // Small delay for smooth transition
        setTimeout(() => setIsReady(true), 300)
      } catch (err) {
        console.error('Failed to initialize:', err)
        setError(err.message)
      }
    }
    init()
  }, [])

  if (error) {
    return (
      <div className="loading-screen error">
        <div className="loading-content">
          <span className="error-icon">⚠️</span>
          <h2>初始化失败</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            重试
          </button>
        </div>
      </div>
    )
  }

  if (!isReady) {
    return <LoadingScreen />
  }

  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
