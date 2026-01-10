import { useState, useEffect } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { useDataStore } from '../../stores/dataStore'
import '../UserManagement/UserManagement.css'

function MyBorrowings() {
    const { user } = useAuthStore()
    const { books, bookBorrowings, loadAllData } = useDataStore()
    const [activeTab, setActiveTab] = useState('current')

    useEffect(() => {
        loadAllData()
    }, [])

    const myBorrowings = bookBorrowings.filter(b => b.userId === user?.id)
    const currentBorrowings = myBorrowings.filter(b => b.status === 'borrowed')
    const historyBorrowings = myBorrowings.filter(b => b.status === 'returned')

    const today = new Date().toISOString().split('T')[0]

    const getBookInfo = (bookId) => {
        return books.find(b => b.id === bookId) || {}
    }

    const getDaysRemaining = (dueDate) => {
        const due = new Date(dueDate)
        const now = new Date()
        const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24))
        return diff
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">我的借阅</h1>
            </div>

            <div className="tab-bar">
                <button
                    className={`tab-btn ${activeTab === 'current' ? 'active' : ''}`}
                    onClick={() => setActiveTab('current')}
                >
                    当前借阅 ({currentBorrowings.length})
                </button>
                <button
                    className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    历史记录 ({historyBorrowings.length})
                </button>
            </div>

            {activeTab === 'current' && (
                <div className="borrowing-list">
                    {currentBorrowings.map(borrowing => {
                        const book = getBookInfo(borrowing.bookId)
                        const daysRemaining = getDaysRemaining(borrowing.dueDate)
                        const isOverdue = daysRemaining < 0

                        return (
                            <div key={borrowing.id} className={`borrowing-card ${isOverdue ? 'overdue' : ''}`}>
                                <div className="book-cover">
                                    <span className="book-icon">📖</span>
                                </div>
                                <div className="book-details">
                                    <h3 className="book-title">{book.title}</h3>
                                    <p className="book-author">{book.author}</p>
                                    <div className="book-meta">
                                        <span>📍 {book.location}</span>
                                        <span>📅 借阅日期：{borrowing.borrowDate}</span>
                                    </div>
                                </div>
                                <div className="borrowing-status">
                                    {isOverdue ? (
                                        <div className="status-badge overdue">
                                            <span>⚠️</span>
                                            <span>逾期 {Math.abs(daysRemaining)} 天</span>
                                        </div>
                                    ) : daysRemaining <= 3 ? (
                                        <div className="status-badge warning">
                                            <span>⏰</span>
                                            <span>剩余 {daysRemaining} 天</span>
                                        </div>
                                    ) : (
                                        <div className="status-badge normal">
                                            <span>📆</span>
                                            <span>剩余 {daysRemaining} 天</span>
                                        </div>
                                    )}
                                    <p className="due-date">应还日期：{borrowing.dueDate}</p>
                                </div>
                            </div>
                        )
                    })}
                    {currentBorrowings.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-state-icon">📚</div>
                            <p>暂无借阅记录</p>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'history' && (
                <div className="data-table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>书名</th>
                                <th>作者</th>
                                <th>借阅日期</th>
                                <th>归还日期</th>
                                <th>状态</th>
                            </tr>
                        </thead>
                        <tbody>
                            {historyBorrowings.map(borrowing => {
                                const book = getBookInfo(borrowing.bookId)
                                return (
                                    <tr key={borrowing.id}>
                                        <td><strong>{book.title}</strong></td>
                                        <td>{book.author}</td>
                                        <td>{borrowing.borrowDate}</td>
                                        <td>{borrowing.returnDate}</td>
                                        <td><span className="badge badge-success">已归还</span></td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                    {historyBorrowings.length === 0 && (
                        <div className="empty-state">
                            <div className="empty-state-icon">📚</div>
                            <p>暂无历史记录</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default MyBorrowings
