import { describe, it, expect, vi } from 'vitest'
import { mapLoansToBorrowings } from './mappers'

// Mock toDateOnly since it's used in mapLoansToBorrowings
vi.mock('./dateUtils', () => ({
    toDateOnly: vi.fn((val) => {
        if (!val) return null;
        // Simple mock implementation for testing
        return val.split('T')[0]
    })
}))

describe('mapLoansToBorrowings', () => {
    const mockUsersByEmail = {
        'test@example.com': 123
    }

    const mockLoans = [
        {
            id: 1,
            member_email: 'test@example.com',
            member_id: 456,
            member_name: 'Test Member',
            book_id: 789,
            book_title: 'Test Book',
            loaned_at: '2023-10-01T10:00:00Z',
            due_at: '2023-10-15T10:00:00Z',
            returned_at: null
        },
        {
            id: 2,
            member_email: 'other@example.com',
            member_id: 457,
            member_name: 'Other Member',
            book_id: 790,
            book_title: 'Other Book',
            loaned_at: '2023-09-01T10:00:00Z',
            due_at: '2023-09-15T10:00:00Z',
            returned_at: '2023-09-10T10:00:00Z'
        }
    ]

    it('should return empty array if loans is not an array', () => {
        expect(mapLoansToBorrowings(null, {})).toEqual([])
        expect(mapLoansToBorrowings(undefined, {})).toEqual([])
    })

    it('should map loans to borrowings correctly', () => {
        const result = mapLoansToBorrowings(mockLoans, mockUsersByEmail)

        expect(result).toHaveLength(2)

        // Check first borrowing (active)
        expect(result[0]).toEqual({
            id: '1',
            userId: 123,
            memberId: 456,
            memberName: 'Test Member',
            memberEmail: 'test@example.com',
            bookId: 789,
            bookTitle: 'Test Book',
            borrowDate: '2023-10-01',
            dueDate: '2023-10-15',
            returnDate: null,
            status: 'borrowed',
            createdAt: '2023-10-01T10:00:00Z',
            updatedAt: '2023-10-01T10:00:00Z'
        })

        // Check second borrowing (returned)
        expect(result[1]).toEqual({
            id: '2',
            userId: null, // Email not in usersByEmail
            memberId: 457,
            memberName: 'Other Member',
            memberEmail: 'other@example.com',
            bookId: 790,
            bookTitle: 'Other Book',
            borrowDate: '2023-09-01',
            dueDate: '2023-09-15',
            returnDate: '2023-09-10',
            status: 'returned',
            createdAt: '2023-09-01T10:00:00Z',
            updatedAt: '2023-09-10T10:00:00Z'
        })
    })

    it('should handle missing usersByEmail gracefully', () => {
        const result = mapLoansToBorrowings([mockLoans[0]], null)
        expect(result[0].userId).toBeNull()
    })
})
