import React, { useState, useEffect } from 'react';
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
    Box,
    Chip,
    IconButton,
    Tooltip,
    Card,
    CardContent,
    Grid,
    Checkbox,
    Toolbar,
    Alert
} from '@mui/material';
import {
    Delete as DeleteIcon,
    Visibility as VisibilityIcon,
    MarkEmailRead as MarkEmailReadIcon,
    DeleteSweep as DeleteSweepIcon,
    Edit as EditIcon
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axiosInstance from '../../../baseUrl.js';
import EditMcqModal from '../shared/EditMcqModal';

const columns = [
    { id: 'select', label: '', minWidth: 50, align: 'center' },
    { id: 'name', label: 'Username', minWidth: 120 },
    { id: 'email', label: 'Email', minWidth: 170 },
    { id: 'question', label: 'Question', minWidth: 200 },
    { id: 'msg', label: 'Message', minWidth: 200 },
    { id: 'isRead', label: 'Status', minWidth: 100, align: 'center' },
    { id: 'createdAt', label: 'Date', minWidth: 130 },
    { id: 'actions', label: 'Actions', minWidth: 150, align: 'center' },
];

export default function ReportMcq() {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [open, setOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [reload, setReload] = useState(false);
    const [selectedReports, setSelectedReports] = useState([]);
    const [stats, setStats] = useState({ total: 0, unread: 0, read: 0 });
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'read', 'unread'
    const { enqueueSnackbar } = useSnackbar();

    // Edit MCQ states
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingMcqId, setEditingMcqId] = useState(null);
    const [editingMcqData, setEditingMcqData] = useState(null);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const handleClickOpen = (report) => {
        setSelectedReport(report);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedReport(null);
    };

    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelectedReports(filteredReports.map(report => report._id));
        } else {
            setSelectedReports([]);
        }
    };

    const handleSelectReport = (reportId) => {
        setSelectedReports(prev => {
            if (prev.includes(reportId)) {
                return prev.filter(id => id !== reportId);
            } else {
                return [...prev, reportId];
            }
        });
    };

    const handleMarkAsRead = async (id) => {
        setLoading(true);
        try {
            await axiosInstance.get(`/report/${id}`);
            enqueueSnackbar('Report marked as read', { variant: 'success' });
            setReload(!reload);
        } catch (error) {
            enqueueSnackbar('Failed to mark report as read', { variant: 'error' });
            console.error('Error marking report as read:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkMultipleAsRead = async () => {
        if (selectedReports.length === 0) {
            enqueueSnackbar('Please select reports to mark as read', { variant: 'warning' });
            return;
        }

        setLoading(true);
        try {
            await axiosInstance.patch('/report/mark-read', { reportIds: selectedReports });
            enqueueSnackbar(`${selectedReports.length} reports marked as read`, { variant: 'success' });
            setSelectedReports([]);
            setReload(!reload);
        } catch (error) {
            enqueueSnackbar('Failed to mark reports as read', { variant: 'error' });
            console.error('Error marking reports as read:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMessage = async (id) => {
        if (window.confirm('Are you sure you want to delete this report?')) {
            setLoading(true);
            try {
                await axiosInstance.delete(`/report/${id}`);
                enqueueSnackbar('Report deleted successfully', { variant: 'success' });
                setReload(!reload);
            } catch (error) {
                enqueueSnackbar('Failed to delete report', { variant: 'error' });
                console.error('Error deleting report:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleDeleteMultiple = async () => {
        if (selectedReports.length === 0) {
            enqueueSnackbar('Please select reports to delete', { variant: 'warning' });
            return;
        }

        if (window.confirm(`Are you sure you want to delete ${selectedReports.length} reports?`)) {
            setLoading(true);
            try {
                await axiosInstance.delete('/report', { data: { reportIds: selectedReports } });
                enqueueSnackbar(`${selectedReports.length} reports deleted successfully`, { variant: 'success' });
                setSelectedReports([]);
                setReload(!reload);
            } catch (error) {
                enqueueSnackbar('Failed to delete reports', { variant: 'error' });
                console.error('Error deleting reports:', error);
            } finally {
                setLoading(false);
            }
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const truncateText = (text, maxLength = 50) => {
        if (!text) return 'N/A';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [reportsResponse, statsResponse] = await Promise.all([
                    axiosInstance.get('/report'),
                    axiosInstance.get('/report/stats/overview')
                ]);
                
                setReports(reportsResponse.data || []);
                setStats(statsResponse.data || { total: 0, unread: 0, read: 0 });
            } catch (error) {
                enqueueSnackbar('Failed to fetch reports', { variant: 'error' });
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [reload, enqueueSnackbar]);

    const filteredReports = React.useMemo(() => {
        return reports.filter(report => {
            if (filterStatus === 'all') return true;
            if (filterStatus === 'read') return report.isRead;
            if (filterStatus === 'unread') return !report.isRead;
            return true;
        });
    }, [reports, filterStatus]);

    // Handle MCQ Edit
    const handleEditMcq = async (report) => {
        try {
            // If report has mcqId, fetch directly by ID
            if (report.mcqId) {
                const response = await axiosInstance.get(`/mcq/${report.mcqId}`);
                if (response.data) {
                    setEditingMcqId(response.data._id);
                    setEditingMcqData(response.data);
                    setEditModalOpen(true);
                    return;
                }
            }
            
            // Fallback to search by question text for older reports
            let response = await axiosInstance.get(`/mcq/search?question=${encodeURIComponent(report.question)}`);
            
            // If no results, try with first 50 characters for partial match
            if (!response.data.mcqs || response.data.mcqs.length === 0) {
                const partialQuestion = report.question.substring(0, 50);
                response = await axiosInstance.get(`/mcq/search?question=${encodeURIComponent(partialQuestion)}`);
            }
            
            if (response.data.mcqs && response.data.mcqs.length > 0) {
                const mcq = response.data.mcqs[0];
                setEditingMcqId(mcq._id);
                setEditingMcqData(mcq);
                setEditModalOpen(true);
            } else {
                enqueueSnackbar('MCQ not found in database. It may have been deleted.', { variant: 'warning' });
            }
        } catch (error) {
            enqueueSnackbar('Failed to fetch MCQ details', { variant: 'error' });
            console.error('Error fetching MCQ:', error);
        }
    };

    const handleEditSuccess = () => {
        setReload(!reload);
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
                MCQ Reports Management
            </Typography>

            {/* Statistics Cards */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                    <Card 
                        onClick={() => setFilterStatus('all')}
                        sx={{ 
                            cursor: 'pointer',
                            border: filterStatus === 'all' ? 2 : 0,
                            borderColor: 'primary.main',
                            bgcolor: filterStatus === 'all' ? 'action.hover' : 'background.paper',
                            transition: 'all 0.2s'
                        }}
                    >
                        <CardContent>
                            <Typography variant="h6" color="primary">Total Reports</Typography>
                            <Typography variant="h4">{stats.total}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card
                        onClick={() => setFilterStatus('unread')}
                        sx={{ 
                            cursor: 'pointer',
                            border: filterStatus === 'unread' ? 2 : 0,
                            borderColor: 'warning.main',
                            bgcolor: filterStatus === 'unread' ? 'action.hover' : 'background.paper',
                            transition: 'all 0.2s'
                        }}
                    >
                        <CardContent>
                            <Typography variant="h6" color="warning.main">Unread Reports</Typography>
                            <Typography variant="h4">{stats.unread}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card
                        onClick={() => setFilterStatus('read')}
                        sx={{ 
                            cursor: 'pointer',
                            border: filterStatus === 'read' ? 2 : 0,
                            borderColor: 'success.main',
                            bgcolor: filterStatus === 'read' ? 'action.hover' : 'background.paper',
                            transition: 'all 0.2s'
                        }}
                    >
                        <CardContent>
                            <Typography variant="h6" color="success.main">Read Reports</Typography>
                            <Typography variant="h4">{stats.read}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filter and Bulk Actions Toolbar */}
            <Toolbar sx={{ mb: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
                <Typography variant="h6" sx={{ flex: '1 1 100%', color: 'primary.contrastText' }}>
                    {selectedReports.length} selected
                </Typography>
                <Button
                    variant={filterStatus === 'all' ? 'contained' : 'outlined'}
                    color="primary"
                    onClick={() => setFilterStatus('all')}
                    sx={{ mr: 1, bgcolor: filterStatus === 'all' ? 'primary.main' : 'background.paper' }}
                >
                    All
                </Button>
                <Button
                    variant={filterStatus === 'read' ? 'contained' : 'outlined'}
                    color="success"
                    onClick={() => setFilterStatus('read')}
                    sx={{ mr: 1, bgcolor: filterStatus === 'read' ? 'success.main' : 'background.paper' }}
                >
                    Read
                </Button>
                <Button
                    variant={filterStatus === 'unread' ? 'contained' : 'outlined'}
                    color="warning"
                    onClick={() => setFilterStatus('unread')}
                    sx={{ mr: 1, bgcolor: filterStatus === 'unread' ? 'warning.main' : 'background.paper' }}
                >
                    Unread
                </Button>
                {selectedReports.length > 0 && (
                    <>
                        <Tooltip title="Mark as Read">
                            <IconButton 
                                onClick={handleMarkMultipleAsRead}
                                disabled={loading}
                                sx={{ color: 'primary.contrastText' }}
                            >
                                <MarkEmailReadIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Selected">
                            <IconButton 
                                onClick={handleDeleteMultiple}
                                disabled={loading}
                                sx={{ color: 'primary.contrastText' }}
                            >
                                <DeleteSweepIcon />
                            </IconButton>
                        </Tooltip>
                    </>
                )}
            </Toolbar>

            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <TableContainer sx={{ maxHeight: 600 }}>
                    <Table stickyHeader aria-label="reports table">
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox">
                                    <Checkbox
                                        indeterminate={selectedReports.length > 0 && selectedReports.length < filteredReports.length}
                                        checked={filteredReports.length > 0 && selectedReports.length === filteredReports.length}
                                        onChange={handleSelectAll}
                                    />
                                </TableCell>
                                {columns.slice(1).map((column) => (
                                    <TableCell
                                        key={column.id}
                                        align={column.align}
                                        style={{ minWidth: column.minWidth, fontWeight: 'bold' }}
                                    >
                                        {column.label}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                        <Typography>Loading reports...</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : filteredReports.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">No reports found</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredReports
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((report) => (
                                        <TableRow 
                                            hover 
                                            role="checkbox" 
                                            tabIndex={-1} 
                                            key={report._id}
                                            selected={selectedReports.includes(report._id)}
                                        >
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={selectedReports.includes(report._id)}
                                                    onChange={() => handleSelectReport(report._id)}
                                                />
                                            </TableCell>
                                            <TableCell>{report.username || report.name || 'Anonymous'}</TableCell>
                                            <TableCell>{report.email || 'N/A'}</TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {truncateText(report.question, 60)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Typography 
                                                    variant="body2" 
                                                    sx={{ cursor: 'pointer', color: 'primary.main' }}
                                                    onClick={() => handleClickOpen(report)}
                                                >
                                                    {truncateText(report.msg, 40)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={report.isRead ? 'Read' : 'Unread'}
                                                    color={report.isRead ? 'success' : 'warning'}
                                                    size="small"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Typography variant="body2">
                                                    {formatDate(report.createdAt)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Tooltip title="View Details">
                                                    <IconButton 
                                                        onClick={() => handleClickOpen(report)}
                                                        size="small"
                                                    >
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Edit MCQ">
                                                    <IconButton 
                                                        onClick={() => handleEditMcq(report)}
                                                        disabled={loading}
                                                        size="small"
                                                        color="warning"
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                {!report.isRead && (
                                                    <Tooltip title="Mark as Read">
                                                        <IconButton 
                                                            onClick={() => handleMarkAsRead(report._id)}
                                                            disabled={loading}
                                                            size="small"
                                                            color="primary"
                                                        >
                                                            <MarkEmailReadIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                                <Tooltip title="Delete">
                                                    <IconButton 
                                                        onClick={() => handleDeleteMessage(report._id)}
                                                        disabled={loading}
                                                        size="small"
                                                        color="error"
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    component="div"
                    count={filteredReports.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>

            {/* Report Details Dialog */}
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                    Report Details
                </DialogTitle>
                <DialogContent sx={{ mt: 2 }}>
                    {selectedReport && (
                        <Box>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Reporter:
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        {selectedReport.username || selectedReport.name || 'Anonymous'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Email:
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        {selectedReport.email || 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Status:
                                    </Typography>
                                    <Chip
                                        label={selectedReport.isRead ? 'Read' : 'Unread'}
                                        color={selectedReport.isRead ? 'success' : 'warning'}
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Date:
                                    </Typography>
                                    <Typography variant="body1" gutterBottom>
                                        {formatDate(selectedReport.createdAt)}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Question:
                                    </Typography>
                                    <Typography variant="body1" gutterBottom sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                                        {selectedReport.question || 'No question provided'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Message:
                                    </Typography>
                                    <Typography variant="body1" sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                                        {selectedReport.msg || 'No message provided'}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    {selectedReport && !selectedReport.isRead && (
                        <Button 
                            onClick={() => handleMarkAsRead(selectedReport._id)}
                            disabled={loading}
                            color="primary"
                            variant="contained"
                        >
                            Mark as Read
                        </Button>
                    )}
                    <Button onClick={handleClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit MCQ Modal */}
            <EditMcqModal
                open={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                mcqId={editingMcqId}
                mcqData={editingMcqData}
                onSuccess={handleEditSuccess}
            />
        </Box>
    );
}