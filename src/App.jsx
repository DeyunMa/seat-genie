import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import MainLayout from './components/layout/MainLayout'
import Login from './pages/Login/Login'
import Dashboard from './pages/Dashboard/Dashboard'
import UserList from './pages/UserManagement/UserList'
import SeatList from './pages/SeatManagement/SeatList'
import RoomManagement from './pages/SeatManagement/RoomManagement'
import BookList from './pages/BookManagement/BookList'
import BorrowManagement from './pages/BookManagement/BorrowManagement'
import MyBorrowings from './pages/BookManagement/MyBorrowings'
import SeatReservation from './pages/Reservation/SeatReservation'
import MyReservations from './pages/Reservation/MyReservations'
import NotificationCenter from './pages/Notification/NotificationCenter'
import SeatStatistics from './pages/Statistics/SeatStatistics'
import BookStatistics from './pages/Statistics/BookStatistics'
import ChangePassword from './pages/Settings/ChangePassword'
import { ToastProvider } from './components/common/Toast'

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <ToastProvider>
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        } />

        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />

          {/* User Management - Admin Only */}
          <Route path="users" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserList />
            </ProtectedRoute>
          } />

          {/* Seat Management - Staff & Admin */}
          <Route path="rooms" element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <RoomManagement />
            </ProtectedRoute>
          } />
          <Route path="seats" element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <SeatList />
            </ProtectedRoute>
          } />

          {/* Book Management - Staff & Admin */}
          <Route path="books" element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <BookList />
            </ProtectedRoute>
          } />
          <Route path="borrow-management" element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <BorrowManagement />
            </ProtectedRoute>
          } />

          {/* Student Routes */}
          <Route path="reserve-seat" element={
            <ProtectedRoute allowedRoles={['student']}>
              <SeatReservation />
            </ProtectedRoute>
          } />
          <Route path="my-reservations" element={
            <ProtectedRoute allowedRoles={['student']}>
              <MyReservations />
            </ProtectedRoute>
          } />
          <Route path="my-borrowings" element={
            <ProtectedRoute allowedRoles={['student']}>
              <MyBorrowings />
            </ProtectedRoute>
          } />

          {/* Notifications */}
          <Route path="notifications" element={<NotificationCenter />} />

          {/* Statistics - Staff & Admin */}
          <Route path="seat-statistics" element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <SeatStatistics />
            </ProtectedRoute>
          } />
          <Route path="book-statistics" element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <BookStatistics />
            </ProtectedRoute>
          } />

          {/* Settings */}
          <Route path="change-password" element={<ChangePassword />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ToastProvider>
  )
}

export default App
