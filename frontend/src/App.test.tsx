import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, type Mock } from 'vitest'
import '@testing-library/jest-dom'
import App from './App'
import { useAuthStore } from './stores/authStore'

vi.mock('./stores/authStore', () => ({
  useAuthStore: vi.fn()
}))

vi.mock('./components/common/Toast', () => ({
  ToastProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

vi.mock('./pages/Login/Login', () => ({ default: () => <div>Login Page</div> }))
vi.mock('./components/layout/MainLayout', () => ({ default: () => <div>Main Layout</div> }))

describe('App', () => {
  it('redirects to login when not authenticated', () => {
    (useAuthStore as unknown as Mock).mockReturnValue({
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
    (useAuthStore as unknown as Mock).mockReturnValue({
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
