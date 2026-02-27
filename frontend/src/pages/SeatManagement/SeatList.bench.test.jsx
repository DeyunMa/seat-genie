import { render, screen, act } from '@testing-library/react'
import { vi, test, expect } from 'vitest'
import SeatList from './SeatList'

// Mock CSS
vi.mock('../UserManagement/UserManagement.css', () => ({}))
vi.mock('./SeatManagement.css', () => ({}))

// Mock components
vi.mock('../../components/common/Modal', () => ({
  __esModule: true,
  default: ({ children, isOpen }) => isOpen ? <div>{children}</div> : null,
  ConfirmModal: () => null
}))

vi.mock('../../components/common/Toast', () => ({
  useToast: () => ({ addToast: vi.fn() })
}))

// Generate large dataset
const generateData = () => {
  const rooms = []
  for (let i = 1; i <= 100; i++) {
    rooms.push({ id: i, name: `Room ${i}`, activeStatus: 'Y' })
  }

  const seats = []
  for (let i = 1; i <= 5000; i++) {
    seats.push({
      id: i,
      roomId: (i % 100) + 1,
      seatNumber: `Seat-${i}`,
      status: 'available',
      activeStatus: 'Y'
    })
  }
  return { rooms, seats }
}

const { rooms, seats } = generateData()

// Mock Store
const mockUseDataStore = vi.fn()
vi.mock('../../stores/dataStore', () => ({
  useDataStore: (...args) => mockUseDataStore(...args)
}))

test('SeatList Render Performance', async () => {
  const mockLoadAllData = vi.fn()
  mockUseDataStore.mockReturnValue({
    rooms,
    seats,
    loadAllData: mockLoadAllData,
    addSeat: vi.fn(),
    updateSeat: vi.fn(),
    deleteSeat: vi.fn(),
  })

  const start = performance.now()

  await act(async () => {
    render(<SeatList />)
  })

  const end = performance.now()
  console.log(`SeatList Render Time: ${(end - start).toFixed(2)}ms`)

  expect(screen.getByText('座位管理')).toBeInTheDocument()
}, 10000)
