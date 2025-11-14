import React from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setSidebarToggle } from '../../../redux/sidebarToggle';

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
        <>
            <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
                {/* <!-- Sidebar Toggle (Topbar) --> */}
                <button onClick={handleToggle} id="sidebarToggleTop" className="btn btn-link d-md-none rounded-circle mr-3">
                    <i className="fa fa-bars"></i>
                </button>
                {/* <!-- Topbar Navbar --> */}
                <ul className="navbar-nav ml-auto">
                    {/* Super Admin Badge */}
                    {superAdmin && superAdmin.role === 'super-admin' && (
                        <>
                            <li className="nav-item" style={{ display: 'flex', alignItems: 'center', marginRight: '10px' }}>
                                <span style={{ 
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: 'bold'
                                }}>
                                    🔐 {superAdmin.username} (Super Admin)
                                </span>
                            </li>
                            <li className="nav-item">
                                <button 
                                    onClick={handleLogout}
                                    className="btn btn-sm"
                                    style={{ 
                                        background: '#dc3545',
                                        color: 'white',
                                        borderRadius: '20px',
                                        padding: '6px 16px',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <i className="fas fa-sign-out-alt" style={{ marginRight: '5px' }}></i>
                                    Logout
                                </button>
                            </li>
                        </>
                    )}

                    {/* <!-- Nav Item - Alerts --> */}
                    {/* <li className="nav-item dropdown no-arrow mx-1" style={{ background: "transparent" }}>
                        <a className="nav-link dropdown-toggle bg-info rounded-3 h-100 py-3" href="#" id="alertsDropdown" role="button"
                            data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i className="fas fa-bell fa-fw"></i>
                            <span className="badges badge-counter">3+</span>
                        </a>
                        <div className="dropdown-list dropdown-menu dropdown-menu-right shadow animated--grow-in"
                            aria-labelledby="alertsDropdown">
                            <h6 className="dropdown-header">
                                Alerts Center
                            </h6>
                            <a className="dropdown-item d-flex align-items-center" href="#">
                                <div className="mr-3">
                                    <div className="icon-circle bg-primary">
                                        <i className="fas fa-file-alt text-white"></i>
                                    </div>
                                </div>
                                <div>
                                    <div className="small text-gray-500">December 12, 2019</div>
                                    <span className="font-weight-bold">A new monthly report is ready to download!</span>
                                </div>
                            </a>
                        </div>
                    </li>
                    <div className="topbar-divider d-none d-sm-block"></div> */}
                </ul>
            </nav>
        </>
    )
}

export default Navbar