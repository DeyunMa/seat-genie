import { render, waitFor, act } from '@testing-library/react'
import { describe, it, vi, expect, beforeEach, type Mock } from 'vitest'
import BookList from './BookList'
import { listBooks } from '../../services/booksApi'

vi.mock('../../services/booksApi', () => ({
    listBooks: vi.fn(),
    createBook: vi.fn(),
    updateBook: vi.fn(),
    deleteBook: vi.fn()
}))

const mockAddToast = vi.fn()
vi.mock('../../components/common/Toast', () => ({
    useToast: () => ({ addToast: mockAddToast })
}))

vi.mock('../../components/common/Modal', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    ConfirmModal: () => <div></div>
}))

describe('BookList Performance', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should not call listBooks infinitely', async () => {
        (listBooks as Mock).mockImplementation(() => Promise.resolve([]))

        render(<BookList />)

        await waitFor(() => expect(listBooks).toHaveBeenCalled())

        await act(async () => {
             await new Promise(r => setTimeout(r, 200))
        })

        console.log('Call count:', (listBooks as Mock).mock.calls.length)
        expect((listBooks as Mock).mock.calls.length).toBeLessThan(10)
    })
})
