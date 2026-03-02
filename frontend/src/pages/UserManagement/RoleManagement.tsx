import { useState } from 'react'
import type { PermissionSet, RoleName } from '../../types'
import './UserManagement.css'

const defaultPermissions: Record<RoleName, PermissionSet> = {
    student: {
        dashboard: true,
        reserveSeat: true,
        myReservations: true,
        myBorrowings: true,
        notifications: true,
        changePassword: true,
        userManagement: false,
        roleManagement: false,
        roomManagement: false,
        seatManagement: false,
        bookManagement: false,
        borrowManagement: false,
        statistics: false
    },
    staff: {
        dashboard: true,
        reserveSeat: false,
        myReservations: false,
        myBorrowings: false,
        notifications: true,
        changePassword: true,
        userManagement: false,
        roleManagement: false,
        roomManagement: true,
        seatManagement: true,
        bookManagement: true,
        borrowManagement: true,
        statistics: true
    },
    admin: {
        dashboard: true,
        reserveSeat: false,
        myReservations: false,
        myBorrowings: false,
        notifications: true,
        changePassword: true,
        userManagement: true,
        roleManagement: true,
        roomManagement: true,
        seatManagement: true,
        bookManagement: true,
        borrowManagement: true,
        statistics: true
    }
}

const permissionLabels: Record<keyof PermissionSet, string> = {
    dashboard: '仪表盘',
    reserveSeat: '座位预约',
    myReservations: '我的预约',
    myBorrowings: '我的借阅',
    notifications: '消息通知',
    changePassword: '修改密码',
    userManagement: '用户管理',
    roleManagement: '角色管理',
    roomManagement: '房间管理',
    seatManagement: '座位管理',
    bookManagement: '图书管理',
    borrowManagement: '借还登记',
    statistics: '统计分析'
}

const roleLabels: Record<RoleName, string> = {
    student: '学生',
    staff: '工作人员',
    admin: '管理员'
}

interface PermissionGroup {
    title: string
    permissions: (keyof PermissionSet)[]
}

function RoleManagement() {
    const [selectedRole, setSelectedRole] = useState<RoleName>('student')
    const [permissions, setPermissions] = useState<Record<RoleName, PermissionSet>>(defaultPermissions)

    const handlePermissionChange = (permission: keyof PermissionSet) => {
        setPermissions(prev => ({
            ...prev,
            [selectedRole]: {
                ...prev[selectedRole],
                [permission]: !prev[selectedRole][permission]
            }
        }))
    }

    const permissionGroups: PermissionGroup[] = [
        {
            title: '基础功能',
            permissions: ['dashboard', 'notifications', 'changePassword']
        },
        {
            title: '学生服务',
            permissions: ['reserveSeat', 'myReservations', 'myBorrowings']
        },
        {
            title: '资源管理',
            permissions: ['roomManagement', 'seatManagement', 'bookManagement', 'borrowManagement']
        },
        {
            title: '系统管理',
            permissions: ['userManagement', 'roleManagement', 'statistics']
        }
    ]

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">角色权限管理</h1>
            </div>

            <div className="role-management-layout">
                <div className="role-selector">
                    <h3>角色列表</h3>
                    <div className="role-list">
                        {(Object.keys(roleLabels) as RoleName[]).map(role => (
                            <button
                                key={role}
                                className={`role-item ${selectedRole === role ? 'active' : ''}`}
                                onClick={() => setSelectedRole(role)}
                            >
                                <span className="role-icon">
                                    {role === 'student' && '🎓'}
                                    {role === 'staff' && '👔'}
                                    {role === 'admin' && '👑'}
                                </span>
                                <span className="role-name">{roleLabels[role]}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="permission-panel">
                    <div className="panel-header">
                        <h3>{roleLabels[selectedRole]} 权限配置</h3>
                        <p className="panel-description">
                            配置 {roleLabels[selectedRole]} 角色可访问的功能模块
                        </p>
                    </div>

                    <div className="permission-groups">
                        {permissionGroups.map((group, idx) => (
                            <div key={idx} className="permission-group">
                                <h4 className="group-title">{group.title}</h4>
                                <div className="permission-list">
                                    {group.permissions.map(perm => (
                                        <label key={perm} className="permission-item">
                                            <input
                                                type="checkbox"
                                                checked={permissions[selectedRole][perm]}
                                                onChange={() => handlePermissionChange(perm)}
                                            />
                                            <span className="checkbox-custom"></span>
                                            <span className="permission-label">{permissionLabels[perm]}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="panel-info">
                        <p>💡 提示：权限配置仅供展示，实际权限由系统预设。</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default RoleManagement
