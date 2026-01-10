import { useState, useEffect } from 'react'
import { useDataStore } from '../../stores/dataStore'
import { useToast } from '../../components/common/Toast'
import Modal, { ConfirmModal } from '../../components/common/Modal'
import './UserManagement.css'

function UserList() {
    const { users, loadAllData, addUser, updateUser, deleteUser, resetUserPassword } = useDataStore()
    const { addToast } = useToast()
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState('all')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [isResetModalOpen, setIsResetModalOpen] = useState(false)
    const [editingUser, setEditingUser] = useState(null)
    const [selectedUserId, setSelectedUserId] = useState(null)

    useEffect(() => {
        loadAllData()
    }, [])

    const activeUsers = users.filter(u => u.activeStatus === 'Y')

    const filteredUsers = activeUsers.filter(user => {
        const matchesSearch =
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.username.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase())
        const matchesRole = roleFilter === 'all' || user.role === roleFilter
        return matchesSearch && matchesRole
    })

    const roleLabels = {
        student: '学生',
        staff: '工作人员',
        admin: '管理员'
    }

    const handleOpenModal = (user = null) => {
        setEditingUser(user)
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
        setEditingUser(null)
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        const userData = {
            username: formData.get('username'),
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            role: formData.get('role'),
            studentId: formData.get('studentId') || null
        }

        if (editingUser) {
            updateUser(editingUser.id, userData)
            addToast('用户信息已更新', 'success')
        } else {
            userData.password = '123456' // Default password
            addUser(userData)
            addToast('用户创建成功，默认密码为 123456', 'success')
        }

        loadAllData()
        handleCloseModal()
    }

    const handleDelete = () => {
        if (selectedUserId) {
            deleteUser(selectedUserId)
            loadAllData()
            addToast('用户已删除', 'success')
            setIsDeleteModalOpen(false)
            setSelectedUserId(null)
        }
    }

    const handleResetPassword = () => {
        if (selectedUserId) {
            resetUserPassword(selectedUserId)
            addToast('密码已重置为 123456', 'success')
            setIsResetModalOpen(false)
            setSelectedUserId(null)
        }
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">用户管理</h1>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    <span>➕</span> 新增用户
                </button>
            </div>

            <div className="filter-bar">
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="搜索用户名、姓名或邮箱..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                        <option value="all">全部角色</option>
                        <option value="student">学生</option>
                        <option value="staff">工作人员</option>
                        <option value="admin">管理员</option>
                    </select>
                </div>
            </div>

            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>用户名</th>
                            <th>姓名</th>
                            <th>角色</th>
                            <th>学号</th>
                            <th>邮箱</th>
                            <th>电话</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td><strong>{user.username}</strong></td>
                                <td>{user.name}</td>
                                <td>
                                    <span className={`badge badge-${user.role}`}>
                                        {roleLabels[user.role]}
                                    </span>
                                </td>
                                <td>{user.studentId || '-'}</td>
                                <td>{user.email}</td>
                                <td>{user.phone}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="btn btn-sm btn-secondary"
                                            onClick={() => handleOpenModal(user)}
                                            title="编辑"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="btn btn-sm btn-secondary"
                                            onClick={() => { setSelectedUserId(user.id); setIsResetModalOpen(true); }}
                                            title="重置密码"
                                        >
                                            🔑
                                        </button>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => { setSelectedUserId(user.id); setIsDeleteModalOpen(true); }}
                                            title="删除"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredUsers.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-state-icon">👥</div>
                        <p>没有找到用户</p>
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingUser ? '编辑用户' : '新增用户'}>
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label>用户名 *</label>
                            <input
                                type="text"
                                name="username"
                                defaultValue={editingUser?.username}
                                required
                                disabled={!!editingUser}
                            />
                        </div>
                        <div className="form-group">
                            <label>姓名 *</label>
                            <input type="text" name="name" defaultValue={editingUser?.name} required />
                        </div>
                        <div className="form-group">
                            <label>角色 *</label>
                            <select name="role" defaultValue={editingUser?.role || 'student'} required>
                                <option value="student">学生</option>
                                <option value="staff">工作人员</option>
                                <option value="admin">管理员</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>学号</label>
                            <input type="text" name="studentId" defaultValue={editingUser?.studentId} />
                        </div>
                        <div className="form-group">
                            <label>邮箱 *</label>
                            <input type="email" name="email" defaultValue={editingUser?.email} required />
                        </div>
                        <div className="form-group">
                            <label>电话 *</label>
                            <input type="tel" name="phone" defaultValue={editingUser?.phone} required />
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>取消</button>
                        <button type="submit" className="btn btn-primary">
                            {editingUser ? '保存' : '创建'}
                        </button>
                    </div>
                </form>
            </Modal>

            <ConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="确认删除"
                message="确定要删除该用户吗？此操作不可撤销。"
                confirmText="删除"
                danger
            />

            <ConfirmModal
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
                onConfirm={handleResetPassword}
                title="重置密码"
                message="确定要重置该用户的密码吗？密码将被重置为 123456。"
                confirmText="重置"
            />
        </div>
    )
}

export default UserList
