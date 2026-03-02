import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useDataStore } from '../../stores/dataStore'
import { useDataLoader } from '../../hooks/useDataLoader'
import './Header.css'

function Header(): React.ReactNode {
    const { user, logout } = useAuthStore()
    const { getNotificationCount, unreadCount } = useDataStore()
    const navigate = useNavigate()

    useDataLoader()

    const notificationCount = useMemo(() => getNotificationCount(user), [user, getNotificationCount, unreadCount])


    const handleLogout = (): void => {
        logout()
        navigate('/login')
    }

    const getCurrentTime = (): string => {
        const now = new Date()
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        }
        return now.toLocaleDateString('zh-CN', options)
    }

    return (
        <header className="header">
            <div className="header-left">
                <div className="header-date">{getCurrentTime()}</div>
            </div>

            <div className="header-right">
                <button className="header-btn notification-btn" onClick={() => navigate('/notifications')}>
                    <span className="btn-icon">🔔</span>
                    {notificationCount > 0 && (
                        <span className="notification-badge">{notificationCount}</span>
                    )}
                </button>

                <div className="header-divider"></div>

                <div className="user-dropdown">
                    <button className="user-btn">
                        <div className="user-avatar-sm">{user?.name?.charAt(0) || 'U'}</div>
                        <span className="user-name-sm">{user?.name || '用户'}</span>
                        <span className="dropdown-arrow">▾</span>
                    </button>
                    <div className="dropdown-menu">
                        <button onClick={() => navigate('/change-password')} className="dropdown-item">
                            <span>🔐</span> 修改密码
                        </button>
                        <div className="dropdown-divider"></div>
                        <button onClick={handleLogout} className="dropdown-item logout">
                            <span>🚪</span> 退出登录
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header
