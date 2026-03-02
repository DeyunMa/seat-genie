import { useState, useEffect, useCallback, FormEvent } from 'react'
import { useToast } from '../../components/common/Toast'
import Modal, { ConfirmModal } from '../../components/common/Modal'
import { listCampuses, createCampus, updateCampus, deleteCampus } from '../../services/campusApi'
import type { Campus } from '../../types'
import '../UserManagement/UserManagement.css'

function CampusManagement() {
    const { addToast } = useToast()
    const [campuses, setCampuses] = useState<Campus[]>([])
    const [loading, setLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [editingCampus, setEditingCampus] = useState<Campus | null>(null)
    const [selectedId, setSelectedId] = useState<number | null>(null)

    const loadCampuses = useCallback(async () => {
        setLoading(true)
        try {
            const data = await listCampuses()
            setCampuses(data)
        } catch (error) {
            addToast((error as Error).message || 'Failed to load campuses', 'error')
        } finally {
            setLoading(false)
        }
    }, [addToast])

    useEffect(() => { loadCampuses() }, [loadCampuses])

    const handleOpenModal = (campus: Campus | null = null) => {
        setEditingCampus(campus)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingCampus(null)
    }

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const payload = {
            name: formData.get('name') as string,
            address: formData.get('address') as string || undefined,
            description: formData.get('description') as string || undefined,
        }

        try {
            if (editingCampus) {
                await updateCampus(editingCampus.id, payload)
                addToast('Campus updated', 'success')
            } else {
                await createCampus(payload)
                addToast('Campus created', 'success')
            }
            await loadCampuses()
            handleCloseModal()
        } catch (error) {
            addToast((error as Error).message || 'Operation failed', 'error')
        }
    }

    const handleDelete = async () => {
        if (selectedId) {
            try {
                await deleteCampus(selectedId)
                await loadCampuses()
                addToast('Campus deleted', 'success')
            } catch (error) {
                addToast((error as Error).message || 'Delete failed', 'error')
            }
            setIsDeleteModalOpen(false)
            setSelectedId(null)
        }
    }

    const activeCampuses = campuses.filter(c => c.activeStatus === 'Y')

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">校区管理</h1>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    <span>➕</span> 新增校区
                </button>
            </div>

            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>校区名称</th>
                            <th>地址</th>
                            <th>描述</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeCampuses.map(campus => (
                            <tr key={campus.id}>
                                <td><strong>{campus.name}</strong></td>
                                <td>{campus.address || '-'}</td>
                                <td>{campus.description || '-'}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button className="btn btn-sm btn-secondary" onClick={() => handleOpenModal(campus)} title="Edit">✏️</button>
                                        <button className="btn btn-sm btn-danger" onClick={() => { setSelectedId(campus.id); setIsDeleteModalOpen(true) }} title="Delete">🗑️</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {loading && <div className="empty-state"><div className="empty-state-icon">⏳</div><p>Loading...</p></div>}
                {!loading && activeCampuses.length === 0 && (
                    <div className="empty-state"><div className="empty-state-icon">🏫</div><p>No campuses found</p></div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingCampus ? '编辑校区' : '新增校区'}>
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label>校区名称 *</label>
                            <input type="text" name="name" defaultValue={editingCampus?.name} required />
                        </div>
                        <div className="form-group">
                            <label>地址</label>
                            <input type="text" name="address" defaultValue={editingCampus?.address ?? ''} />
                        </div>
                        <div className="form-group">
                            <label>描述</label>
                            <input type="text" name="description" defaultValue={editingCampus?.description ?? ''} />
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>取消</button>
                        <button type="submit" className="btn btn-primary">{editingCampus ? '保存' : '创建'}</button>
                    </div>
                </form>
            </Modal>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="确认删除"
                message="确定要删除该校区吗？关联的房间将失去校区信息。"
                confirmText="删除"
                danger
            />
        </div>
    )
}

export default CampusManagement
