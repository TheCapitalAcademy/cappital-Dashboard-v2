import { Button } from '@mui/material';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import { Spinner } from 'react-bootstrap';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import axios from 'axios';
import axiosInstance from '../../../baseUrl.js';

const Settings = () => {
    // Check if super admin is logged in
    const superAdminData = localStorage.getItem('superAdmin');
    const superAdmin = superAdminData ? JSON.parse(superAdminData) : null;
    const isSuperAdmin = superAdmin && superAdmin.role === 'super-admin';

    const [value, setValue] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    // COMMENTED OUT: Regular admin password change
    // const handleUpdate = async () => {
    //     try {
    //         setLoading(true);
    //         await axiosInstance.post('/admin', { password: value });
    //         enqueueSnackbar("updated successfully", { variant: 'success', autoHideDuration: 1500 });
    //         setLoading(false);
    //     } catch (error) {
    //         setLoading(false);
    //         enqueueSnackbar("error updating", { variant: 'error', autoHideDuration: 1500 });
    //         setLoading(false);
    //     }
    // };

    // Super Admin password change
    const handleSuperAdminPasswordChange = async () => {
        if (!currentPassword || !newPassword) {
            enqueueSnackbar("Please fill in all fields", { variant: 'warning', autoHideDuration: 1500 });
            return;
        }
        if (newPassword.length < 6) {
            enqueueSnackbar("New password must be at least 6 characters", { variant: 'warning', autoHideDuration: 1500 });
            return;
        }
        try {
            setLoading(true);
            const response = await axiosInstance.put('/admin/change-password', {
                adminId: superAdmin.id,
                newPassword: newPassword,
                superAdminPassword: currentPassword  // Current password is used for authentication
            });
            enqueueSnackbar(response.data.message || "Password updated successfully", { variant: 'success', autoHideDuration: 1500 });
            setCurrentPassword('');
            setNewPassword('');
            setLoading(false);
        } catch (error) {
            setLoading(false);
            enqueueSnackbar(error.response?.data?.message || "Error updating password", { variant: 'error', autoHideDuration: 1500 });
        }
    };

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

    return (
        <div className="admin-topbar">
            <div className="container">
                {isSuperAdmin ? (
                    // Super Admin Password Change
                    <>
                        <div className="row py-2">
                            <div className="col-md-12 text-primary d-flex justify-content-between align-items-center">
                                <h1 className='fw-bold'>Super Admin Settings</h1>
                                <Button variant="contained" style={{ height: "38px" }} className='pt-2' color="primary" onClick={handleSuperAdminPasswordChange}>
                                    Change Password
                                    {loading && <Spinner animation="border" size="sm" className='ms-2' />}
                                </Button>
                            </div>
                        </div>
                        <div className="row mt-4">
                            <div className="col-md-12">
                                <TextField
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className='form-control mb-3'
                                    label='Current Password'
                                    fullWidth
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    edge="end"
                                                >
                                                    {showCurrentPassword ? <Visibility /> : <VisibilityOff />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </div>
                        </div>
                        <div className="row mt-3">
                            <div className="col-md-12">
                                <TextField
                                    type={showNewPassword ? 'text' : 'password'}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className='form-control'
                                    label='New Password (min 6 characters)'
                                    fullWidth
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    edge="end"
                                                >
                                                    {showNewPassword ? <Visibility /> : <VisibilityOff />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    // COMMENTED OUT: Regular Admin Settings
                    <>
                        <div className="row py-2">
                            <div className="col-md-12 text-primary">
                                <h1 className='fw-bold'>Admin Settings</h1>
                                <p className='text-muted'>Password change is only available for Super Admins</p>
                            </div>
                        </div>
                        {/* <div className="row py-2">
                            <div className="col-md-12 text-primary d-flex justify-content-between align-items-center">
                                <h1 className='fw-bold'>Admin Settings</h1>
                                <Button variant="contained" style={{ height: "38px" }} className='pt-2' color="primary" onClick={handleUpdate}>
                                    Save
                                    {loading && <Spinner animation="border" size="sm" className='ms-2' />}
                                </Button>
                            </div>
                        </div>
                        <div className="row mt-5">
                            <div className="col-md-12">
                                <TextField
                                    type={showPassword ? 'text' : 'password'}
                                    onChange={(e) => setValue(e.target.value)}
                                    className='form-control'
                                    placeholder='Change Admin password'
                                    fullWidth
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={handleClickShowPassword}
                                                    onMouseDown={handleMouseDownPassword}
                                                    edge="end"
                                                >
                                                    {showPassword ? <Visibility /> : <VisibilityOff />}
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            </div>
                        </div> */}
                    </>
                )}
            </div>
        </div>
    );
};

export default Settings;
