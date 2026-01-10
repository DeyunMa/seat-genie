import { useEffect, useState } from 'react'
import { useDataStore } from '../../stores/dataStore'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import '../Dashboard/Dashboard.css'
import './Statistics.css'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6']

function BookStatistics() {
    const { books, bookBorrowings, loadAllData } = useDataStore()
    const [dateRange, setDateRange] = useState('month')

    useEffect(() => {
        loadAllData()
    }, [])

    const activeBooks = books.filter(b => b.activeStatus === 'Y')
    const today = new Date().toISOString().split('T')[0]

    // Book status distribution
    const bookStatusData = [
        { name: '可借阅', value: activeBooks.filter(b => b.status === 'available').length },
        { name: '已借出', value: activeBooks.filter(b => b.status === 'borrowed').length },
        { name: '维护中', value: activeBooks.filter(b => b.status === 'maintenance').length }
    ]

    // Category distribution
    const categories = [...new Set(activeBooks.map(b => b.category))]
    const categoryData = categories.map(cat => ({
        name: cat,
        count: activeBooks.filter(b => b.category === cat).length
    })).sort((a, b) => b.count - a.count)

    // Borrowing stats
    const activeBorrowings = bookBorrowings.filter(b => b.status === 'borrowed')
    const overdueBorrowings = activeBorrowings.filter(b => b.dueDate < today)
    const returnedBorrowings = bookBorrowings.filter(b => b.status === 'returned')

    // Monthly trend (mock)
    const monthlyTrend = [
        { name: '1月', borrowings: 120, returns: 115 },
        { name: '2月', borrowings: 98, returns: 102 },
        { name: '3月', borrowings: 145, returns: 140 },
        { name: '4月', borrowings: 160, returns: 155 },
        { name: '5月', borrowings: 135, returns: 138 },
        { name: '6月', borrowings: 110, returns: 112 }
    ]

    // Popular books (mock based on actual data)
    const popularBooks = activeBooks.slice(0, 5).map((book, index) => ({
        name: book.title.length > 15 ? book.title.substring(0, 15) + '...' : book.title,
        borrowCount: Math.floor(Math.random() * 20) + 10
    }))

    const totalBooks = activeBooks.length
    const borrowRate = totalBooks > 0
        ? Math.round((activeBorrowings.length / totalBooks) * 100)
        : 0
    const overdueRate = activeBorrowings.length > 0
        ? Math.round((overdueBorrowings.length / activeBorrowings.length) * 100)
        : 0

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">图书统计</h1>
                <div className="header-actions">
                    <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                        <option value="week">本周</option>
                        <option value="month">本月</option>
                        <option value="quarter">本季度</option>
                    </select>
                </div>
            </div>

            <div className="stat-cards">
                <div className="stat-card stat-primary">
                    <div className="stat-icon">📚</div>
                    <div className="stat-content">
                        <div className="stat-value">{totalBooks}</div>
                        <div className="stat-label">馆藏总量</div>
                    </div>
                </div>
                <div className="stat-card stat-success">
                    <div className="stat-icon">📖</div>
                    <div className="stat-content">
                        <div className="stat-value">{activeBorrowings.length}</div>
                        <div className="stat-label">在借数量</div>
                    </div>
                </div>
                <div className="stat-card stat-info">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                        <div className="stat-value">{borrowRate}%</div>
                        <div className="stat-label">借阅率</div>
                    </div>
                </div>
                <div className="stat-card stat-warning">
                    <div className="stat-icon">⚠️</div>
                    <div className="stat-content">
                        <div className="stat-value">{overdueBorrowings.length}</div>
                        <div className="stat-label">逾期数量</div>
                    </div>
                </div>
            </div>

            <div className="dashboard-charts">
                <div className="chart-card">
                    <div className="chart-header">
                        <h3 className="chart-title">图书状态分布</h3>
                    </div>
                    <div className="chart-body">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={bookStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, value }) => `${name}: ${value}`}
                                >
                                    {bookStatusData.map((entry, index) => (
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

                <div className="chart-card">
                    <div className="chart-header">
                        <h3 className="chart-title">分类占比</h3>
                    </div>
                    <div className="chart-body">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={categoryData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis type="number" stroke="#6b6b80" />
                                <YAxis type="category" dataKey="name" stroke="#6b6b80" width={80} />
                                <Tooltip
                                    contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                />
                                <Bar dataKey="count" name="数量" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="chart-card chart-wide">
                <div className="chart-header">
                    <h3 className="chart-title">借还趋势</h3>
                </div>
                <div className="chart-body">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={monthlyTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="name" stroke="#6b6b80" />
                            <YAxis stroke="#6b6b80" />
                            <Tooltip
                                contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                            />
                            <Line type="monotone" dataKey="borrowings" name="借出" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 5 }} />
                            <Line type="monotone" dataKey="returns" name="归还" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 5 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="chart-card chart-wide">
                <div className="chart-header">
                    <h3 className="chart-title">热门图书</h3>
                </div>
                <div className="chart-body">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={popularBooks}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="name" stroke="#6b6b80" angle={-15} textAnchor="end" height={60} />
                            <YAxis stroke="#6b6b80" />
                            <Tooltip
                                contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                            />
                            <Bar dataKey="borrowCount" name="借阅次数" fill="#ec4899" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}

export default BookStatistics
