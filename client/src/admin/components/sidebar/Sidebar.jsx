import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setSidebarToggle } from '../../../redux/sidebarToggle';
import { 
    Add, AdminPanelSettings, Book, Report, Settings, ViewAgenda,
    Dashboard as DashboardIcon, Home, School, TrendingUp, People,
    ExpandMore, ExpandLess
} from '@mui/icons-material';
import './sidebar.scss'

const Sidebar = () => {
    const { sidebarToggle } = useSelector(state => state.sidebarToggle);
    const dispatch = useDispatch();
    const location = useLocation();
    const [expandedMenus, setExpandedMenus] = useState({});
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 1024);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleToggle = () => {
        dispatch(setSidebarToggle(!sidebarToggle));
        document.body.classList.toggle('sidebar-toggled');
    };

    const toggleMenu = (menuName) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menuName]: !prev[menuName]
        }));
    };

    const isActive = (path) => location.pathname === path;

    useEffect(() => {
        if (window.innerWidth > 1024) {
            dispatch(setSidebarToggle(true));
        }
    }, [dispatch]);

    return (
        <>
            {/* Mobile backdrop */}
            {sidebarToggle && isMobile && (
                <div className="sidebar-backdrop" onClick={handleToggle}></div>
            )}
            
            <div className={`minimal-sidebar ${sidebarToggle ? '' : 'sidebar-close'}`} id="sidebar">
                <div className="sidebar-content">
                    {/* Brand */}
                    <div className="sidebar-brand">
                        <div className="brand-icon">
                            <School style={{ fontSize: '28px' }} />
                        </div>
                        <div className="brand-text">Admin Panel</div>
                        {/* Mobile close button */}
                        <button className="mobile-close-btn" onClick={handleToggle}>
                            <ExpandLess style={{ fontSize: '24px', transform: 'rotate(-90deg)' }} />
                        </button>
                    </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    {/* Dashboard */}
                    <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
                        <DashboardIcon className="nav-icon" />
                        <span className="nav-text">Dashboard</span>
                    </Link>

                    {/* Home Page */}
                    <div className="nav-group">
                        <div className="nav-item" onClick={() => toggleMenu('homepage')}>
                            <Home className="nav-icon" />
                            <span className="nav-text">Home Page</span>
                            {expandedMenus.homepage ? <ExpandLess className="expand-icon" /> : <ExpandMore className="expand-icon" />}
                        </div>
                        {expandedMenus.homepage && (
                            <div className="sub-menu">
                                <Link to="/topbar" className={`sub-item ${isActive('/topbar') ? 'active' : ''}`}>
                                    <span>Topbar</span>
                                </Link>
                                <Link to="/review" className={`sub-item ${isActive('/review') ? 'active' : ''}`}>
                                    <span>Student Reviews</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Courses Info */}
                    <div className="nav-group">
                        <div className="nav-item" onClick={() => toggleMenu('courses')}>
                            <Book className="nav-icon" />
                            <span className="nav-text">Courses Info</span>
                            {expandedMenus.courses ? <ExpandLess className="expand-icon" /> : <ExpandMore className="expand-icon" />}
                        </div>
                        {expandedMenus.courses && (
                            <div className="sub-menu">
                                <Link to="/courses" className={`sub-item ${isActive('/courses') ? 'active' : ''}`}>
                                    <span>Update Courses</span>
                                </Link>
                                <Link to="/referral" className={`sub-item ${isActive('/referral') ? 'active' : ''}`}>
                                    <span>Referrals</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Series Management */}
                    <div className="nav-group">
                        <div className="nav-item" onClick={() => toggleMenu('series')}>
                            <TrendingUp className="nav-icon" />
                            <span className="nav-text">Series Management</span>
                            {expandedMenus.series ? <ExpandLess className="expand-icon" /> : <ExpandMore className="expand-icon" />}
                        </div>
                        {expandedMenus.series && (
                            <div className="sub-menu">
                                <Link to="/series" className={`sub-item ${isActive('/series') ? 'active' : ''}`}>
                                    <span>Manage Series</span>
                                </Link>
                                <Link to="/tests" className={`sub-item ${isActive('/tests') ? 'active' : ''}`}>
                                    <span>Manage Tests</span>
                                </Link>
                                <Link to="/series-mcqs" className={`sub-item ${isActive('/series-mcqs') ? 'active' : ''}`}>
                                    <span>Series MCQs</span>
                                </Link>
                                <Link to="/enrollments" className={`sub-item ${isActive('/enrollments') ? 'active' : ''}`}>
                                    <span>Enrollments</span>
                                </Link>
                                <Link to="/payments" className={`sub-item ${isActive('/payments') ? 'active' : ''}`}>
                                    <span>Payments</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="nav-divider"></div>

                    {/* Manage Users */}
                    <Link to="/users" className={`nav-item ${isActive('/users') ? 'active' : ''}`}>
                        <People className="nav-icon" />
                        <span className="nav-text">Manage Users</span>
                    </Link>

                    {/* Course Requests */}
                    <Link to="/course-request" className={`nav-item ${isActive('/course-request') ? 'active' : ''}`}>
                        <AdminPanelSettings className="nav-icon" />
                        <span className="nav-text">Course Requests</span>
                    </Link>

                    {/* Manage MCQs */}
                    <div className="nav-group">
                        <div className="nav-item" onClick={() => toggleMenu('mcqs')}>
                            <ViewAgenda className="nav-icon" />
                            <span className="nav-text">Manage MCQs</span>
                            {expandedMenus.mcqs ? <ExpandLess className="expand-icon" /> : <ExpandMore className="expand-icon" />}
                        </div>
                        {expandedMenus.mcqs && (
                            <div className="sub-menu">
                                <Link to="/add-mcq" className={`sub-item ${isActive('/add-mcq') ? 'active' : ''}`}>
                                    <Add style={{ fontSize: '18px', marginRight: '8px' }} />
                                    <span>Add New MCQ</span>
                                </Link>
                                <Link to="/view-mcq" className={`sub-item ${isActive('/view-mcq') ? 'active' : ''}`}>
                                    <ViewAgenda style={{ fontSize: '18px', marginRight: '8px' }} />
                                    <span>View MCQs</span>
                                </Link>
                                <Link to="/report-mcq" className={`sub-item ${isActive('/report-mcq') ? 'active' : ''}`}>
                                    <Report style={{ fontSize: '18px', marginRight: '8px' }} />
                                    <span>Reported MCQs</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="nav-divider"></div>

                    {/* Settings */}
                    <Link to="/settings" className={`nav-item ${isActive('/settings') ? 'active' : ''}`}>
                        <Settings className="nav-icon" />
                        <span className="nav-text">Admin Settings</span>
                    </Link>
                </nav>
            </div>
        </div>
        </>
    );
};

export default Sidebar;
