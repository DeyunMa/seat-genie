import { useState, useEffect, useMemo } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { useDataStore } from '../../stores/dataStore'
import '../UserManagement/UserManagement.css'
import './Notification.css'

function NotificationCenter() {
    const { user } = useAuthStore()
    const { users, books, seatReservations, bookBorrowings, loadAllData } = useDataStore()
    const [activeTab, setActiveTab] = useState('all')

    useEffect(() => {
        loadAllData()
    }, [loadAllData])

    const isStaffOrAdmin = user?.role === 'staff' || user?.role === 'admin'

    // Generate notifications based on data
    const allNotifications = useMemo(() => {
        const today = new Date().toISOString().split('T')[0]
        const notifications = []

        if (isStaffOrAdmin) {
            // Overdue book notifications for staff
            const overdueBorrowings = bookBorrowings.filter(b =>
                b.status === 'borrowed' && b.dueDate < today
            )
            overdueBorrowings.forEach(b => {
                const borrower = users.find(u => u.id === b.userId)
                const book = books.find(bk => bk.id === b.bookId)
                notifications.push({
                    id: `overdue-${b.id}`,
                    type: 'warning',
                    icon: '⚠️',
                    title: '图书逾期未还',
                    message: `${borrower?.name || '用户'} 借阅的《${book?.title || '图书'}》已逾期，应还日期：${b.dueDate}`,
                    date: b.dueDate,
                    category: 'overdue'
                })
            })

            // Violated reservations
            const violatedReservations = seatReservations.filter(r => r.status === 'violated')
            violatedReservations.forEach(r => {
                const violator = users.find(u => u.id === r.userId)
                notifications.push({
                    id: `violated-${r.id}`,
                    type: 'error',
                    icon: '🚫',
                    title: '违规占座',
                    message: `${violator?.name || '用户'} 在 ${r.date} 的预约存在违规行为`,
                    date: r.date,
                    category: 'violation'
                })
            })
        } else {
            // Student notifications
            const myBorrowings = bookBorrowings.filter(b => b.userId === user?.id)

            // Due soon notifications
            const dueSoon = myBorrowings.filter(b => {
                if (b.status !== 'borrowed') return false
                const dueDate = new Date(b.dueDate)
                const todayDate = new Date(today)
                const diff = Math.ceil((dueDate - todayDate) / (1000 * 60 * 60 * 24))
                return diff >= 0 && diff <= 3
            })

            dueSoon.forEach(b => {
                const book = books.find(bk => bk.id === b.bookId)
                const dueDate = new Date(b.dueDate)
                const todayDate = new Date(today)
                const daysLeft = Math.ceil((dueDate - todayDate) / (1000 * 60 * 60 * 24))

                notifications.push({
                    id: `due-${b.id}`,
                    type: 'warning',
                    icon: '⏰',
                    title: '图书即将到期',
                    message: `您借阅的《${book?.title || '图书'}》将在 ${daysLeft} 天后到期，请及时归还`,
                    date: b.dueDate,
                    category: 'reminder'
                })
            })

            // Overdue notifications for student
            const myOverdue = myBorrowings.filter(b => b.status === 'borrowed' && b.dueDate < today)
            myOverdue.forEach(b => {
                const book = books.find(bk => bk.id === b.bookId)
                notifications.push({
                    id: `my-overdue-${b.id}`,
                    type: 'error',
                    icon: '❗',
                    title: '图书已逾期',
                    message: `您借阅的《${book?.title || '图书'}》已逾期，请尽快归还`,
                    date: b.dueDate,
                    category: 'overdue'
                })
            })

            // Today's reservations reminder
            const todayReservations = seatReservations.filter(r =>
                r.userId === user?.id && r.date === today && r.status === 'active'
            )
            todayReservations.forEach(r => {
                notifications.push({
                    id: `today-${r.id}`,
                    type: 'info',
                    icon: '📅',
                    title: '今日预约提醒',
                    message: `您今天 ${r.startTime}-${r.endTime} 的座位预约即将开始`,
                    date: today,
                    category: 'reminder'
                })
            })
        }

        // Add some system notifications
        notifications.push({
            id: 'sys-1',
            type: 'info',
            icon: '📢',
            title: '系统公告',
            message: '图书馆系统已全面升级，如有问题请联系管理员。',
            date: today,
            category: 'system'
        })

        return notifications.sort((a, b) => new Date(b.date) - new Date(a.date))
    }, [user, users, books, seatReservations, bookBorrowings, isStaffOrAdmin])


    const filteredNotifications = activeTab === 'all'
        ? allNotifications
        : allNotifications.filter(n => n.category === activeTab)

    const getCategoryCount = (category) => {
        return allNotifications.filter(n => n.category === category).length
    }

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">
                    {isStaffOrAdmin ? '异常处理与通知' : '消息通知'}
                </h1>
            </div>

            <div className="notification-layout">
                <div className="notification-sidebar">
                    <div className="sidebar-card">
                        <h4>筛选</h4>
                        <ul className="category-list">
                            <li
                                className={activeTab === 'all' ? 'active' : ''}
                                onClick={() => setActiveTab('all')}
                            >
                                <span>全部消息</span>
                                <span className="count">{allNotifications.length}</span>
                            </li>
                            {isStaffOrAdmin && (
                                <>
                                    <li
                                        className={activeTab === 'overdue' ? 'active' : ''}
                                        onClick={() => setActiveTab('overdue')}
                                    >
                                        <span>逾期未还</span>
                                        <span className="count">{getCategoryCount('overdue')}</span>
                                    </li>
                                    <li
                                        className={activeTab === 'violation' ? 'active' : ''}
                                        onClick={() => setActiveTab('violation')}
                                    >
                                        <span>违规记录</span>
                                        <span className="count">{getCategoryCount('violation')}</span>
                                    </li>
                                </>
                            )}
                            {!isStaffOrAdmin && (
                                <li
                                    className={activeTab === 'reminder' ? 'active' : ''}
                                    onClick={() => setActiveTab('reminder')}
                                >
                                    <span>预约提醒</span>
                                    <span className="count">{getCategoryCount('reminder')}</span>
                                </li>
                            )}
                            <li
                                className={activeTab === 'system' ? 'active' : ''}
                                onClick={() => setActiveTab('system')}
                            >
                                <span>系统公告</span>
                                <span className="count">{getCategoryCount('system')}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="notification-content">
                    {filteredNotifications.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">🔔</div>
                            <p>暂无通知</p>
                        </div>
                    ) : (
                        <div className="notification-list">
                            {filteredNotifications.map(notification => (
                                <div key={notification.id} className={`notification-item ${notification.type}`}>
                                    <div className="notification-icon">{notification.icon}</div>
                                    <div className="notification-body">
                                        <h4>{notification.title}</h4>
                                        <p>{notification.message}</p>
                                        <span className="notification-date">{notification.date}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default NotificationCenter
