import { useState, FormEvent } from 'react'
import { useDataStore } from '../../stores/dataStore'
import { useDataLoader } from '../../hooks/useDataLoader'
import { useToast } from '../../components/common/Toast'
import Modal, { ConfirmModal } from '../../components/common/Modal'
import type { Room } from '../../types'
import '../UserManagement/UserManagement.css'

function RoomManagement() {
    const { rooms, loadAllData, addRoom, updateRoom, deleteRoom } = useDataStore()
    const { addToast } = useToast()
    useDataLoader()
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false)
    const [editingRoom, setEditingRoom] = useState<Room | null>(null)
    const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null)

    const activeRooms = rooms.filter((r: Room) => r.activeStatus === 'Y')

    const handleOpenModal = (room: Room | null = null) => {
        setEditingRoom(room)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingRoom(null)
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const roomData = {
            name: formData.get('name') as string,
            floor: parseInt(formData.get('floor') as string),
            capacity: parseInt(formData.get('capacity') as string),
            openTime: formData.get('openTime') as string,
            closeTime: formData.get('closeTime') as string
        }

        try {
            if (editingRoom) {
                await updateRoom(editingRoom.id, roomData)
                addToast('房间信息已更新', 'success')
            } else {
                await addRoom(roomData)
                addToast('房间创建成功', 'success')
            }
            await loadAllData()
            handleCloseModal()
        } catch (error) {
            addToast((error as Error).message || '操作失败', 'error')
        }
    }

    const handleDelete = async () => {
        if (selectedRoomId) {
            try {
                await deleteRoom(selectedRoomId)
                await loadAllData()
                addToast('房间已删除', 'success')
            } catch (error) {
                addToast((error as Error).message || '删除失败', 'error')
            }
            setIsDeleteModalOpen(false)
            setSelectedRoomId(null)
        }
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">房间管理</h1>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    <span>➕</span> 新增房间
                </button>
            </div>

            <div className="card-grid">
                {activeRooms.map((room: Room) => (
                    <div key={room.id} className="room-card">
                        <div className="room-header">
                            <h3 className="room-name">{room.name}</h3>
                            <span className="room-floor">{room.floor}楼</span>
                        </div>
                        <div className="room-info">
                            <div className="info-item">
                                <span className="info-label">容量</span>
                                <span className="info-value">{room.capacity} 座</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label">开放时间</span>
                                <span className="info-value">{room.openTime} - {room.closeTime}</span>
                            </div>
                        </div>
                        <div className="room-actions">
                            <button className="btn btn-sm btn-secondary" onClick={() => handleOpenModal(room)}>
                                编辑
                            </button>
                            <button
                                className="btn btn-sm btn-danger"
                                onClick={() => { setSelectedRoomId(room.id); setIsDeleteModalOpen(true); }}
                            >
                                删除
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {activeRooms.length === 0 && (
                <div className="empty-state">
                    <div className="empty-state-icon">🏠</div>
                    <p>暂无房间数据</p>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingRoom ? '编辑房间' : '新增房间'}>
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label>房间名称 *</label>
                            <input type="text" name="name" defaultValue={editingRoom?.name} required />
                        </div>
                        <div className="form-group">
                            <label>楼层 *</label>
                            <input type="number" name="floor" defaultValue={editingRoom?.floor || 1} min="1" required />
                        </div>
                        <div className="form-group">
                            <label>容量 *</label>
                            <input type="number" name="capacity" defaultValue={editingRoom?.capacity || 50} min="1" required />
                        </div>
                        <div className="form-group">
                            <label>开放时间 *</label>
                            <input type="time" name="openTime" defaultValue={editingRoom?.openTime || '08:00'} required />
                        </div>
                        <div className="form-group">
                            <label>关闭时间 *</label>
                            <input type="time" name="closeTime" defaultValue={editingRoom?.closeTime || '22:00'} required />
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>取消</button>
                        <button type="submit" className="btn btn-primary">{editingRoom ? '保存' : '创建'}</button>
                    </div>
                </form>
            </Modal>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="确认删除"
                message="确定要删除该房间吗？删除后，该房间下的所有座位也将被删除。"
                confirmText="删除"
                danger
            />
        </div>
    )
}

export default RoomManagement
