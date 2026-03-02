import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest'

vi.mock('../services/booksApi', () => ({ listBooks: vi.fn() }))
vi.mock('../services/loansApi', () => ({ listLoans: vi.fn(), createLoan: vi.fn(), updateLoan: vi.fn() }))
vi.mock('../services/membersApi', () => ({ listMembers: vi.fn(), createMember: vi.fn() }))
vi.mock('../services/usersApi', () => ({
    listUsers: vi.fn(), createUser: vi.fn(),
    updateUser: vi.fn(), deleteUser: vi.fn()
}))
vi.mock('../services/roomsApi', () => ({
    listRooms: vi.fn(), createRoom: vi.fn(),
    updateRoom: vi.fn(), deleteRoom: vi.fn()
}))
vi.mock('../services/seatsApi', () => ({
    listSeats: vi.fn(), createSeat: vi.fn(),
    updateSeat: vi.fn(), deleteSeat: vi.fn()
}))
vi.mock('../services/reservationsApi', () => ({
    listReservations: vi.fn(), createReservation: vi.fn(),
    cancelReservation: vi.fn()
}))
vi.mock('../services/notificationsApi', () => ({
    listNotifications: vi.fn(), createNotification: vi.fn(),
    updateNotification: vi.fn(), deleteNotification: vi.fn(),
    markAsRead: vi.fn(), getUnreadCount: vi.fn(), getReadStatus: vi.fn()
}))
vi.mock('../utils/mappers', () => ({
    mapLoansToBorrowings: vi.fn(() => [])
}))

import { useDataStore } from './dataStore'
import { listLoans, updateLoan } from '../services/loansApi'
import { listMembers } from '../services/membersApi'
import { deleteUser as deleteUserApi } from '../services/usersApi'
import { createRoom } from '../services/roomsApi'
import { createReservation } from '../services/reservationsApi'

beforeEach(() => {
    useDataStore.setState({
        users: [], rooms: [], seats: [], books: [],
        seatReservations: [], bookBorrowings: [], members: [],
        notifications: [], notificationReads: {}, unreadCount: 0,
        loading: false, error: null
    })
    vi.clearAllMocks()
})

describe('dataStore', () => {
    describe('getStats', () => {
        it('returns correct statistics', () => {
            useDataStore.setState({
                users: [
                    { id: 1, activeStatus: 'Y' },
                    { id: 2, activeStatus: 'N' }
                ] as any,
                seats: [
                    { id: 1, activeStatus: 'Y', status: 'available' },
                    { id: 2, activeStatus: 'Y', status: 'occupied' }
                ] as any,
                books: [
                    { id: 1, activeStatus: 'Y', status: 'available' },
                    { id: 2, activeStatus: 'Y', status: 'borrowed' }
                ] as any,
                seatReservations: [],
                bookBorrowings: []
            })

            const stats = useDataStore.getState().getStats()
            expect(stats.totalUsers).toBe(1)
            expect(stats.totalSeats).toBe(2)
            expect(stats.totalBooks).toBe(2)
            expect(stats.availableBooks).toBe(1)
            expect(stats.borrowedBooks).toBe(1)
            expect(stats.seatUtilization).toBe(50)
            expect(stats.bookBorrowRate).toBe(50)
        })

        it('handles empty state', () => {
            const stats = useDataStore.getState().getStats()
            expect(stats.totalUsers).toBe(0)
            expect(stats.seatUtilization).toBe(0)
            expect(stats.bookBorrowRate).toBe(0)
        })
    })

    describe('getActiveUsers', () => {
        it('filters active users', () => {
            useDataStore.setState({
                users: [
                    { id: 1, activeStatus: 'Y' },
                    { id: 2, activeStatus: 'N' },
                    { id: 3, activeStatus: 'Y' }
                ] as any
            })
            expect(useDataStore.getState().getActiveUsers()).toHaveLength(2)
        })
    })

    describe('getActiveRooms', () => {
        it('filters active rooms', () => {
            useDataStore.setState({
                rooms: [
                    { id: 1, activeStatus: 'Y' },
                    { id: 2, activeStatus: 'N' }
                ] as any
            })
            expect(useDataStore.getState().getActiveRooms()).toHaveLength(1)
        })
    })

    describe('getSeatsByRoom', () => {
        it('returns active seats for a room', () => {
            useDataStore.setState({
                seats: [
                    { id: 1, roomId: 1, activeStatus: 'Y' },
                    { id: 2, roomId: 1, activeStatus: 'N' },
                    { id: 3, roomId: 2, activeStatus: 'Y' }
                ] as any
            })
            expect(useDataStore.getState().getSeatsByRoom(1)).toHaveLength(1)
        })
    })

    describe('getUserReservations', () => {
        it('filters reservations by userId', () => {
            useDataStore.setState({
                seatReservations: [
                    { id: 1, userId: 1 },
                    { id: 2, userId: 2 },
                    { id: 3, userId: 1 }
                ] as any
            })
            expect(useDataStore.getState().getUserReservations(1)).toHaveLength(2)
        })
    })

    describe('getWeeklyTrendData', () => {
        it('returns 7 days of data', () => {
            const data = useDataStore.getState().getWeeklyTrendData()
            expect(data).toHaveLength(7)
            data.forEach(d => {
                expect(d).toHaveProperty('name')
                expect(d).toHaveProperty('reservations')
                expect(d).toHaveProperty('borrowings')
            })
        })
    })

    describe('getTimeSlotDistribution', () => {
        it('counts reservations by startTime hour', () => {
            useDataStore.setState({
                seatReservations: [
                    { id: 1, status: 'active', startTime: '09:00' },
                    { id: 2, status: 'active', startTime: '09:30' },
                    { id: 3, status: 'active', startTime: '14:00' },
                    { id: 4, status: 'cancelled', startTime: '09:00' }
                ] as any
            })

            const dist = useDataStore.getState().getTimeSlotDistribution()
            const nine = dist.find(d => d.time === '09:00')
            const fourteen = dist.find(d => d.time === '14:00')

            expect(nine!.count).toBe(2)
            expect(fourteen!.count).toBe(1)
        })

        it('does not count cancelled reservations', () => {
            useDataStore.setState({
                seatReservations: [
                    { id: 1, status: 'cancelled', startTime: '10:00' }
                ] as any
            })
            const dist = useDataStore.getState().getTimeSlotDistribution()
            const ten = dist.find(d => d.time === '10:00')
            expect(ten!.count).toBe(0)
        })
    })

    describe('createBorrowing', () => {
        it('returns success object on success', async () => {
            useDataStore.setState({
                users: [{ id: 1, email: 'test@test.com', name: 'Test' }] as any
            });
            (listMembers as Mock).mockResolvedValue([{ id: 10, email: 'test@test.com' }])
            const { createLoan } = await import('../services/loansApi');
            (createLoan as Mock).mockResolvedValue({ id: 1 });
            (listLoans as Mock).mockResolvedValue([])

            const result = await useDataStore.getState().createBorrowing({
                userId: 1, bookId: 5
            } as any)
            expect(result.success).toBe(true)
        })

        it('returns failure object on error', async () => {
            useDataStore.setState({ users: [] });
            (listMembers as Mock).mockRejectedValue(new Error('Network error'))

            const result = await useDataStore.getState().createBorrowing({
                userId: 1, bookId: 5
            } as any)
            expect(result.success).toBe(false)
            expect(result.error).toBe('Network error')
        })
    })

    describe('returnBook', () => {
        it('returns success object', async () => {
            useDataStore.setState({ users: [] });
            (updateLoan as Mock).mockResolvedValue({});
            (listLoans as Mock).mockResolvedValue([])

            const result = await useDataStore.getState().returnBook(1)
            expect(result.success).toBe(true)
        })

        it('returns failure on error', async () => {
            (updateLoan as Mock).mockRejectedValue(new Error('Not found'))

            const result = await useDataStore.getState().returnBook(999)
            expect(result.success).toBe(false)
            expect(result.error).toBe('Not found')
        })
    })

    describe('deleteUser', () => {
        it('removes user from state', async () => {
            useDataStore.setState({ users: [{ id: 1 }, { id: 2 }] as any });
            (deleteUserApi as Mock).mockResolvedValue(undefined)

            await useDataStore.getState().deleteUser(1)
            expect(useDataStore.getState().users).toHaveLength(1)
            expect(useDataStore.getState().users[0].id).toBe(2)
        })
    })

    describe('addRoom', () => {
        it('adds room to state', async () => {
            useDataStore.setState({ rooms: [] });
            (createRoom as Mock).mockResolvedValue({ id: 1, name: 'New Room', activeStatus: 'Y' })

            await useDataStore.getState().addRoom({ name: 'New Room' } as any)
            expect(useDataStore.getState().rooms).toHaveLength(1)
        })
    })

    describe('createReservation', () => {
        it('returns success with reservation', async () => {
            useDataStore.setState({ seatReservations: [] });
            (createReservation as Mock).mockResolvedValue({ id: 1, status: 'active' })

            const result = await useDataStore.getState().createReservation({
                userId: 1, seatId: 1, date: '2026-06-01', startTime: '09:00', endTime: '12:00'
            })
            expect(result.success).toBe(true)
            expect(result.reservation).toBeDefined()
        })

        it('returns failure on conflict', async () => {
            (createReservation as Mock).mockRejectedValue(new Error('Conflict'))

            const result = await useDataStore.getState().createReservation({
                userId: 1, seatId: 1, date: '2026-06-01', startTime: '09:00', endTime: '12:00'
            })
            expect(result.success).toBe(false)
        })
    })

    describe('getNotificationCount', () => {
        it('returns 0 when no user', () => {
            expect(useDataStore.getState().getNotificationCount(null)).toBe(0)
        })

        it('returns unreadCount when user present', () => {
            useDataStore.setState({ unreadCount: 5 })
            expect(useDataStore.getState().getNotificationCount({ id: 1 } as any)).toBe(5)
        })
    })
})
