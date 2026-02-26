import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import App from './App'
import { useAuthStore } from './stores/authStore'

// Mock the auth store
vi.mock('./stores/authStore', () => ({
  useAuthStore: vi.fn()
}))

// Mock the ToastProvider
vi.mock('./components/common/Toast', () => ({
  ToastProvider: ({ children }) => <div>{children}</div>
}))

// Mock pages
vi.mock('./pages/Login/Login', () => ({ default: () => <div>Login Page</div> }))
vi.mock('./components/layout/MainLayout', () => ({ default: () => <div>Main Layout</div> }))

describe('App', () => {
  it('redirects to login when not authenticated', () => {
    useAuthStore.mockReturnValue({
      isAuthenticated: false,
      user: null
    })

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByText('Login Page')).toBeInTheDocument()
  })

  it('renders main layout when authenticated', () => {
    useAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { role: 'student' }
    })

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )

    expect(screen.getByText('Main Layout')).toBeInTheDocument()
  })
})
