import { useState, useEffect, useMemo } from 'react'
import { useDataStore } from '../../stores/dataStore'
import { useToast } from '../../components/common/Toast'
import Modal, { ConfirmModal } from '../../components/common/Modal'
import '../UserManagement/UserManagement.css'
import './SeatManagement.css'

function SeatList() {
    const { rooms, seats, loadAllData, addSeat, updateSeat, deleteSeat } = useDataStore()
    const { addToast } = useToast()
    const [selectedRoom, setSelectedRoom] = useState('all')
    const [statusFilter, setStatusFilter] = useState('all')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [editingSeat, setEditingSeat] = useState(null)
    const [selectedSeatId, setSelectedSeatId] = useState(null)

    useEffect(() => {
        loadAllData()
    }, [loadAllData])

    const activeRooms = rooms.filter(r => r.activeStatus === 'Y')
    const activeSeats = seats.filter(s => s.activeStatus === 'Y')

    const filteredSeats = activeSeats.filter(seat => {
        const matchesRoom = selectedRoom === 'all' || seat.roomId === selectedRoom
        const matchesStatus = statusFilter === 'all' || seat.status === statusFilter
        return matchesRoom && matchesStatus
    })

    // Create a map for O(1) room name lookup
    const roomNameMap = useMemo(() => {
        return activeRooms.reduce((acc, room) => {
            acc[room.id] = room.name
            return acc
        }, {})
    }, [activeRooms])

    const getRoomName = (roomId) => {
        return roomNameMap[roomId] || '未知房间'
    }

    const statusLabels = {
        available: '可用',
        occupied: '使用中',
        maintenance: '维护中'
    }

    const statusColors = {
        available: 'success',
        occupied: 'warning',
        maintenance: 'error'
    }

    const handleOpenModal = (seat = null) => {
        setEditingSeat(seat)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingSeat(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        const seatData = {
            roomId: parseInt(formData.get('roomId')),
            seatNumber: formData.get('seatNumber'),
            status: formData.get('status')
        }

        try {
            if (editingSeat) {
                await updateSeat(editingSeat.id, seatData)
                addToast('座位信息已更新', 'success')
            } else {
                await addSeat(seatData)
                addToast('座位创建成功', 'success')
            }
            await loadAllData()
            handleCloseModal()
        } catch (error) {
            addToast(error.message || '操作失败', 'error')
        }
    }

    const handleDelete = async () => {
        if (selectedSeatId) {
            try {
                await deleteSeat(selectedSeatId)
                await loadAllData()
                addToast('座位已删除', 'success')
            } catch (error) {
                addToast(error.message || '删除失败', 'error')
            }
            setIsDeleteModalOpen(false)
            setSelectedSeatId(null)
        }
    }

    const handleStatusChange = async (seatId, newStatus) => {
        try {
            await updateSeat(seatId, { status: newStatus })
            await loadAllData()
            addToast(`座位状态已更新为${statusLabels[newStatus]}`, 'success')
        } catch (error) {
            addToast(error.message || '状态更新失败', 'error')
        }
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">座位管理</h1>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    <span>➕</span> 新增座位
                </button>
            </div>

            <div className="filter-bar">
                <div className="filter-group">
                    <select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)}>
                        <option value="all">全部房间</option>
                        {activeRooms.map(room => (
                            <option key={room.id} value={room.id}>{room.name}</option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="all">全部状态</option>
                        <option value="available">可用</option>
                        <option value="occupied">使用中</option>
                        <option value="maintenance">维护中</option>
                    </select>
                </div>
                <div className="filter-stats">
                    共 {filteredSeats.length} 个座位
                </div>
            </div>

            <div className="seat-grid">
                {filteredSeats.map(seat => (
                    <div key={seat.id} className={`seat-card seat-${seat.status}`}>
                        <div className="seat-number">{seat.seatNumber}</div>
                        <div className="seat-room">{getRoomName(seat.roomId)}</div>
                        <div className={`seat-status badge badge-${statusColors[seat.status]}`}>
                            {statusLabels[seat.status]}
                        </div>
                        <div className="seat-actions">
                            <select
                                value={seat.status}
                                onChange={(e) => handleStatusChange(seat.id, e.target.value)}
                                className="status-select"
                            >
                                <option value="available">可用</option>
                                <option value="occupied">使用中</option>
                                <option value="maintenance">维护中</option>
                            </select>
                            <button
                                className="btn btn-sm btn-icon btn-danger"
                                onClick={() => { setSelectedSeatId(seat.id); setIsDeleteModalOpen(true); }}
                                title="删除"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredSeats.length === 0 && (
                <div className="empty-state">
                    <div className="empty-state-icon">🪑</div>
                    <p>暂无座位数据</p>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingSeat ? '编辑座位' : '新增座位'}>
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label>所属房间 *</label>
                            <select name="roomId" defaultValue={editingSeat?.roomId} required>
                                <option value="">请选择房间</option>
                                {activeRooms.map(room => (
                                    <option key={room.id} value={room.id}>{room.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>座位编号 *</label>
                            <input type="text" name="seatNumber" defaultValue={editingSeat?.seatNumber} required />
                        </div>
                        <div className="form-group">
                            <label>状态 *</label>
                            <select name="status" defaultValue={editingSeat?.status || 'available'} required>
                                <option value="available">可用</option>
                                <option value="occupied">使用中</option>
                                <option value="maintenance">维护中</option>
                            </select>
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>取消</button>
                        <button type="submit" className="btn btn-primary">{editingSeat ? '保存' : '创建'}</button>
                    </div>
                </form>
            </Modal>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="确认删除"
                message="确定要删除该座位吗？此操作不可撤销。"
                confirmText="删除"
                danger
            />
        </div>
    )
}

export default SeatList
