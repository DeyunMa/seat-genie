export const ROLES = {
    ADMIN: 'admin',
    STAFF: 'staff',
    STUDENT: 'student',
}

export const ROLE_LABELS = {
    [ROLES.ADMIN]: '管理员',
    [ROLES.STAFF]: '工作人员',
    [ROLES.STUDENT]: '学生',
}

export const ROUTES = {
    LOGIN: '/login',
    DASHBOARD: '/dashboard',
    USERS: '/users',
    ROOMS: '/rooms',
    SEATS: '/seats',
    BOOKS: '/books',
    BORROW_MANAGEMENT: '/borrow-management',
    RESERVE_SEAT: '/reserve-seat',
    MY_RESERVATIONS: '/my-reservations',
    MY_BORROWINGS: '/my-borrowings',
    NOTIFICATIONS: '/notifications',
    SEAT_STATISTICS: '/seat-statistics',
    BOOK_STATISTICS: '/book-statistics',
    CHANGE_PASSWORD: '/change-password',
}

export const SEAT_STATUS = {
    AVAILABLE: 'available',
    OCCUPIED: 'occupied',
    MAINTENANCE: 'maintenance',
}

export const BOOK_STATUS = {
    AVAILABLE: 'available',
    BORROWED: 'borrowed',
    CHECKED_OUT: 'checked_out',
    MAINTENANCE: 'maintenance',
    LOST: 'lost',
}

export const RESERVATION_STATUS = {
    ACTIVE: 'active',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
}
