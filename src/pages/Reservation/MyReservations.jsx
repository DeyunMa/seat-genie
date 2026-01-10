import { useState, useEffect } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { useDataStore } from '../../stores/dataStore'
import { useToast } from '../../components/common/Toast'
import { ConfirmModal } from '../../components/common/Modal'
import '../UserManagement/UserManagement.css'
import './Reservation.css'

function MyReservations() {
    const { user } = useAuthStore()
    const { rooms, seats, seatReservations, loadAllData, cancelReservation } = useDataStore()
    const { addToast } = useToast()
    const [activeTab, setActiveTab] = useState('active')
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
    const [selectedReservationId, setSelectedReservationId] = useState(null)

    useEffect(() => {
        loadAllData()
    }, [])

    const myReservations = seatReservations.filter(r => r.userId === user?.id)
    const today = new Date().toISOString().split('T')[0]
    const now = new Date()
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    const activeReservations = myReservations.filter(r =>
        r.status === 'active' &&
        (r.date > today || (r.date === today && r.endTime > currentTime))
    )

    const historyReservations = myReservations.filter(r =>
        r.status !== 'active' ||
        r.date < today ||
        (r.date === today && r.endTime <= currentTime)
    )

    const getSeatInfo = (seatId) => seats.find(s => s.id === seatId) || {}
    const getRoomInfo = (roomId) => rooms.find(r => r.id === roomId) || {}

    const handleCancel = () => {
        if (selectedReservationId) {
            cancelReservation(selectedReservationId)
            loadAllData()
            addToast('预约已取消', 'success')
            setIsCancelModalOpen(false)
            setSelectedReservationId(null)
        }
    }

    const getStatusBadge = (reservation) => {
        if (reservation.status === 'cancelled') {
            return <span className="badge badge-error">已取消</span>
        }
        if (reservation.status === 'violated') {
            return <span className="badge badge-error">违规</span>
        }
        if (reservation.date < today || (reservation.date === today && reservation.endTime <= currentTime)) {
            return <span className="badge badge-info">已结束</span>
        }
        if (reservation.date === today && reservation.startTime <= currentTime && reservation.endTime > currentTime) {
            return <span className="badge badge-success">进行中</span>
        }
        return <span className="badge badge-warning">待使用</span>
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">我的预约</h1>
                <a href="/reserve-seat" className="btn btn-primary">
                    <span>➕</span> 新增预约
                </a>
            </div>

            <div className="tab-bar">
                <button
                    className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                    onClick={() => setActiveTab('active')}
                >
                    当前预约 ({activeReservations.length})
                </button>
                <button
                    className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    历史记录 ({historyReservations.length})
                </button>
            </div>

            {activeTab === 'active' && (
                <div className="reservation-list">
                    {activeReservations.map(reservation => {
                        const seat = getSeatInfo(reservation.seatId)
                        const room = getRoomInfo(seat.roomId)

                        return (
                            <div key={reservation.id} className="reservation-card">
                                <div className="reservation-icon">🪑</div>
                                <div className="reservation-details">
                                    <h3>{room.name} - {seat.seatNumber}</h3>
                                    <div className="reservation-meta">
                                        <span>📅 {reservation.date}</span>
                                        <span>⏰ {reservation.startTime} - {reservation.endTime}</span>
                                    </div>
                                </div>
                                <div className="reservation-actions">
                                    {getStatusBadge(reservation)}
                                    {reservation.status === 'active' && reservation.date >= today && (
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => { setSelectedReservationId(reservation.id); setIsCancelModalOpen(true); }}
                                        >
                                            取消
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                    {activeReservations.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-state-icon">📅</div>
                            <p>暂无预约</p>
                            <a href="/reserve-seat" className="btn btn-primary">立即预约</a>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'history' && (
                <div className="data-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>房间</th>
                                <th>座位</th>
                                <th>日期</th>
                                <th>时段</th>
                                <th>状态</th>
                            </tr>
                        </thead>
                        <tbody>
                            {historyReservations.map(reservation => {
                                const seat = getSeatInfo(reservation.seatId)
                                const room = getRoomInfo(seat.roomId)

                                return (
                                    <tr key={reservation.id}>
                                        <td>{room.name}</td>
                                        <td><strong>{seat.seatNumber}</strong></td>
                                        <td>{reservation.date}</td>
                                        <td>{reservation.startTime} - {reservation.endTime}</td>
                                        <td>{getStatusBadge(reservation)}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    {historyReservations.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-state-icon">📅</div>
                            <p>暂无历史记录</p>
                        </div>
                    )}
                </div>
            )}

            <ConfirmModal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                onConfirm={handleCancel}
                title="取消预约"
                message="确定要取消该预约吗？取消后座位将被释放。"
                confirmText="取消预约"
                danger
            />
        </div>
    )
}

export default MyReservations
