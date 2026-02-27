import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom'
import NotificationCenter from './NotificationCenter'
import { useAuthStore } from '../../stores/authStore'
import { useDataStore } from '../../stores/dataStore'

// Mock the stores
vi.mock('../../stores/authStore', () => ({
    useAuthStore: vi.fn()
}))

vi.mock('../../stores/dataStore', () => ({
    useDataStore: vi.fn()
}))

describe('NotificationCenter', () => {
    const mockLoadAllData = vi.fn()
    const today = new Date().toISOString().split('T')[0]

    // Setup default store mocks
    beforeEach(() => {
        vi.clearAllMocks()

        useDataStore.mockReturnValue({
            users: [
                { id: 1, name: 'Student 1', role: 'student' },
                { id: 2, name: 'Student 2', role: 'student' }
            ],
            books: [
                { id: 101, title: 'Book A' },
                { id: 102, title: 'Book B' }
            ],
            seatReservations: [],
            bookBorrowings: [],
            loadAllData: mockLoadAllData
        })
    })

    it('renders correctly for Staff/Admin', () => {
        useAuthStore.mockReturnValue({
            user: { id: 99, role: 'staff', name: 'Staff Member' }
        })

        render(<NotificationCenter />)

        expect(screen.getByText('异常处理与通知')).toBeInTheDocument()
        expect(screen.getByText('逾期未还')).toBeInTheDocument()
        expect(screen.getByText('违规记录')).toBeInTheDocument()
    })

    it('renders correctly for Student', () => {
        useAuthStore.mockReturnValue({
            user: { id: 1, role: 'student', name: 'Student 1' }
        })

        render(<NotificationCenter />)

        expect(screen.getByText('消息通知')).toBeInTheDocument()
        expect(screen.getByText('预约提醒')).toBeInTheDocument()
    })

    it('displays overdue notifications for Staff', () => {
        useAuthStore.mockReturnValue({
            user: { id: 99, role: 'staff', name: 'Staff Member' }
        })

        // Mock overdue borrowing
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]

        useDataStore.mockReturnValue({
            users: [{ id: 1, name: 'Student 1' }],
            books: [{ id: 101, title: 'Book A' }],
            seatReservations: [],
            bookBorrowings: [
                { id: 1, userId: 1, bookId: 101, status: 'borrowed', dueDate: yesterdayStr }
            ],
            loadAllData: mockLoadAllData
        })

        render(<NotificationCenter />)

        expect(screen.getByText('图书逾期未还')).toBeInTheDocument()
        expect(screen.getByText(/Student 1.*Book A/)).toBeInTheDocument()
    })

    it('displays violated reservations for Staff', () => {
        useAuthStore.mockReturnValue({
            user: { id: 99, role: 'staff', name: 'Staff Member' }
        })

        useDataStore.mockReturnValue({
            users: [{ id: 1, name: 'Student 1' }],
            books: [],
            seatReservations: [
                { id: 1, userId: 1, status: 'violated', date: today }
            ],
            bookBorrowings: [],
            loadAllData: mockLoadAllData
        })

        render(<NotificationCenter />)

        expect(screen.getByText('违规占座')).toBeInTheDocument()
        expect(screen.getByText(/Student 1.*违规行为/)).toBeInTheDocument()
    })

    it('displays due soon notifications for Student', () => {
        useAuthStore.mockReturnValue({
            user: { id: 1, role: 'student', name: 'Student 1' }
        })

        // Mock due soon borrowing (e.g., due tomorrow)
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        const tomorrowStr = tomorrow.toISOString().split('T')[0]

        useDataStore.mockReturnValue({
            users: [],
            books: [{ id: 101, title: 'Book A' }],
            seatReservations: [],
            bookBorrowings: [
                { id: 1, userId: 1, bookId: 101, status: 'borrowed', dueDate: tomorrowStr }
            ],
            loadAllData: mockLoadAllData
        })

        render(<NotificationCenter />)

        expect(screen.getByText('图书即将到期')).toBeInTheDocument()
        expect(screen.getByText(/Book A.*将在.*天后到期/)).toBeInTheDocument()
    })

     it('displays overdue notifications for Student', () => {
        useAuthStore.mockReturnValue({
            user: { id: 1, role: 'student', name: 'Student 1' }
        })

        // Mock overdue borrowing
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]

        useDataStore.mockReturnValue({
            users: [],
            books: [{ id: 101, title: 'Book A' }],
            seatReservations: [],
            bookBorrowings: [
                { id: 1, userId: 1, bookId: 101, status: 'borrowed', dueDate: yesterdayStr }
            ],
            loadAllData: mockLoadAllData
        })

        render(<NotificationCenter />)

        expect(screen.getByText('图书已逾期')).toBeInTheDocument()
        expect(screen.getByText(/Book A.*已逾期/)).toBeInTheDocument()
    })

    it('displays system notifications for everyone', () => {
         useAuthStore.mockReturnValue({
            user: { id: 1, role: 'student', name: 'Student 1' }
        })

        render(<NotificationCenter />)

        const systemNotifs = screen.getAllByText('系统公告')
        expect(systemNotifs.length).toBeGreaterThan(0)
        expect(screen.getByText(/图书馆系统已全面升级/)).toBeInTheDocument()
    })
})
