import { useEffect, useState } from 'react'
import { useAuthStore } from '../../stores/authStore'
import { useDataStore } from '../../stores/dataStore'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import './Dashboard.css'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b']

function Dashboard() {
    const { user } = useAuthStore()
    const { loadAllData, getStats, getWeeklyTrendData } = useDataStore()
    const [stats, setStats] = useState(null)
    const [weeklyData, setWeeklyData] = useState([])

    useEffect(() => {
        loadAllData()
        setStats(getStats())
        setWeeklyData(getWeeklyTrendData())
    }, [])

    if (!stats) {
        return <div className="loading">加载中...</div>
    }

    const roleGreeting = {
        student: '欢迎使用图书馆座位预约系统',
        staff: '欢迎使用图书馆管理系统',
        admin: '系统管理控制台'
    }

    const statCards = user?.role === 'student' ? [
        { label: '今日预约', value: stats.todayReservations, icon: '🪑', color: 'primary' },
        { label: '我的借阅', value: stats.activeBorrowings, icon: '📚', color: 'info' },
        { label: '可用座位', value: stats.availableSeats, icon: '✅', color: 'success' },
        { label: '可借图书', value: stats.availableBooks, icon: '📖', color: 'warning' }
    ] : [
        { label: '总用户数', value: stats.totalUsers, icon: '👥', color: 'primary' },
        { label: '总座位数', value: stats.totalSeats, icon: '🪑', color: 'info' },
        { label: '总图书数', value: stats.totalBooks, icon: '📚', color: 'success' },
        { label: '今日预约', value: stats.todayReservations, icon: '📅', color: 'warning' }
    ]

    const utilizationData = [
        { name: '座位利用率', value: stats.seatUtilization, fill: '#6366f1' },
        { name: '图书借阅率', value: stats.bookBorrowRate, fill: '#10b981' }
    ]

    const bookStatusData = [
        { name: '可借阅', value: stats.availableBooks },
        { name: '已借出', value: stats.borrowedBooks },
        { name: '逾期未还', value: stats.overdueBorrowings }
    ]

    return (
        <div className="dashboard fade-in">
            <div className="dashboard-header">
                <div>
                    <h1 className="dashboard-title">
                        你好，{user?.name} 👋
                    </h1>
                    <p className="dashboard-subtitle">{roleGreeting[user?.role]}</p>
                </div>
                <div className="quick-actions">
                    {user?.role === 'student' && (
                        <>
                            <a href="/reserve-seat" className="quick-action-btn">
                                <span>🪑</span> 预约座位
                            </a>
                            <a href="/my-borrowings" className="quick-action-btn">
                                <span>📚</span> 我的借阅
                            </a>
                        </>
                    )}
                </div>
            </div>

            <div className="stat-cards">
                {statCards.map((stat, index) => (
                    <div key={index} className={`stat-card stat-${stat.color}`}>
                        <div className="stat-icon">{stat.icon}</div>
                        <div className="stat-content">
                            <div className="stat-value">{stat.value}</div>
                            <div className="stat-label">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {(user?.role === 'staff' || user?.role === 'admin') && (
                <>
                    <div className="dashboard-charts">
                        <div className="chart-card">
                            <div className="chart-header">
                                <h3 className="chart-title">资源利用率</h3>
                            </div>
                            <div className="chart-body">
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={utilizationData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                        <XAxis type="number" domain={[0, 100]} stroke="#6b6b80" />
                                        <YAxis type="category" dataKey="name" stroke="#6b6b80" width={80} />
                                        <Tooltip
                                            contentStyle={{
                                                background: '#1a1a2e',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '8px'
                                            }}
                                            formatter={(value) => [`${value}%`, '利用率']}
                                        />
                                        <Bar dataKey="value" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="chart-card">
                            <div className="chart-header">
                                <h3 className="chart-title">图书状态分布</h3>
                            </div>
                            <div className="chart-body">
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={bookStatusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {bookStatusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                background: '#1a1a2e',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '8px'
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="pie-legend">
                                    {bookStatusData.map((entry, index) => (
                                        <div key={index} className="legend-item">
                                            <span className="legend-dot" style={{ background: COLORS[index] }}></span>
                                            <span>{entry.name}: {entry.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="chart-card chart-wide">
                        <div className="chart-header">
                            <h3 className="chart-title">本周趋势</h3>
                        </div>
                        <div className="chart-body">
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={weeklyData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="name" stroke="#6b6b80" />
                                    <YAxis stroke="#6b6b80" />
                                    <Tooltip
                                        contentStyle={{
                                            background: '#1a1a2e',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="reservations"
                                        name="座位预约"
                                        stroke="#6366f1"
                                        strokeWidth={3}
                                        dot={{ fill: '#6366f1', r: 4 }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="borrowings"
                                        name="图书借阅"
                                        stroke="#10b981"
                                        strokeWidth={3}
                                        dot={{ fill: '#10b981', r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            )}

            {stats.overdueBorrowings > 0 && (user?.role === 'staff' || user?.role === 'admin') && (
                <div className="alert-card">
                    <div className="alert-icon">⚠️</div>
                    <div className="alert-content">
                        <h4>逾期预警</h4>
                        <p>当前有 <strong>{stats.overdueBorrowings}</strong> 本图书逾期未还，请及时处理。</p>
                    </div>
                    <a href="/notifications" className="alert-action">查看详情</a>
                </div>
            )}
        </div>
    )
}

export default Dashboard
