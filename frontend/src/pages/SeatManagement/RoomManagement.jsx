import { useState, useEffect } from 'react'
import { useDataStore } from '../../stores/dataStore'
import { useToast } from '../../components/common/Toast'
import Modal, { ConfirmModal } from '../../components/common/Modal'
import '../UserManagement/UserManagement.css'

function RoomManagement() {
    const { rooms, loadAllData, addRoom, updateRoom, deleteRoom } = useDataStore()
    const { addToast } = useToast()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [editingRoom, setEditingRoom] = useState(null)
    const [selectedRoomId, setSelectedRoomId] = useState(null)

    useEffect(() => {
        loadAllData()
    }, [])

    const activeRooms = rooms.filter(r => r.activeStatus === 'Y')

    const handleOpenModal = (room = null) => {
        setEditingRoom(room)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingRoom(null)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        const roomData = {
            name: formData.get('name'),
            floor: parseInt(formData.get('floor')),
            capacity: parseInt(formData.get('capacity')),
            openTime: formData.get('openTime'),
            closeTime: formData.get('closeTime')
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
            addToast(error.message || '操作失败', 'error')
        }
    }

    const handleDelete = async () => {
        if (selectedRoomId) {
            try {
                await deleteRoom(selectedRoomId)
                await loadAllData()
                addToast('房间已删除', 'success')
            } catch (error) {
                addToast(error.message || '删除失败', 'error')
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
                {activeRooms.map(room => (
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
