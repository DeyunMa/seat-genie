import { create } from 'zustand'
import { listBooks } from '../services/booksApi'
import { listLoans, createLoan, updateLoan } from '../services/loansApi'
import { listMembers, createMember } from '../services/membersApi'
import { listUsers, createUser, updateUser, deleteUser as deleteUserApi } from '../services/usersApi'
import { listRooms, createRoom, updateRoom, deleteRoom as deleteRoomApi } from '../services/roomsApi'
import { listSeats, createSeat, updateSeat, deleteSeat as deleteSeatApi } from '../services/seatsApi'
import { listReservations, createReservation, cancelReservation as cancelReservationApi } from '../services/reservationsApi'
import { listNotifications, createNotification, updateNotification, deleteNotification as deleteNotificationApi, markAsRead, getUnreadCount, getReadStatus } from '../services/notificationsApi'
import { mapLoansToBorrowings } from '../utils/mappers'
import type { User, Room, Seat, Book, Reservation, Notification, Borrowing } from '../types'

interface ReservationResult {
    success: boolean
    reservation?: Reservation
    error?: string
}

interface BorrowingResult {
    success: boolean
    error?: string
}

interface Stats {
    totalUsers: number
    totalSeats: number
    totalBooks: number
    availableBooks: number
    borrowedBooks: number
    todayReservations: number
    activeBorrowings: number
    overdueBorrowings: number
    availableSeats: number
    seatUtilization: number
    bookBorrowRate: number
}

interface WeeklyTrendItem {
    name: string
    reservations: number
    borrowings: number
}

interface MonthlyTrendItem {
    name: string
    borrowings: number
    returns: number
}

interface PopularBookItem {
    name: string
    borrowCount: number
}

interface TimeSlotItem {
    time: string
    count: number
}

interface CreateBorrowingData {
    userId?: number | string
    memberEmail?: string
    userEmail?: string
    memberName?: string
    userName?: string
    memberPhone?: string
    bookId: number | string
}

interface DataState {
    users: User[]
    rooms: Room[]
    seats: Seat[]
    books: Book[]
    seatReservations: Reservation[]
    bookBorrowings: Borrowing[]
    members: { id: number; email: string; name: string }[]
    notifications: Notification[]
    notificationReads: Record<number, boolean>
    unreadCount: number
    loading: boolean
    error: string | null
    getCurrentUser?: () => { id: number; email: string }
    loadAllData: () => Promise<void>
    getActiveUsers: () => User[]
    addUser: (userData: Record<string, unknown>) => Promise<User>
    updateUser: (id: number, updates: Record<string, unknown>) => Promise<User>
    deleteUser: (id: number) => Promise<boolean>
    resetUserPassword: (id: number, newPassword?: string) => Promise<User>
    getActiveRooms: () => Room[]
    addRoom: (roomData: Record<string, unknown>) => Promise<Room>
    updateRoom: (id: number, updates: Record<string, unknown>) => Promise<Room>
    deleteRoom: (id: number) => Promise<boolean>
    getActiveSeats: () => Seat[]
    getSeatsByRoom: (roomId: number) => Seat[]
    addSeat: (seatData: Record<string, unknown>) => Promise<Seat>
    updateSeat: (id: number, updates: Record<string, unknown>) => Promise<Seat>
    deleteSeat: (id: number) => Promise<boolean>
    createReservation: (reservationData: Record<string, unknown>) => Promise<ReservationResult>
    cancelReservation: (id: number) => Promise<ReservationResult>
    getUserReservations: (userId: number) => Reservation[]
    getNotificationCount: (user: User | null) => number
    addNotification: (notificationData: Record<string, unknown>) => Promise<Notification>
    updateNotification: (id: number, updates: Record<string, unknown>) => Promise<Notification>
    deleteNotification: (id: number) => Promise<boolean>
    markNotificationAsRead: (notificationId: number, userId: number) => Promise<void>
    createBorrowing: (borrowingData: CreateBorrowingData) => Promise<BorrowingResult>
    returnBook: (borrowingId: number | string) => Promise<BorrowingResult>
    getUserBorrowings: (userId: number) => Borrowing[]
    getStats: () => Stats
    getWeeklyTrendData: () => WeeklyTrendItem[]
    getMonthlyBorrowingTrend: () => MonthlyTrendItem[]
    getPopularBooks: () => PopularBookItem[]
    getTimeSlotDistribution: () => TimeSlotItem[]
}

export const useDataStore = create<DataState>((set, get) => ({
    // Data states
    users: [],
    rooms: [],
    seats: [],
    books: [],
    seatReservations: [],
    bookBorrowings: [],
    members: [],
    notifications: [],
    notificationReads: {},
    unreadCount: 0,

    // Loading states
    loading: false,
    error: null,

    // Load all data from backend
    loadAllData: async () => {
        set({ loading: true, error: null })
        try {
            const currentUser = get().getCurrentUser?.() || { id: 1, email: '' }

            const [
                users,
                rooms,
                seats,
                reservations,
                notifications,
                remoteBooks,
                remoteMembers,
                remoteLoans,
                unread
            ] = await Promise.all([
                listUsers(),
                listRooms(),
                listSeats(),
                listReservations(),
                listNotifications(),
                listBooks().catch(() => [] as Book[]),
                listMembers().catch(() => []),
                listLoans({ limit: 100 }).catch(() => []),
                getUnreadCount(currentUser.id).catch(() => 0)
            ])

            const usersByEmail: Record<string, number> = users.reduce<Record<string, number>>((acc, user) => {
                if (user.email) acc[user.email] = user.id
                return acc
            }, {})
            const borrowings = mapLoansToBorrowings(remoteLoans, usersByEmail)

            const notificationIds = notifications.map(n => n.id)
            let readStatus: Record<number, boolean> = {}
            if (notificationIds.length > 0) {
                try {
                    readStatus = await getReadStatus(notificationIds, currentUser.id)
                } catch {
                    // ignore
                }
            }

            set({
                users,
                rooms,
                seats,
                seatReservations: reservations,
                notifications,
                notificationReads: readStatus,
                unreadCount: unread,
                books: remoteBooks,
                members: remoteMembers,
                bookBorrowings: borrowings,
                loading: false
            })
        } catch (error) {
            set({ error: (error as Error).message, loading: false })
            console.error('Failed to load data:', error)
        }
    },

    // USER OPERATIONS
    getActiveUsers: () => get().users.filter(u => u.activeStatus === 'Y'),

    addUser: async (userData) => {
        const newUser = await createUser({
            ...userData,
            activeStatus: 'Y'
        } as Parameters<typeof createUser>[0])
        set(state => ({ users: [...state.users, newUser] }))
        return newUser
    },

    updateUser: async (id, updates) => {
        const updatedUser = await updateUser(id, updates as Parameters<typeof updateUser>[1])
        set(state => ({
            users: state.users.map(u => u.id === id ? updatedUser : u)
        }))
        return updatedUser
    },

    deleteUser: async (id) => {
        await deleteUserApi(id)
        set(state => ({
            users: state.users.filter(u => u.id !== id)
        }))
        return true
    },

    resetUserPassword: async (id, newPassword = 'TempPass123!') => {
        return get().updateUser(id, { password: newPassword })
    },

    // ROOM OPERATIONS
    getActiveRooms: () => get().rooms.filter(r => r.activeStatus === 'Y'),

    addRoom: async (roomData) => {
        const newRoom = await createRoom({
            ...roomData,
            activeStatus: 'Y'
        } as Parameters<typeof createRoom>[0])
        set(state => ({ rooms: [...state.rooms, newRoom] }))
        return newRoom
    },

    updateRoom: async (id, updates) => {
        const updatedRoom = await updateRoom(id, updates as Parameters<typeof updateRoom>[1])
        set(state => ({
            rooms: state.rooms.map(r => r.id === id ? updatedRoom : r)
        }))
        return updatedRoom
    },

    deleteRoom: async (id) => {
        await deleteRoomApi(id)
        set(state => ({
            rooms: state.rooms.filter(r => r.id !== id),
            seats: state.seats.filter(s => s.roomId !== id)
        }))
        return true
    },

    // SEAT OPERATIONS
    getActiveSeats: () => get().seats.filter(s => s.activeStatus === 'Y'),

    getSeatsByRoom: (roomId) => {
        return get().seats.filter(s => s.roomId === roomId && s.activeStatus === 'Y')
    },

    addSeat: async (seatData) => {
        const newSeat = await createSeat({
            ...seatData,
            status: 'available',
            activeStatus: 'Y'
        } as Parameters<typeof createSeat>[0])
        set(state => ({ seats: [...state.seats, newSeat] }))
        return newSeat
    },

    updateSeat: async (id, updates) => {
        const updatedSeat = await updateSeat(id, updates as Parameters<typeof updateSeat>[1])
        set(state => ({
            seats: state.seats.map(s => s.id === id ? updatedSeat : s)
        }))
        return updatedSeat
    },

    deleteSeat: async (id) => {
        await deleteSeatApi(id)
        set(state => ({
            seats: state.seats.filter(s => s.id !== id)
        }))
        return true
    },

    // SEAT RESERVATION OPERATIONS
    createReservation: async (reservationData) => {
        try {
            const reservation = await createReservation({
                ...reservationData,
                status: 'active'
            } as Parameters<typeof createReservation>[0])
            set(state => ({
                seatReservations: [...state.seatReservations, reservation]
            }))
            return { success: true, reservation }
        } catch (error) {
            return { success: false, error: (error as Error).message || '该时间段已被预约' }
        }
    },

    cancelReservation: async (id) => {
        const updated = await cancelReservationApi(id)
        set(state => ({
            seatReservations: state.seatReservations.map(r =>
                r.id === id ? { ...r, status: 'cancelled' as const } : r
            )
        }))
        return { success: true, reservation: updated }
    },

    getUserReservations: (userId) => {
        return get().seatReservations.filter(r => r.userId === userId)
    },

    // NOTIFICATION OPERATIONS
    getNotificationCount: (user) => {
        if (!user) return 0
        const state = get()
        return state.unreadCount || 0
    },

    addNotification: async (notificationData) => {
        const newNotification = await createNotification({
            ...notificationData,
            activeStatus: 'Y'
        } as Parameters<typeof createNotification>[0])
        set(state => ({ notifications: [newNotification, ...state.notifications] }))
        return newNotification
    },

    updateNotification: async (id, updates) => {
        const updated = await updateNotification(id, updates as Parameters<typeof updateNotification>[1])
        set(state => ({
            notifications: state.notifications.map(n => n.id === id ? updated : n)
        }))
        return updated
    },

    deleteNotification: async (id) => {
        await deleteNotificationApi(id)
        set(state => ({
            notifications: state.notifications.filter(n => n.id !== id)
        }))
        return true
    },

    markNotificationAsRead: async (notificationId, userId) => {
        await markAsRead(notificationId, userId)
        set(state => ({
            notificationReads: { ...state.notificationReads, [notificationId]: true },
            unreadCount: Math.max(0, state.unreadCount - 1)
        }))
    },

    // BOOK BORROWING OPERATIONS (from API)
    createBorrowing: async (borrowingData) => {
        try {
            const stateUsers = get().users
            const borrower = stateUsers.find(u => String(u.id) === String(borrowingData.userId))
            const email = borrowingData.memberEmail || borrowingData.userEmail || borrower?.email || ''
            const name = borrowingData.memberName || borrowingData.userName || borrower?.name || ''

            const members = await listMembers()
            let member = members.find(m => m.email === email)

            if (!member) {
                member = await createMember({
                    name: name,
                    email: email,
                    phone: borrowingData.memberPhone || ''
                })
            }

            const dueDate = new Date()
            dueDate.setDate(dueDate.getDate() + 14)

            await createLoan({
                bookId: Number(borrowingData.bookId),
                memberId: member.id,
                dueAt: dueDate.toISOString()
            })

            const loans = await listLoans({ limit: 100 })
            const usersByEmail: Record<string, number> = stateUsers.reduce<Record<string, number>>((acc, user) => {
                if (user.email) acc[user.email] = user.id
                return acc
            }, {})
            const borrowings = mapLoansToBorrowings(loans, usersByEmail)
            set({ bookBorrowings: borrowings })

            return { success: true }
        } catch (error) {
            return { success: false, error: (error as Error).message || 'Borrow failed' }
        }
    },

    returnBook: async (borrowingId) => {
        try {
            await updateLoan(borrowingId, {
                returnedAt: new Date().toISOString()
            })

            const loans = await listLoans({ limit: 100 })
            const usersByEmail: Record<string, number> = get().users.reduce<Record<string, number>>((acc, user) => {
                if (user.email) acc[user.email] = user.id
                return acc
            }, {})
            const borrowings = mapLoansToBorrowings(loans, usersByEmail)
            set({ bookBorrowings: borrowings })

            return { success: true }
        } catch (error) {
            return { success: false, error: (error as Error).message || 'Return failed' }
        }
    },

    getUserBorrowings: (userId) => {
        return get().bookBorrowings.filter(b => b.userId === userId && b.status === 'borrowed')
    },

    // STATISTICS
    getStats: (): Stats => {
        const state = get()
        const today = new Date().toISOString().split('T')[0]

        const totalUsers = state.users.filter(u => u.activeStatus === 'Y').length
        const totalSeats = state.seats.filter(s => s.activeStatus === 'Y').length
        const totalBooks = state.books.filter(b => b.activeStatus === 'Y').length
        const availableBooks = state.books.filter(b => b.activeStatus === 'Y' && b.status === 'available').length
        const borrowedBooks = state.books.filter(b => b.status === 'borrowed').length

        const todayReservations = state.seatReservations.filter(r =>
            r.date === today && r.status === 'active'
        ).length

        const activeBorrowings = state.bookBorrowings.filter(b => b.status === 'borrowed').length
        const overdueBorrowings = state.bookBorrowings.filter(b =>
            b.status === 'borrowed' && b.dueDate !== null && b.dueDate < today
        ).length

        const availableSeats = state.seats.filter(s =>
            s.activeStatus === 'Y' && s.status === 'available'
        ).length

        const seatUtilization = totalSeats > 0
            ? Math.round(((totalSeats - availableSeats) / totalSeats) * 100)
            : 0

        const bookBorrowRate = totalBooks > 0
            ? Math.round((borrowedBooks / totalBooks) * 100)
            : 0

        return {
            totalUsers,
            totalSeats,
            totalBooks,
            availableBooks,
            borrowedBooks,
            todayReservations,
            activeBorrowings,
            overdueBorrowings,
            availableSeats,
            seatUtilization,
            bookBorrowRate
        }
    },

    getWeeklyTrendData: (): WeeklyTrendItem[] => {
        const state = get()
        const data: WeeklyTrendItem[] = []

        for (let i = 6; i >= 0; i--) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            const dateStr = date.toISOString().split('T')[0]
            const dayName = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()]

            const reservations = state.seatReservations.filter(r =>
                r.date === dateStr && r.status === 'active'
            ).length

            const borrowings = state.bookBorrowings.filter(b =>
                b.borrowDate === dateStr
            ).length

            data.push({
                name: dayName,
                reservations,
                borrowings
            })
        }

        return data
    },

    getMonthlyBorrowingTrend: (): MonthlyTrendItem[] => {
        const state = get()
        const data: MonthlyTrendItem[] = []

        for (let i = 29; i >= 0; i--) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            const dateStr = date.toISOString().split('T')[0]

            const borrowings = state.bookBorrowings.filter(b => b.borrowDate === dateStr).length
            const returns = state.bookBorrowings.filter(b => b.returnDate === dateStr).length

            if (i % 5 === 0) {
                data.push({ name: dateStr.slice(5), borrowings, returns })
            } else {
                data.push({ name: '', borrowings, returns })
            }
        }
        return data
    },

    getPopularBooks: (): PopularBookItem[] => {
        const state = get()
        const bookCounts: Record<string, number> = {}
        state.bookBorrowings.forEach(b => {
            if (b.bookTitle) {
                bookCounts[b.bookTitle] = (bookCounts[b.bookTitle] || 0) + 1
            }
        })

        return Object.entries(bookCounts)
            .map(([name, borrowCount]) => ({ name, borrowCount }))
            .sort((a, b) => b.borrowCount - a.borrowCount)
            .slice(0, 10)
    },

    getTimeSlotDistribution: (): TimeSlotItem[] => {
        const state = get()
        const slots: Record<string, number> = {}
        for (let i = 8; i <= 22; i++) {
            slots[`${String(i).padStart(2, '0')}:00`] = 0
        }

        state.seatReservations.forEach(r => {
            if (r.status === 'active' && r.startTime) {
                const hour = r.startTime.split(':')[0] + ':00'
                if (slots[hour] !== undefined) {
                    slots[hour]++
                }
            }
        })

        return Object.entries(slots).map(([time, count]) => ({ time, count }))
    }
}))
