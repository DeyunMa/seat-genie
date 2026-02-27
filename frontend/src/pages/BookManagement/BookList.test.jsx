import { render, waitFor, act } from '@testing-library/react'
import { describe, it, vi, expect, beforeEach } from 'vitest'
import BookList from './BookList'
import { listBooks } from '../../services/booksApi'

// Mock services
vi.mock('../../services/booksApi', () => ({
    listBooks: vi.fn(),
    createBook: vi.fn(),
    updateBook: vi.fn(),
    deleteBook: vi.fn()
}))

// Mock toast with stable reference
const mockAddToast = vi.fn()
vi.mock('../../components/common/Toast', () => ({
    useToast: () => ({ addToast: mockAddToast })
}))

// Mock Modal
vi.mock('../../components/common/Modal', () => ({
    __esModule: true,
    default: ({ children }) => <div>{children}</div>,
    ConfirmModal: () => <div></div>
}))

describe('BookList Performance', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should not call listBooks infinitely', async () => {
        // Return new array reference every time to simulate real API
        listBooks.mockImplementation(() => Promise.resolve([]))

        render(<BookList />)

        // Allow some time for effects
        await waitFor(() => expect(listBooks).toHaveBeenCalled())

        // Wait a bit more
        await act(async () => {
             await new Promise(r => setTimeout(r, 200))
        })

        console.log('Call count:', listBooks.mock.calls.length)
        expect(listBooks.mock.calls.length).toBeLessThan(10)
    })
})
