import { v4 as uuidv4 } from 'uuid'
import { insertRow, hasData, runQuery } from './sqliteService'

const STORAGE_KEYS = {
    USERS: 'users',
    ROOMS: 'rooms',
    SEATS: 'seats',
    BOOKS: 'books',
    SEAT_RESERVATIONS: 'seat_reservations',
    BOOK_BORROWINGS: 'book_borrowings',
    INITIALIZED: 'initialized'
}

export const initializeData = () => {
    // Check if already initialized
    if (hasData('users')) {
        console.log('Data already initialized')
        return
    }

    const now = new Date().toISOString()

    // Initialize Users
    const users = [
        {
            id: uuidv4(),
            username: 'admin',
            password: 'admin123',
            name: '系统管理员',
            role: 'admin',
            email: 'admin@library.edu',
            phone: '13800000001',
            studentId: null,
            activeStatus: 'Y',
            createdAt: now,
            updatedAt: now
        },
        {
            id: uuidv4(),
            username: 'staff1',
            password: 'staff123',
            name: '张图书管理员',
            role: 'staff',
            email: 'staff1@library.edu',
            phone: '13800000002',
            studentId: null,
            activeStatus: 'Y',
            createdAt: now,
            updatedAt: now
        },
        {
            id: uuidv4(),
            username: 'student1',
            password: 'student123',
            name: '李明',
            role: 'student',
            studentId: '2024001001',
            email: 'liming@student.edu',
            phone: '13800000003',
            activeStatus: 'Y',
            createdAt: now,
            updatedAt: now
        },
        {
            id: uuidv4(),
            username: 'student2',
            password: 'student123',
            name: '王芳',
            role: 'student',
            studentId: '2024001002',
            email: 'wangfang@student.edu',
            phone: '13800000004',
            activeStatus: 'Y',
            createdAt: now,
            updatedAt: now
        },
        {
            id: uuidv4(),
            username: 'student3',
            password: 'student123',
            name: '张伟',
            role: 'student',
            studentId: '2024001003',
            email: 'zhangwei@student.edu',
            phone: '13800000005',
            activeStatus: 'Y',
            createdAt: now,
            updatedAt: now
        }
    ]
    users.forEach(user => insertRow('users', user))

    // Initialize Rooms
    const rooms = [
        {
            id: 'room-1',
            name: '一楼自习室A',
            floor: 1,
            capacity: 50,
            openTime: '08:00',
            closeTime: '22:00',
            activeStatus: 'Y',
            createdAt: now,
            updatedAt: now
        },
        {
            id: 'room-2',
            name: '一楼自习室B',
            floor: 1,
            capacity: 40,
            openTime: '08:00',
            closeTime: '22:00',
            activeStatus: 'Y',
            createdAt: now,
            updatedAt: now
        },
        {
            id: 'room-3',
            name: '二楼阅览室',
            floor: 2,
            capacity: 60,
            openTime: '08:00',
            closeTime: '21:00',
            activeStatus: 'Y',
            createdAt: now,
            updatedAt: now
        },
        {
            id: 'room-4',
            name: '三楼研讨室',
            floor: 3,
            capacity: 20,
            openTime: '09:00',
            closeTime: '20:00',
            activeStatus: 'Y',
            createdAt: now,
            updatedAt: now
        }
    ]
    rooms.forEach(room => insertRow('rooms', room))

    // Initialize Seats
    const seats = []
    rooms.forEach(room => {
        const seatCount = Math.min(room.capacity, 20) // Limit seats for demo
        for (let i = 1; i <= seatCount; i++) {
            const seat = {
                id: `${room.id}-seat-${i}`,
                roomId: room.id,
                seatNumber: `${room.name.charAt(0)}${String(i).padStart(2, '0')}`,
                status: Math.random() > 0.9 ? 'maintenance' : 'available',
                activeStatus: 'Y',
                createdAt: now,
                updatedAt: now
            }
            seats.push(seat)
            insertRow('seats', seat)
        }
    })

    // Initialize Books
    const books = [
        {
            id: uuidv4(),
            isbn: '978-7-302-52083-3',
            title: '数据结构与算法分析',
            author: '马克·艾伦·维斯',
            publisher: '清华大学出版社',
            category: '计算机科学',
            status: 'available',
            location: 'A区-01-03',
            activeStatus: 'Y',
            createdAt: now,
            updatedAt: now
        },
        {
            id: uuidv4(),
            isbn: '978-7-111-40701-0',
            title: '计算机网络：自顶向下方法',
            author: 'James F.Kurose',
            publisher: '机械工业出版社',
            category: '计算机科学',
            status: 'available',
            location: 'A区-01-05',
            activeStatus: 'Y',
            createdAt: now,
            updatedAt: now
        },
        {
            id: uuidv4(),
            isbn: '978-7-5086-8698-4',
            title: '人类简史：从动物到上帝',
            author: '尤瓦尔·赫拉利',
            publisher: '中信出版社',
            category: '历史',
            status: 'borrowed',
            location: 'B区-02-01',
            activeStatus: 'Y',
            createdAt: now,
            updatedAt: now
        },
        {
            id: uuidv4(),
            isbn: '978-7-5447-7380-8',
            title: '百年孤独',
            author: '加西亚·马尔克斯',
            publisher: '南海出版公司',
            category: '文学',
            status: 'available',
            location: 'B区-03-02',
            activeStatus: 'Y',
            createdAt: now,
            updatedAt: now
        },
        {
            id: uuidv4(),
            isbn: '978-7-5327-6781-8',
            title: '三体',
            author: '刘慈欣',
            publisher: '重庆出版社',
            category: '科幻',
            status: 'available',
            location: 'C区-01-01',
            activeStatus: 'Y',
            createdAt: now,
            updatedAt: now
        },
        {
            id: uuidv4(),
            isbn: '978-7-5442-9168-5',
            title: '活着',
            author: '余华',
            publisher: '作家出版社',
            category: '文学',
            status: 'available',
            location: 'B区-03-05',
            activeStatus: 'Y',
            createdAt: now,
            updatedAt: now
        },
        {
            id: uuidv4(),
            isbn: '978-7-111-61381-8',
            title: '深入理解计算机系统',
            author: 'Randal E. Bryant',
            publisher: '机械工业出版社',
            category: '计算机科学',
            status: 'maintenance',
            location: 'A区-02-01',
            activeStatus: 'Y',
            createdAt: now,
            updatedAt: now
        },
        {
            id: uuidv4(),
            isbn: '978-7-208-16113-6',
            title: '经济学原理',
            author: '曼昆',
            publisher: '上海人民出版社',
            category: '经济学',
            status: 'available',
            location: 'D区-01-03',
            activeStatus: 'Y',
            createdAt: now,
            updatedAt: now
        }
    ]
    books.forEach(book => insertRow('books', book))

    // Initialize some sample reservations
    const today = new Date()
    const reservations = [
        {
            id: uuidv4(),
            userId: users[2].id, // student1
            seatId: seats[0].id,
            date: today.toISOString().split('T')[0],
            startTime: '09:00',
            endTime: '12:00',
            status: 'active',
            createdAt: now,
            updatedAt: now
        },
        {
            id: uuidv4(),
            userId: users[3].id, // student2
            seatId: seats[5].id,
            date: today.toISOString().split('T')[0],
            startTime: '14:00',
            endTime: '17:00',
            status: 'active',
            createdAt: now,
            updatedAt: now
        }
    ]
    reservations.forEach(r => insertRow('seat_reservations', r))

    // Initialize some sample borrowings
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 14)

    const borrowings = [
        {
            id: uuidv4(),
            userId: users[2].id, // student1
            bookId: books[2].id, // 人类简史
            borrowDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            dueDate: dueDate.toISOString().split('T')[0],
            returnDate: null,
            status: 'borrowed',
            handledBy: users[1].id, // staff1
            createdAt: now,
            updatedAt: now
        }
    ]
    borrowings.forEach(b => insertRow('book_borrowings', b))

    console.log('Demo data initialized successfully!')
}

export { STORAGE_KEYS }
