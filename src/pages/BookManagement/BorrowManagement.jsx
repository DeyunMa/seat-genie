import { useState, useEffect } from 'react'
import { useDataStore } from '../../stores/dataStore'
import { useToast } from '../../components/common/Toast'
import Modal from '../../components/common/Modal'
import '../UserManagement/UserManagement.css'
import './BookManagement.css'

function BorrowManagement() {
    const { books, users, bookBorrowings, loadAllData, createBorrowing, returnBook } = useDataStore()
    const { addToast } = useToast()
    const [activeTab, setActiveTab] = useState('borrow')
    const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false)
    const [selectedUserId, setSelectedUserId] = useState('')
    const [selectedBookId, setSelectedBookId] = useState('')

    useEffect(() => {
        loadAllData()
    }, [])

    const activeUsers = users.filter(u => u.activeStatus === 'Y' && u.role === 'student')
    const availableBooks = books.filter(b => b.activeStatus === 'Y' && b.status === 'available')
    const activeBorrowings = bookBorrowings.filter(b => b.status === 'borrowed')

    const today = new Date().toISOString().split('T')[0]
    const overdueBorrowings = activeBorrowings.filter(b => b.dueDate < today)
    const normalBorrowings = activeBorrowings.filter(b => b.dueDate >= today)

    const getUserName = (borrowing) => {
        const user = users.find(u => u.id === borrowing.userId)
        return user?.name || borrowing.memberName || '未知用户'
    }

    const getBookTitle = (borrowing) => {
        const book = books.find(b => b.id === borrowing.bookId)
        return book?.title || borrowing.bookTitle || '未知图书'
    }

    const handleBorrow = async () => {
        if (!selectedUserId || !selectedBookId) {
            addToast('请选择用户和图书', 'warning')
            return
        }

        const staffUser = users.find(u => u.role === 'staff' || u.role === 'admin')
        const result = await createBorrowing({
            userId: selectedUserId,
            bookId: selectedBookId,
            handledBy: staffUser?.id
        })

        if (result.success) {
            addToast('借阅登记成功', 'success')
            setIsBorrowModalOpen(false)
            setSelectedUserId('')
            setSelectedBookId('')
            loadAllData()
        } else {
            addToast(result.error, 'error')
        }
    }

    const handleReturn = async (borrowingId) => {
        const staffUser = users.find(u => u.role === 'staff' || u.role === 'admin')
        const result = await returnBook(borrowingId)

        if (result.success) {
            addToast('归还登记成功', 'success')
            loadAllData()
        } else {
            addToast(result.error, 'error')
        }
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">借还登记</h1>
                <button className="btn btn-primary" onClick={() => setIsBorrowModalOpen(true)}>
                    <span>📖</span> 新增借阅
                </button>
            </div>

            <div className="tab-bar">
                <button
                    className={`tab-btn ${activeTab === 'borrow' ? 'active' : ''}`}
                    onClick={() => setActiveTab('borrow')}
                >
                    待归还 ({activeBorrowings.length})
                </button>
                <button
                    className={`tab-btn ${activeTab === 'overdue' ? 'active' : ''}`}
                    onClick={() => setActiveTab('overdue')}
                >
                    逾期 ({overdueBorrowings.length})
                </button>
            </div>

            {activeTab === 'overdue' && overdueBorrowings.length > 0 && (
                <div className="alert-banner">
                    ⚠️ 以下 {overdueBorrowings.length} 条记录已逾期，请及时处理
                </div>
            )}

            <div className="data-table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>借阅人</th>
                            <th>图书</th>
                            <th>借阅日期</th>
                            <th>应还日期</th>
                            <th>状态</th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(activeTab === 'overdue' ? overdueBorrowings : normalBorrowings).map(borrowing => (
                            <tr key={borrowing.id} className={borrowing.dueDate < today ? 'row-overdue' : ''}>
                                <td><strong>{getUserName(borrowing)}</strong></td>
                                <td>{getBookTitle(borrowing)}</td>
                                <td>{borrowing.borrowDate}</td>
                                <td>{borrowing.dueDate}</td>
                                <td>
                                    {borrowing.dueDate < today ? (
                                        <span className="badge badge-error">逾期</span>
                                    ) : (
                                        <span className="badge badge-warning">借阅中</span>
                                    )}
                                </td>
                                <td>
                                    <button
                                        className="btn btn-sm btn-success"
                                        onClick={() => handleReturn(borrowing.id)}
                                    >
                                        归还
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(activeTab === 'overdue' ? overdueBorrowings : normalBorrowings).length === 0 && (
                    <div className="empty-state">
                        <div className="empty-state-icon">📚</div>
                        <p>{activeTab === 'overdue' ? '暂无逾期记录' : '暂无待归还记录'}</p>
                    </div>
                )}
            </div>

            <Modal isOpen={isBorrowModalOpen} onClose={() => setIsBorrowModalOpen(false)} title="新增借阅">
                <div className="modal-form">
                    <div className="form-group">
                        <label>借阅人 *</label>
                        <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
                            <option value="">请选择学生</option>
                            {activeUsers.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.name} ({user.studentId || user.username})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>图书 *</label>
                        <select value={selectedBookId} onChange={(e) => setSelectedBookId(e.target.value)}>
                            <option value="">请选择图书</option>
                            {availableBooks.map(book => (
                                <option key={book.id} value={book.id}>
                                    {book.title} - {book.author}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-info">
                        📅 借阅期限：14天
                    </div>
                    <div className="modal-actions">
                        <button className="btn btn-secondary" onClick={() => setIsBorrowModalOpen(false)}>取消</button>
                        <button className="btn btn-primary" onClick={handleBorrow}>确认借阅</button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default BorrowManagement
