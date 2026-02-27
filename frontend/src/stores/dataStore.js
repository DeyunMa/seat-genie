import { create } from 'zustand'
import { listBooks } from '../services/booksApi'
import { listLoans, createLoan, updateLoan } from '../services/loansApi'
import { listMembers, createMember } from '../services/membersApi'
import { listUsers, createUser, updateUser, deleteUser as deleteUserApi } from '../services/usersApi'
import { listRooms, createRoom, updateRoom, deleteRoom as deleteRoomApi } from '../services/roomsApi'
import { listSeats, createSeat, updateSeat, deleteSeat as deleteSeatApi } from '../services/seatsApi'
import { listReservations, createReservation, cancelReservation as cancelReservationApi } from '../services/reservationsApi'
import { listNotifications, createNotification, updateNotification, deleteNotification as deleteNotificationApi, markAsRead, getUnreadCount, getReadStatus } from '../services/notificationsApi'

const toDateOnly = (value) => {
    if (!value) return null
    const normalized = typeof value === 'string' ? value.replace(' ', 'T') : value
    const date = new Date(normalized)
    if (Number.isNaN(date.getTime())) return null
    return date.toISOString().split('T')[0]
}

const mapLoansToBorrowings = (loans, usersByEmail) => {
    if (!Array.isArray(loans)) return []
    return loans.map(loan => ({
        id: String(loan.id),
        userId: usersByEmail?.[loan.member_email] ?? null,
        memberId: loan.member_id,
        memberName: loan.member_name,
        memberEmail: loan.member_email,
        bookId: loan.book_id,
        bookTitle: loan.book_title,
        borrowDate: toDateOnly(loan.loaned_at),
        dueDate: toDateOnly(loan.due_at),
        returnDate: loan.returned_at ? toDateOnly(loan.returned_at) : null,
        status: loan.returned_at ? 'returned' : 'borrowed',
        createdAt: loan.loaned_at,
        updatedAt: loan.returned_at ?? loan.loaned_at
    }))
}

export const useDataStore = create((set, get) => ({
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
                listBooks().catch(() => []),
                listMembers().catch(() => []),
                listLoans({ limit: 100 }).catch(() => []),
                getUnreadCount(currentUser.id).catch(() => 0)
            ])

            const usersByEmail = users.reduce((acc, user) => {
                if (user.email) acc[user.email] = user.id
                return acc
            }, {})
            const borrowings = mapLoansToBorrowings(remoteLoans, usersByEmail)

            // Load notification read status
            const notificationIds = notifications.map(n => n.id)
            let readStatus = {}
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
            set({ error: error.message, loading: false })
            console.error('Failed to load data:', error)
        }
    },

    // USER OPERATIONS
    getActiveUsers: () => get().users.filter(u => u.activeStatus === 'Y'),

    addUser: async (userData) => {
        const newUser = await createUser({
            ...userData,
            activeStatus: 'Y'
        })
        set(state => ({ users: [...state.users, newUser] }))
        return newUser
    },

    updateUser: async (id, updates) => {
        const updatedUser = await updateUser(id, updates)
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

    resetUserPassword: async (id, newPassword = '123456') => {
        return get().updateUser(id, { password: newPassword })
    },

    // ROOM OPERATIONS
    getActiveRooms: () => get().rooms.filter(r => r.activeStatus === 'Y'),

    addRoom: async (roomData) => {
        const newRoom = await createRoom({
            ...roomData,
            activeStatus: 'Y'
        })
        set(state => ({ rooms: [...state.rooms, newRoom] }))
        return newRoom
    },

    updateRoom: async (id, updates) => {
        const updatedRoom = await updateRoom(id, updates)
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
        })
        set(state => ({ seats: [...state.seats, newSeat] }))
        return newSeat
    },

    updateSeat: async (id, updates) => {
        const updatedSeat = await updateSeat(id, updates)
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
            })
            set(state => ({
                seatReservations: [...state.seatReservations, reservation]
            }))
            return { success: true, reservation }
        } catch (error) {
            return { success: false, error: error.message || '该时间段已被预约' }
        }
    },

    cancelReservation: async (id) => {
        const updated = await cancelReservationApi(id)
        set(state => ({
            seatReservations: state.seatReservations.map(r => 
                r.id === id ? { ...r, status: 'cancelled' } : r
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
        })
        set(state => ({ notifications: [newNotification, ...state.notifications] }))
        return newNotification
    },

    updateNotification: async (id, updates) => {
        const updated = await updateNotification(id, updates)
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
        // First ensure member exists
        const members = await listMembers()
        const email = borrowingData.memberEmail || borrowingData.userEmail
        let member = members.find(m => m.email === email)
        
        if (!member) {
            // Create member if not exists
            member = await createMember({
                name: borrowingData.memberName || borrowingData.userName,
                email: email,
                phone: borrowingData.memberPhone || ''
            })
        }

        // Create loan
        const dueDate = new Date()
        dueDate.setDate(dueDate.getDate() + 14)

        const loan = await createLoan({
            bookId: borrowingData.bookId,
            memberId: member.id,
            dueAt: dueDate.toISOString()
        })

        // Refresh borrowings
        const loans = await listLoans({ limit: 100 })
        const usersByEmail = get().users.reduce((acc, user) => {
            if (user.email) acc[user.email] = user.id
            return acc
        }, {})
        const borrowings = mapLoansToBorrowings(loans, usersByEmail)

        set({ bookBorrowings: borrowings })
        return loan
    },

    returnBook: async (borrowingId) => {
        await updateLoan(borrowingId, {
            returnedAt: new Date().toISOString()
        })

        // Refresh borrowings
        const loans = await listLoans({ limit: 100 })
        const usersByEmail = get().users.reduce((acc, user) => {
            if (user.email) acc[user.email] = user.id
            return acc
        }, {})
        const borrowings = mapLoansToBorrowings(loans, usersByEmail)

        set({ bookBorrowings: borrowings })
        return true
    },

    getUserBorrowings: (userId) => {
        return get().bookBorrowings.filter(b => b.userId === userId && b.status === 'borrowed')
    },

    // STATISTICS
    getStats: () => {
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
            b.status === 'borrowed' && b.dueDate < today
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

    getWeeklyTrendData: () => {
        const state = get()
        const data = []
        
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

    getMonthlyBorrowingTrend: () => {
        const state = get()
        const data = []

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

    getPopularBooks: () => {
        const state = get()
        const bookCounts = {}
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

    getTimeSlotDistribution: () => {
        const state = get()
        const slots = {}
        for (let i = 8; i <= 22; i++) {
            slots[`${String(i).padStart(2, '0')}:00`] = 0
        }

        state.seatReservations.forEach(r => {
             if (r.status === 'active' && r.start_time) {
                 const hour = r.start_time.split(':')[0] + ':00'
                 if (slots[hour] !== undefined) {
                     slots[hour]++
                 }
             }
        })

        return Object.entries(slots).map(([time, count]) => ({ time, count }))
    }
}))
