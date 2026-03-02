import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import './Sidebar.css'

interface MenuItem {
    path: string
    label: string
    icon: string
}

interface MenuGroup {
    title: string
    items: MenuItem[]
}

type RoleKey = 'student' | 'staff' | 'admin'

const menuConfig: Record<RoleKey, MenuGroup[]> = {
    student: [
        {
            title: '首页',
            items: [
                { path: '/dashboard', label: '仪表盘', icon: '📊' }
            ]
        },
        {
            title: '座位服务',
            items: [
                { path: '/reserve-seat', label: '座位预约', icon: '🪑' },
                { path: '/my-reservations', label: '我的预约', icon: '📅' }
            ]
        },
        {
            title: '图书服务',
            items: [
                { path: '/my-borrowings', label: '我的借阅', icon: '📚' }
            ]
        },
        {
            title: '其他',
            items: [
                { path: '/notifications', label: '消息通知', icon: '🔔' },
                { path: '/change-password', label: '修改密码', icon: '🔐' }
            ]
        }
    ],
    staff: [
        {
            title: '首页',
            items: [
                { path: '/dashboard', label: '仪表盘', icon: '📊' }
            ]
        },
        {
            title: '资源管理',
            items: [
                { path: '/rooms', label: '房间管理', icon: '🏠' },
                { path: '/seats', label: '座位管理', icon: '🪑' },
                { path: '/books', label: '图书管理', icon: '📖' }
            ]
        },
        {
            title: '业务处理',
            items: [
                { path: '/borrow-management', label: '借还登记', icon: '🔄' },
                { path: '/notifications', label: '异常处理', icon: '⚠️' }
            ]
        },
        {
            title: '统计分析',
            items: [
                { path: '/seat-statistics', label: '座位统计', icon: '📈' },
                { path: '/book-statistics', label: '图书统计', icon: '📉' }
            ]
        },
        {
            title: '设置',
            items: [
                { path: '/change-password', label: '修改密码', icon: '🔐' }
            ]
        }
    ],
    admin: [
        {
            title: '首页',
            items: [
                { path: '/dashboard', label: '仪表盘', icon: '📊' }
            ]
        },
        {
            title: '用户管理',
            items: [
                { path: '/users', label: '用户列表', icon: '👥' }
            ]
        },
        {
            title: '资源管理',
            items: [
                { path: '/rooms', label: '房间管理', icon: '🏠' },
                { path: '/seats', label: '座位管理', icon: '🪑' },
                { path: '/books', label: '图书管理', icon: '📖' }
            ]
        },
        {
            title: '业务处理',
            items: [
                { path: '/borrow-management', label: '借还登记', icon: '🔄' },
                { path: '/notifications', label: '异常处理', icon: '⚠️' }
            ]
        },
        {
            title: '统计分析',
            items: [
                { path: '/seat-statistics', label: '座位统计', icon: '📈' },
                { path: '/book-statistics', label: '图书统计', icon: '📉' }
            ]
        },
        {
            title: '系统设置',
            items: [
                { path: '/change-password', label: '修改密码', icon: '🔐' }
            ]
        }
    ]
}

const roleLabels: Record<RoleKey, string> = {
    student: '学生',
    staff: '工作人员',
    admin: '管理员'
}

function Sidebar(): React.ReactNode {
    const { user } = useAuthStore()

    const menus = menuConfig[(user?.role as RoleKey)] || menuConfig.student

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <span className="logo-icon">📚</span>
                    <span className="logo-text">Seat Genie</span>
                </div>
                <div className="sidebar-user">
                    <div className="user-avatar">{user?.name?.charAt(0) || 'U'}</div>
                    <div className="user-info">
                        <div className="user-name">{user?.name || '用户'}</div>
                        <div className="user-role">{roleLabels[(user?.role as RoleKey)] || '未知'}</div>
                    </div>
                </div>
            </div>

            <nav className="sidebar-nav">
                {menus.map((group, idx) => (
                    <div key={idx} className="nav-group">
                        <div className="nav-group-title">{group.title}</div>
                        <ul className="nav-list">
                            {group.items.map((item) => (
                                <li key={item.path}>
                                    <NavLink
                                        to={item.path}
                                        className={({ isActive }: { isActive: boolean }) =>
                                            `nav-link ${isActive ? 'active' : ''}`
                                        }
                                    >
                                        <span className="nav-icon">{item.icon}</span>
                                        <span className="nav-label">{item.label}</span>
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>
        </aside>
    )
}

export default Sidebar
