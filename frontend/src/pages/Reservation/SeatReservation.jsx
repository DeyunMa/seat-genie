import { useState, useEffect } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { useDataStore } from '../../stores/dataStore'
import { useToast } from '../../components/common/Toast'
import './Reservation.css'

function SeatReservation() {
    const { user } = useAuthStore()
    const { rooms, seats, seatReservations, loadAllData, createReservation } = useDataStore()
    const { addToast } = useToast()

    const [selectedRoom, setSelectedRoom] = useState('')
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
    const [selectedSeat, setSelectedSeat] = useState(null)
    const [startTime, setStartTime] = useState('09:00')
    const [endTime, setEndTime] = useState('12:00')

    useEffect(() => {
        loadAllData()
    }, [loadAllData])

    const activeRooms = rooms.filter(r => r.activeStatus === 'Y')
    const roomSeats = selectedRoom
        ? seats.filter(s => s.roomId === selectedRoom && s.activeStatus === 'Y' && s.status === 'available')
        : []

    const selectedRoomInfo = activeRooms.find(r => r.id === selectedRoom)

    const getSeatStatus = (seatId) => {
        const reservations = seatReservations.filter(r =>
            r.seatId === seatId &&
            r.date === selectedDate &&
            r.status === 'active'
        )
        return reservations.length > 0 ? 'reserved' : 'available'
    }

    const getSeatReservations = (seatId) => {
        return seatReservations.filter(r =>
            r.seatId === seatId &&
            r.date === selectedDate &&
            r.status === 'active'
        )
    }

    const timeSlots = [
        '08:00', '09:00', '10:00', '11:00', '12:00',
        '13:00', '14:00', '15:00', '16:00', '17:00',
        '18:00', '19:00', '20:00', '21:00'
    ]

    const handleSubmit = async () => {
        if (!selectedSeat) {
            addToast('请选择座位', 'warning')
            return
        }

        if (startTime >= endTime) {
            addToast('结束时间必须晚于开始时间', 'warning')
            return
        }

        try {
            const result = await createReservation({
                userId: user.id,
                seatId: selectedSeat.id,
                date: selectedDate,
                startTime,
                endTime
            })

            if (result.success) {
                addToast('预约成功！', 'success')
                setSelectedSeat(null)
                await loadAllData()
            } else {
                addToast(result.error, 'error')
            }
        } catch (error) {
            addToast(error.message || '预约失败', 'error')
        }
    }

    const getMinDate = () => {
        return new Date().toISOString().split('T')[0]
    }

    const getMaxDate = () => {
        const max = new Date()
        max.setDate(max.getDate() + 7)
        return max.toISOString().split('T')[0]
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">座位预约</h1>
            </div>

            <div className="reservation-layout">
                <div className="reservation-filters">
                    <div className="filter-card">
                        <h3>选择条件</h3>

                        <div className="filter-group">
                            <label>选择日期</label>
                            <input
                                type="date"
                                value={selectedDate}
                                min={getMinDate()}
                                max={getMaxDate()}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>

                        <div className="filter-group">
                            <label>选择房间</label>
                            <select
                                value={selectedRoom}
                                onChange={(e) => { setSelectedRoom(e.target.value); setSelectedSeat(null); }}
                            >
                                <option value="">请选择房间</option>
                                {activeRooms.map(room => (
                                    <option key={room.id} value={room.id}>
                                        {room.name} ({room.floor}楼)
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedRoomInfo && (
                            <div className="room-info">
                                <p>开放时间：{selectedRoomInfo.openTime} - {selectedRoomInfo.closeTime}</p>
                                <p>总座位数：{roomSeats.length}</p>
                            </div>
                        )}
                    </div>

                    {selectedSeat && (
                        <div className="filter-card booking-card">
                            <h3>预约信息</h3>
                            <div className="booking-info">
                                <p><strong>座位：</strong>{selectedSeat.seatNumber}</p>
                                <p><strong>日期：</strong>{selectedDate}</p>
                            </div>

                            <div className="filter-group">
                                <label>开始时间</label>
                                <select value={startTime} onChange={(e) => setStartTime(e.target.value)}>
                                    {timeSlots.map(time => (
                                        <option key={time} value={time}>{time}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>结束时间</label>
                                <select value={endTime} onChange={(e) => setEndTime(e.target.value)}>
                                    {timeSlots.map(time => (
                                        <option key={time} value={time}>{time}</option>
                                    ))}
                                </select>
                            </div>

                            <button className="btn btn-primary btn-lg" onClick={handleSubmit}>
                                确认预约
                            </button>
                        </div>
                    )}
                </div>

                <div className="seat-selection">
                    {!selectedRoom ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">🪑</div>
                            <p>请先选择房间</p>
                        </div>
                    ) : (
                        <>
                            <div className="seat-legend">
                                <span className="legend-item"><span className="dot available"></span> 可预约</span>
                                <span className="legend-item"><span className="dot reserved"></span> 已预约</span>
                                <span className="legend-item"><span className="dot selected"></span> 已选择</span>
                            </div>

                            <div className="seat-map">
                                {roomSeats.map(seat => {
                                    const status = getSeatStatus(seat.id)
                                    const isSelected = selectedSeat?.id === seat.id
                                    const reservations = getSeatReservations(seat.id)

                                    return (
                                        <div
                                            key={seat.id}
                                            className={`seat-item ${status} ${isSelected ? 'selected' : ''}`}
                                            onClick={() => status === 'available' || isSelected ? setSelectedSeat(isSelected ? null : seat) : null}
                                            title={reservations.length > 0 ? `已预约：${reservations.map(r => `${r.startTime}-${r.endTime}`).join(', ')}` : '可预约'}
                                        >
                                            <span className="seat-icon">🪑</span>
                                            <span className="seat-label">{seat.seatNumber}</span>
                                        </div>
                                    )
                                })}
                            </div>

                            {roomSeats.length === 0 && (
                                <div className="empty-state">
                                    <p>该房间暂无可用座位</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default SeatReservation
