import { render, screen, fireEvent, act } from '@testing-library/react'
import { vi, describe, it, expect } from 'vitest'
import UserList from './UserList'

// Mock the store
const mockUsers = Array.from({ length: 100 }, (_, i) => ({
    id: i + 1,
    username: `user${i}`,
    name: `User Name ${i}`,
    email: `user${i}@example.com`,
    role: i % 3 === 0 ? 'admin' : i % 3 === 1 ? 'staff' : 'student',
    activeStatus: 'Y',
    phone: '1234567890',
    studentId: `STU${i}`
}))

const mockLoadAllData = vi.fn()

vi.mock('../../stores/dataStore', () => ({
    useDataStore: vi.fn(() => ({
        users: mockUsers,
        loadAllData: mockLoadAllData,
        addUser: vi.fn(),
        updateUser: vi.fn(),
        deleteUser: vi.fn(),
        resetUserPassword: vi.fn(),
    }))
}))

// Mock Toast
vi.mock('../../components/common/Toast', () => ({
    useToast: () => ({
        addToast: vi.fn()
    })
}))

describe('UserList Performance Benchmark', () => {
    it('measures filtering performance', async () => {
        render(<UserList />)

        const searchInput = screen.getByPlaceholderText('搜索用户名、姓名或邮箱...')

        const startTime = performance.now()

        await act(async () => {
            fireEvent.change(searchInput, { target: { value: 'User Name 99' } })
        })

        // Wait for the filtered list to update
        await screen.findByText('User Name 99')

        const endTime = performance.now()
        const duration = endTime - startTime

        console.log(`Filtering users took ${duration.toFixed(2)}ms`)

        expect(screen.getByText('User Name 99')).toBeInTheDocument()
    })
})
