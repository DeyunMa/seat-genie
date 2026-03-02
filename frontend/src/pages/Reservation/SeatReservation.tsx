import { useState, useMemo, ChangeEvent } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { useDataStore } from '../../stores/dataStore'
import { useDataLoader } from '../../hooks/useDataLoader'
import { useToast } from '../../components/common/Toast'
import type { Room, Seat, SeatReservation as SeatReservationType } from '../../types'
import './Reservation.css'

function SeatReservation() {
    const { user } = useAuthStore()
    const { rooms, seats, seatReservations, loadAllData, createReservation } = useDataStore()
    const { addToast } = useToast()
    useDataLoader()

    const [selectedRoom, setSelectedRoom] = useState<number | null>(null)
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
    const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null)
    const [startTime, setStartTime] = useState<string>('09:00')
    const [endTime, setEndTime] = useState<string>('12:00')

    const activeRooms = rooms.filter((r: Room) => r.activeStatus === 'Y')
    const roomSeats = selectedRoom
        ? seats.filter((s: Seat) => s.roomId === selectedRoom && s.activeStatus === 'Y' && s.status === 'available')
        : []

    const selectedRoomInfo = activeRooms.find((r: Room) => r.id === selectedRoom)

    const activeReservationsMap = useMemo(() => {
        const map = new Map<number, SeatReservationType[]>()
        seatReservations.forEach((r: SeatReservationType) => {
            if (r.date === selectedDate && r.status === 'active') {
                if (!map.has(r.seatId)) {
                    map.set(r.seatId, [])
                }
                map.get(r.seatId)!.push(r)
            }
        })
        return map
    }, [seatReservations, selectedDate])

    const getSeatStatus = (seatId: number): string => {
        return activeReservationsMap.has(seatId) ? 'reserved' : 'available'
    }

    const getSeatReservations = (seatId: number): SeatReservationType[] => {
        return activeReservationsMap.get(seatId) || []
    }

    const timeSlots: string[] = [
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
                userId: user!.id,
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
            addToast((error as Error).message || '预约失败', 'error')
        }
    }

    const getMinDate = (): string => {
        return new Date().toISOString().split('T')[0]
    }

    const getMaxDate = (): string => {
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
                                onChange={(e: ChangeEvent<HTMLInputElement>) => setSelectedDate(e.target.value)}
                            />
                        </div>

                        <div className="filter-group">
                            <label>选择房间</label>
                            <select
                                value={selectedRoom ?? ''}
                                onChange={(e: ChangeEvent<HTMLSelectElement>) => { setSelectedRoom(e.target.value ? Number(e.target.value) : null); setSelectedSeat(null); }}
                            >
                                <option value="">请选择房间</option>
                                {activeRooms.map((room: Room) => (
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
                                <select value={startTime} onChange={(e: ChangeEvent<HTMLSelectElement>) => setStartTime(e.target.value)}>
                                    {timeSlots.map(time => (
                                        <option key={time} value={time}>{time}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="filter-group">
                                <label>结束时间</label>
                                <select value={endTime} onChange={(e: ChangeEvent<HTMLSelectElement>) => setEndTime(e.target.value)}>
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
                                <span className="legend-item"><span className="dot maintenance"></span> 维护中</span>
                            </div>

                            <div className="seat-map-container">
                                <div className="room-front-indicator">
                                    <span>讲台 / 前方</span>
                                </div>
                                <div
                                    className="seat-map-grid"
                                    style={{
                                        gridTemplateColumns: `repeat(${Math.max(...roomSeats.map((s: Seat) => (s.positionX ?? 0) + 1), 3)}, 1fr)`,
                                    }}
                                >
                                    {roomSeats.map((seat: Seat) => {
                                        const status = getSeatStatus(seat.id)
                                        const isSelected = selectedSeat?.id === seat.id
                                        const reservations = getSeatReservations(seat.id)
                                        const isClickable = status === 'available' || isSelected

                                        return (
                                            <div
                                                key={seat.id}
                                                className={`seat-map-item ${status} ${isSelected ? 'selected' : ''}`}
                                                style={{
                                                    gridColumn: (seat.positionX ?? 0) + 1,
                                                    gridRow: (seat.positionY ?? 0) + 1,
                                                }}
                                                onClick={() => isClickable ? setSelectedSeat(isSelected ? null : seat) : undefined}
                                                title={reservations.length > 0 ? `已预约：${reservations.map(r => `${String(r.startTime).replace(/[<>&"']/g, '')}-${String(r.endTime).replace(/[<>&"']/g, '')}`).join(', ')}` : '可预约'}
                                            >
                                                <div className="seat-visual">
                                                    <div className="seat-desk" />
                                                    <div className="seat-chair" />
                                                </div>
                                                <span className="seat-label">{seat.seatNumber}</span>
                                            </div>
                                        )
                                    })}
                                </div>
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
