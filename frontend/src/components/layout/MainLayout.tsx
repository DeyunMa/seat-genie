import React, { useState, useCallback } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import './MainLayout.css'

function MainLayout(): React.ReactNode {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const location = useLocation()

    const toggleSidebar = useCallback(() => {
        setSidebarOpen(prev => !prev)
    }, [])

    const closeSidebar = useCallback(() => {
        setSidebarOpen(false)
    }, [])

    React.useEffect(() => {
        closeSidebar()
    }, [location.pathname, closeSidebar])

    return (
        <div className="main-layout">
            {sidebarOpen && <div className="sidebar-overlay" onClick={closeSidebar} />}
            <Sidebar isOpen={sidebarOpen} />
            <div className="main-content">
                <Header onToggleSidebar={toggleSidebar} />
                <main className="page-content">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default MainLayout
