import { render, waitFor, screen } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import BookList from './BookList'
import * as booksApi from '../../services/booksApi'
import { ToastProvider } from '../../components/common/Toast'

// Mock the booksApi
vi.mock('../../services/booksApi', () => ({
    listBooks: vi.fn(),
    createBook: vi.fn(),
    updateBook: vi.fn(),
    deleteBook: vi.fn(),
}))

describe('BookList Performance', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should call listBooks only once on mount', async () => {
        // Setup mock return value
        const mockBooks = [
            { id: 1, title: 'Test Book 1', activeStatus: 'Y', category: 'Fiction', status: 'available', isbn: '123', author: 'Author 1', publisher: 'Pub 1', location: 'A1' },
            { id: 2, title: 'Test Book 2', activeStatus: 'Y', category: 'Science', status: 'borrowed', isbn: '456', author: 'Author 2', publisher: 'Pub 2', location: 'A2' }
        ]
        booksApi.listBooks.mockResolvedValue(mockBooks)

        render(
            <ToastProvider>
                <BookList />
            </ToastProvider>
        )

        // Wait for the books to be loaded and displayed
        await waitFor(() => {
            expect(screen.getByText('Test Book 1')).toBeInTheDocument()
        })

        // Check how many times listBooks was called
        // If the infinite loop exists, this expectation might fail (called > 1)
        // or the test might crash/timeout depending on how fast the loop is.
        // We expect strictly 1 call for a correct implementation.
        expect(booksApi.listBooks).toHaveBeenCalledTimes(1)
    })
})
