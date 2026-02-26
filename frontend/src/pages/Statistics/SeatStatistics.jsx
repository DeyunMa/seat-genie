import { useEffect, useState } from 'react'
import { useDataStore } from '../../stores/dataStore'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts'
import '../Dashboard/Dashboard.css'
import './Statistics.css'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6']

function SeatStatistics() {
    const { rooms, seats, seatReservations, loadAllData, getWeeklyTrendData, getTimeSlotDistribution } = useDataStore()
    const [dateRange, setDateRange] = useState('week')
    const [weeklyTrend, setWeeklyTrend] = useState([])
    const [timeSlotData, setTimeSlotData] = useState([])

    useEffect(() => {
        loadAllData()
        setWeeklyTrend(getWeeklyTrendData())
        setTimeSlotData(getTimeSlotDistribution())
    }, [])

    const activeRooms = rooms.filter(r => r.activeStatus === 'Y')
    const activeSeats = seats.filter(s => s.activeStatus === 'Y')

    // Room utilization data
    const roomUtilization = activeRooms.map(room => {
        const roomSeats = activeSeats.filter(s => s.roomId === room.id)
        const roomReservations = seatReservations.filter(r =>
            roomSeats.some(s => s.id === r.seatId) && r.status === 'active'
        )
        const utilization = roomSeats.length > 0
            ? Math.round((roomReservations.length / roomSeats.length) * 100)
            : 0

        return {
            name: room.name,
            seats: roomSeats.length,
            reservations: roomReservations.length,
            utilization
        }
    })

    // Seat status distribution
    const seatStatusData = [
        { name: '可用', value: activeSeats.filter(s => s.status === 'available').length },
        { name: '使用中', value: activeSeats.filter(s => s.status === 'occupied').length },
        { name: '维护中', value: activeSeats.filter(s => s.status === 'maintenance').length }
    ]

    const totalSeats = activeSeats.length
    const activeReservations = seatReservations.filter(r => r.status === 'active').length
    const avgUtilization = roomUtilization.length > 0
        ? Math.round(roomUtilization.reduce((sum, r) => sum + r.utilization, 0) / roomUtilization.length)
        : 0

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">座位统计</h1>
                <div className="header-actions">
                    <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                        <option value="today">今日</option>
                        <option value="week">本周</option>
                        <option value="month">本月</option>
                    </select>
                </div>
            </div>

            <div className="stat-cards">
                <div className="stat-card stat-primary">
                    <div className="stat-icon">🪑</div>
                    <div className="stat-content">
                        <div className="stat-value">{totalSeats}</div>
                        <div className="stat-label">总座位数</div>
                    </div>
                </div>
                <div className="stat-card stat-success">
                    <div className="stat-icon">📅</div>
                    <div className="stat-content">
                        <div className="stat-value">{activeReservations}</div>
                        <div className="stat-label">有效预约</div>
                    </div>
                </div>
                <div className="stat-card stat-info">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                        <div className="stat-value">{avgUtilization}%</div>
                        <div className="stat-label">平均利用率</div>
                    </div>
                </div>
                <div className="stat-card stat-warning">
                    <div className="stat-icon">🏠</div>
                    <div className="stat-content">
                        <div className="stat-value">{activeRooms.length}</div>
                        <div className="stat-label">开放房间</div>
                    </div>
                </div>
            </div>

            <div className="dashboard-charts">
                <div className="chart-card">
                    <div className="chart-header">
                        <h3 className="chart-title">各房间利用率</h3>
                    </div>
                    <div className="chart-body">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={roomUtilization} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis type="number" domain={[0, 100]} stroke="#6b6b80" />
                                <YAxis type="category" dataKey="name" stroke="#6b6b80" width={100} />
                                <Tooltip
                                    contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                    formatter={(value) => [`${value}%`, '利用率']}
                                />
                                <Bar dataKey="utilization" fill="#6366f1" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="chart-card">
                    <div className="chart-header">
                        <h3 className="chart-title">座位状态分布</h3>
                    </div>
                    <div className="chart-body">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={seatStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, value }) => `${name}: ${value}`}
                                >
                                    {seatStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="chart-card chart-wide">
                <div className="chart-header">
                    <h3 className="chart-title">预约趋势</h3>
                </div>
                <div className="chart-body">
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={weeklyTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="name" stroke="#6b6b80" />
                            <YAxis stroke="#6b6b80" />
                            <Tooltip
                                contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                            />
                            <Area type="monotone" dataKey="reservations" name="预约数" stroke="#6366f1" fill="rgba(99, 102, 241, 0.3)" />
                            <Area type="monotone" dataKey="peak" name="峰值" stroke="#10b981" fill="rgba(16, 185, 129, 0.2)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="chart-card chart-wide">
                <div className="chart-header">
                    <h3 className="chart-title">时段分布</h3>
                </div>
                <div className="chart-body">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={timeSlotData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="time" stroke="#6b6b80" />
                            <YAxis stroke="#6b6b80" />
                            <Tooltip
                                contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                            />
                            <Bar dataKey="count" name="预约数" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}

export default SeatStatistics
