import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import {
    getAll,
    getActive,
    insertRow,
    updateRow,
    selectQuery,
    runQuery
} from '../services/sqliteService'
import { STORAGE_KEYS } from '../services/initData'

export const useDataStore = create((set, get) => ({
    // Data states
    users: [],
    rooms: [],
    seats: [],
    books: [],
    seatReservations: [],
    bookBorrowings: [],
    notifications: [],
    notificationReads: [],

    // Loading states
    loading: false,

    // Load all data from SQLite
    loadAllData: () => {
        set({
            users: getAll('users') || [],
            rooms: getAll('rooms') || [],
            seats: getAll('seats') || [],
            books: getAll('books') || [],
            seatReservations: getAll('seat_reservations') || [],
            bookBorrowings: getAll('book_borrowings') || [],
            notifications: getAll('notifications') || [],
            notificationReads: getAll('notification_reads') || []
        })
    },

    // USER OPERATIONS
    getActiveUsers: () => getActive('users'),

    addUser: (userData) => {
        const now = new Date().toISOString()
        const newUser = {
            id: uuidv4(),
            ...userData,
            studentId: userData.studentId || null,
            activeStatus: 'Y',
            createdAt: now,
            updatedAt: now
        }
        insertRow('users', newUser)
        const users = getAll('users')
        set({ users })
        return newUser
    },

    updateUser: (id, updates) => {
        const updatedData = { ...updates, updatedAt: new Date().toISOString() }
        updateRow('users', id, updatedData)
        const users = getAll('users')
        set({ users })
        return users.find(u => u.id === id)
    },

    deleteUser: (id) => {
        updateRow('users', id, {
            activeStatus: 'N',
            updatedAt: new Date().toISOString()
        })
        const users = getAll('users')
        set({ users })
        return true
    },

    resetUserPassword: (id, newPassword = '123456') => {
        return get().updateUser(id, { password: newPassword })
    },

    // ROOM OPERATIONS
    getActiveRooms: () => getActive('rooms'),

    addRoom: (roomData) => {
        const now = new Date().toISOString()
        const newRoom = {
            id: `room-${uuidv4().slice(0, 8)}`,
            ...roomData,
            activeStatus: 'Y',
            createdAt: now,
            updatedAt: now
        }
        insertRow('rooms', newRoom)
        const rooms = getAll('rooms')
        set({ rooms })
        return newRoom
    },

    updateRoom: (id, updates) => {
        const updatedData = { ...updates, updatedAt: new Date().toISOString() }
        updateRow('rooms', id, updatedData)
        const rooms = getAll('rooms')
        set({ rooms })
        return rooms.find(r => r.id === id)
    },

    deleteRoom: (id) => {
        updateRow('rooms', id, {
            activeStatus: 'N',
            updatedAt: new Date().toISOString()
        })
        const rooms = getAll('rooms')
        set({ rooms })
        return true
    },

    // SEAT OPERATIONS
    getActiveSeats: () => getActive('seats'),

    getSeatsByRoom: (roomId) => {
        return selectQuery(
            "SELECT * FROM seats WHERE roomId = ? AND activeStatus = 'Y'",
            [roomId]
        )
    },

    addSeat: (seatData) => {
        const now = new Date().toISOString()
        const newSeat = {
            id: `${seatData.roomId}-seat-${uuidv4().slice(0, 8)}`,
            ...seatData,
            status: 'available',
            activeStatus: 'Y',
            createdAt: now,
            updatedAt: now
        }
        insertRow('seats', newSeat)
        const seats = getAll('seats')
        set({ seats })
        return newSeat
    },

    updateSeat: (id, updates) => {
        const updatedData = { ...updates, updatedAt: new Date().toISOString() }
        updateRow('seats', id, updatedData)
        const seats = getAll('seats')
        set({ seats })
        return seats.find(s => s.id === id)
    },

    deleteSeat: (id) => {
        updateRow('seats', id, {
            activeStatus: 'N',
            updatedAt: new Date().toISOString()
        })
        const seats = getAll('seats')
        set({ seats })
        return true
    },

    // BOOK OPERATIONS
    getActiveBooks: () => getActive('books'),

    addBook: (bookData) => {
        const now = new Date().toISOString()
        const newBook = {
            id: uuidv4(),
            ...bookData,
            status: 'available',
            activeStatus: 'Y',
            createdAt: now,
            updatedAt: now
        }
        insertRow('books', newBook)
        const books = getAll('books')
        set({ books })
        return newBook
    },

    updateBook: (id, updates) => {
        const updatedData = { ...updates, updatedAt: new Date().toISOString() }
        updateRow('books', id, updatedData)
        const books = getAll('books')
        set({ books })
        return books.find(b => b.id === id)
    },

    deleteBook: (id) => {
        updateRow('books', id, {
            activeStatus: 'N',
            updatedAt: new Date().toISOString()
        })
        const books = getAll('books')
        set({ books })
        return true
    },

    // SEAT RESERVATION OPERATIONS
    createReservation: (reservationData) => {
        const now = new Date().toISOString()

        // Check for conflicts using SQL
        const conflicts = selectQuery(`
            SELECT * FROM seat_reservations 
            WHERE seatId = ? AND date = ? AND status = 'active'
            AND (
                (? >= startTime AND ? < endTime) OR
                (? > startTime AND ? <= endTime) OR
                (? <= startTime AND ? >= endTime)
            )
        `, [
            reservationData.seatId,
            reservationData.date,
            reservationData.startTime, reservationData.startTime,
            reservationData.endTime, reservationData.endTime,
            reservationData.startTime, reservationData.endTime
        ])

        if (conflicts.length > 0) {
            return { success: false, error: '该时间段已被预约' }
        }

        const newReservation = {
            id: uuidv4(),
            ...reservationData,
            status: 'active',
            createdAt: now,
            updatedAt: now
        }
        insertRow('seat_reservations', newReservation)
        const seatReservations = getAll('seat_reservations')
        set({ seatReservations })
        return { success: true, reservation: newReservation }
    },

    cancelReservation: (id) => {
        updateRow('seat_reservations', id, {
            status: 'cancelled',
            updatedAt: new Date().toISOString()
        })
        const seatReservations = getAll('seat_reservations')
        set({ seatReservations })
        return true
    },

    getUserReservations: (userId) => {
        return selectQuery('SELECT * FROM seat_reservations WHERE userId = ?', [userId])
    },

    getReservationsBySeat: (seatId, date) => {
        return selectQuery(
            "SELECT * FROM seat_reservations WHERE seatId = ? AND date = ? AND status = 'active'",
            [seatId, date]
        )
    },

    // BOOK BORROWING OPERATIONS
    borrowBook: (borrowData) => {
        const now = new Date().toISOString()

        // Check if book is available
        const books = selectQuery('SELECT * FROM books WHERE id = ?', [borrowData.bookId])
        const book = books[0]
        if (!book || book.status !== 'available') {
            return { success: false, error: '该图书不可借阅' }
        }

        // Update book status
        updateRow('books', borrowData.bookId, { status: 'borrowed', updatedAt: now })

        // Create borrowing record
        const dueDate = new Date()
        dueDate.setDate(dueDate.getDate() + 14) // 14 days loan period

        const newBorrowing = {
            id: uuidv4(),
            ...borrowData,
            borrowDate: now.split('T')[0],
            dueDate: dueDate.toISOString().split('T')[0],
            returnDate: null,
            status: 'borrowed',
            createdAt: now,
            updatedAt: now
        }
        insertRow('book_borrowings', newBorrowing)

        set({
            bookBorrowings: getAll('book_borrowings'),
            books: getAll('books')
        })

        return { success: true, borrowing: newBorrowing }
    },

    returnBook: (borrowingId, handledBy) => {
        const now = new Date().toISOString()

        const borrowings = selectQuery('SELECT * FROM book_borrowings WHERE id = ?', [borrowingId])
        const borrowing = borrowings[0]
        if (!borrowing) {
            return { success: false, error: '借阅记录不存在' }
        }

        // Update borrowing record
        updateRow('book_borrowings', borrowingId, {
            status: 'returned',
            returnDate: now.split('T')[0],
            updatedAt: now
        })

        // Update book status
        updateRow('books', borrowing.bookId, { status: 'available', updatedAt: now })

        set({
            bookBorrowings: getAll('book_borrowings'),
            books: getAll('books')
        })

        return { success: true }
    },

    getUserBorrowings: (userId) => {
        return selectQuery('SELECT * FROM book_borrowings WHERE userId = ?', [userId])
    },

    getOverdueBorrowings: () => {
        const today = new Date().toISOString().split('T')[0]
        return selectQuery(
            "SELECT * FROM book_borrowings WHERE status = 'borrowed' AND dueDate < ?",
            [today]
        )
    },

    // NOTIFICATION OPERATIONS
    getActiveNotifications: () => getActive('notifications'),

    addNotification: (notificationData, createdById) => {
        const now = new Date().toISOString()
        const newNotification = {
            id: uuidv4(),
            ...notificationData,
            createdBy: createdById,
            activeStatus: 'Y',
            createdAt: now,
            updatedAt: now
        }
        insertRow('notifications', newNotification)
        const notifications = getAll('notifications')
        set({ notifications })
        return newNotification
    },

    updateNotification: (id, updates) => {
        const updatedData = { ...updates, updatedAt: new Date().toISOString() }
        updateRow('notifications', id, updatedData)
        const notifications = getAll('notifications')
        set({ notifications })
        return notifications.find(n => n.id === id)
    },

    deleteNotification: (id) => {
        updateRow('notifications', id, {
            activeStatus: 'N',
            updatedAt: new Date().toISOString()
        })
        const notifications = getAll('notifications')
        set({ notifications })
        return true
    },

    // NOTIFICATION READ STATUS OPERATIONS
    markNotificationAsRead: (notificationId, userId) => {
        const notificationReads = getAll('notification_reads') || []
        const existingRead = notificationReads.find(
            r => r.notificationId === notificationId && r.userId === userId
        )
        if (existingRead) return existingRead

        const newRead = {
            id: uuidv4(),
            notificationId,
            userId,
            readAt: new Date().toISOString()
        }
        insertRow('notification_reads', newRead)
        set({ notificationReads: getAll('notification_reads') })
        return newRead
    },

    markAllNotificationsAsRead: (userId) => {
        const notifications = getAll('notifications') || []
        const notificationReads = getAll('notification_reads') || []
        const activeNotifications = notifications.filter(n => n.activeStatus === 'Y')

        activeNotifications.forEach(notification => {
            const existingRead = notificationReads.find(
                r => r.notificationId === notification.id && r.userId === userId
            )
            if (!existingRead) {
                const newRead = {
                    id: uuidv4(),
                    notificationId: notification.id,
                    userId,
                    readAt: new Date().toISOString()
                }
                insertRow('notification_reads', newRead)
            }
        })
        set({ notificationReads: getAll('notification_reads') })
        return true
    },

    isNotificationRead: (notificationId, userId) => {
        const notificationReads = getAll('notification_reads') || []
        return notificationReads.some(
            r => r.notificationId === notificationId && r.userId === userId
        )
    },

    getUnreadNotificationCount: (userId) => {
        if (!userId) return 0
        const notifications = getAll('notifications') || []
        const notificationReads = getAll('notification_reads') || []
        const activeNotifications = notifications.filter(n => n.activeStatus === 'Y')

        const unreadCount = activeNotifications.filter(notification => {
            return !notificationReads.some(
                r => r.notificationId === notification.id && r.userId === userId
            )
        }).length

        return unreadCount
    },

    // NOTIFICATION COUNT - 只统计未读公告数量
    getNotificationCount: (currentUser) => {
        if (!currentUser) return 0
        return get().getUnreadNotificationCount(currentUser.id)
    },

    // 获取过去7天的预约和借阅趋势数据
    getWeeklyTrendData: () => {
        const reservations = getAll('seat_reservations') || []
        const borrowings = getAll('book_borrowings') || []

        const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
        const result = []

        for (let i = 6; i >= 0; i--) {
            const date = new Date()
            date.setDate(date.getDate() - i)
            const dateStr = date.toISOString().split('T')[0]
            const dayName = days[date.getDay()]

            const dayReservations = reservations.filter(r => r.date === dateStr).length
            const dayBorrowings = borrowings.filter(b => b.borrowDate === dateStr).length

            result.push({
                name: dayName,
                date: dateStr,
                reservations: dayReservations,
                borrowings: dayBorrowings,
                peak: Math.max(dayReservations, dayBorrowings) + Math.floor(dayReservations * 0.15)
            })
        }

        return result
    },

    // 获取各时段的预约分布
    getTimeSlotDistribution: () => {
        const reservations = getAll('seat_reservations') || []
        const slots = []

        for (let hour = 8; hour <= 20; hour++) {
            const timeStr = `${String(hour).padStart(2, '0')}:00`
            const count = reservations.filter(r => {
                if (r.status !== 'active') return false
                const startHour = parseInt(r.startTime.split(':')[0])
                const endHour = parseInt(r.endTime.split(':')[0])
                return hour >= startHour && hour < endHour
            }).length

            slots.push({ time: timeStr, count })
        }

        return slots
    },

    // 获取最近6个月的借还趋势
    getMonthlyBorrowingTrend: () => {
        const borrowings = getAll('book_borrowings') || []
        const months = []
        const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']

        for (let i = 5; i >= 0; i--) {
            const date = new Date()
            date.setMonth(date.getMonth() - i)
            const year = date.getFullYear()
            const month = date.getMonth()

            const monthStart = `${year}-${String(month + 1).padStart(2, '0')}-01`
            const nextMonth = new Date(year, month + 1, 1)
            const monthEnd = nextMonth.toISOString().split('T')[0]

            const monthBorrowings = borrowings.filter(b =>
                b.borrowDate >= monthStart && b.borrowDate < monthEnd
            ).length

            const monthReturns = borrowings.filter(b =>
                b.returnDate && b.returnDate >= monthStart && b.returnDate < monthEnd
            ).length

            months.push({
                name: monthNames[month],
                borrowings: monthBorrowings,
                returns: monthReturns
            })
        }

        return months
    },

    // 获取热门图书（基于实际借阅记录）
    getPopularBooks: () => {
        const books = getAll('books') || []
        const borrowings = getAll('book_borrowings') || []

        const bookBorrowCounts = {}
        borrowings.forEach(b => {
            bookBorrowCounts[b.bookId] = (bookBorrowCounts[b.bookId] || 0) + 1
        })

        const activeBooks = books.filter(b => b.activeStatus === 'Y')
        const booksWithCounts = activeBooks.map(book => ({
            id: book.id,
            name: book.title.length > 15 ? book.title.substring(0, 15) + '...' : book.title,
            fullTitle: book.title,
            borrowCount: bookBorrowCounts[book.id] || 0
        }))

        return booksWithCounts
            .sort((a, b) => b.borrowCount - a.borrowCount)
            .slice(0, 5)
    },

    // STATISTICS
    getStats: () => {
        const today = new Date().toISOString().split('T')[0]

        const users = getAll('users') || []
        const seats = getAll('seats') || []
        const books = getAll('books') || []
        const reservations = getAll('seat_reservations') || []
        const borrowings = getAll('book_borrowings') || []

        const activeUsers = users.filter(u => u.activeStatus === 'Y')
        const activeSeats = seats.filter(s => s.activeStatus === 'Y')
        const activeBooks = books.filter(b => b.activeStatus === 'Y')
        const todayReservations = reservations.filter(r => r.date === today && r.status === 'active')
        const activeBorrowings = borrowings.filter(b => b.status === 'borrowed')
        const overdueBorrowings = borrowings.filter(b => b.status === 'borrowed' && b.dueDate < today)

        return {
            totalUsers: activeUsers.length,
            totalStudents: activeUsers.filter(u => u.role === 'student').length,
            totalSeats: activeSeats.length,
            availableSeats: activeSeats.filter(s => s.status === 'available').length,
            totalBooks: activeBooks.length,
            availableBooks: activeBooks.filter(b => b.status === 'available').length,
            borrowedBooks: activeBooks.filter(b => b.status === 'borrowed').length,
            todayReservations: todayReservations.length,
            activeBorrowings: activeBorrowings.length,
            overdueBorrowings: overdueBorrowings.length,
            seatUtilization: activeSeats.length > 0
                ? Math.round((todayReservations.length / activeSeats.length) * 100)
                : 0,
            bookBorrowRate: activeBooks.length > 0
                ? Math.round((activeBorrowings.length / activeBooks.length) * 100)
                : 0
        }
    }
}))
