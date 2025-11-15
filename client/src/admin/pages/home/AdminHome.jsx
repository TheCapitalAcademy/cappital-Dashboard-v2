import React from 'react'
import Sidebar from '../../components/sidebar/Sidebar'
import Navbar from '../../components/navbar/Navbar'
import { Outlet } from 'react-router-dom'
import './adminhome.scss'

const AdminHome = () => {
    return (
        <div className="admin-layout">
            {/* Sidebar */}
            <Sidebar />
            {/* main content here pages or components */}
            <div className="admin-main-content">
                <Navbar />
                {/* //Main Content */}
                <div className="admin-page-content">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default AdminHome