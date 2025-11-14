import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setSidebarToggle } from '../../../redux/sidebarToggle';
import { Menu, Logout, AdminPanelSettings } from '@mui/icons-material';
import './navbar.scss';

const Navbar = () => {
    const dispatch = useDispatch();
    const { sidebarToggle } = useSelector(state => state.sidebarToggle);
    const handleToggle = () => {
        dispatch(setSidebarToggle(!sidebarToggle));
        document.getElementsByTagName('body')[0].classList.toggle('sidebar-toggled');
    }

    // Check if super admin is logged in
    const superAdminData = localStorage.getItem('superAdmin');
    const superAdmin = superAdminData ? JSON.parse(superAdminData) : null;

    const handleLogout = () => {
        localStorage.removeItem('superAdmin');
        window.location.href = '/super-admin';
    };

    return (
        <nav className="minimal-navbar">
            <div className="navbar-left">
                <button onClick={handleToggle} className="menu-toggle">
                    <Menu />
                </button>
                <div className="navbar-title">
                    <h2>Dashboard</h2>
                    <p>Welcome back to your admin panel</p>
                </div>
            </div>

            <div className="navbar-right">
                {/* Super Admin Badge */}
                {superAdmin && superAdmin.role === 'super-admin' && (
                    <>
                        <div className="admin-badge">
                            <div className="badge-icon">
                                <AdminPanelSettings style={{ fontSize: '18px' }} />
                            </div>
                            <div className="badge-info">
                                <span className="badge-name">{superAdmin.username}</span>
                                <span className="badge-role">Super Admin</span>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="logout-btn">
                            <Logout style={{ fontSize: '18px' }} />
                            <span>Logout</span>
                        </button>
                    </>
                )}

            </div>
        </nav>
    )
}

export default Navbar