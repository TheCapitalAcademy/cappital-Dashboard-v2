import React, { useState, useEffect, useCallback } from 'react';
import {
    Button,
    Card,
    CardContent,
    Typography,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Box,
    Alert,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Checkbox,
    RadioGroup,
    Radio,
    FormControlLabel,
    FormLabel,
    CircularProgress,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    Stepper,
    Step,
    StepLabel,
} from '@mui/material';
import {
    SwapHoriz,
    ContentCopy,
    DriveFileMove,
    CheckCircle,
    Warning,
    ArrowForward,
    Preview,
    PlayArrow,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axiosInstance from '../../../baseUrl';

const subjects = ['biology', 'chemistry', 'physics', 'english', 'logic'];
const courses = ['mdcat', 'nums'];

const ChapterManagement = () => {
    const { enqueueSnackbar } = useSnackbar();

    // Step tracking
    const [activeStep, setActiveStep] = useState(0);
    const steps = ['Configure', 'Select Chapters', 'Preview & Confirm'];

    // Form state
    const [sourceCourse, setSourceCourse] = useState('');
    const [targetCourse, setTargetCourse] = useState('');
    const [subject, setSubject] = useState('');
    const [mode, setMode] = useState('move');

    // Data state
    const [chapters, setChapters] = useState([]);
    const [selectedChapters, setSelectedChapters] = useState([]);
    const [previewData, setPreviewData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [executing, setExecuting] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [result, setResult] = useState(null);

    // Fetch chapters when source course and subject are selected
    const fetchChapters = useCallback(async () => {
        if (!sourceCourse || !subject) return;
        setLoading(true);
        setChapters([]);
        setSelectedChapters([]);
        setPreviewData(null);
        try {
            const res = await axiosInstance.get(`/mcq/chapter-management/chapters?course=${sourceCourse}&subject=${subject}`);
            setChapters(res.data);
        } catch (error) {
            enqueueSnackbar('Failed to fetch chapters', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    }, [sourceCourse, subject, enqueueSnackbar]);

    useEffect(() => {
        if (sourceCourse && subject) {
            fetchChapters();
        }
    }, [sourceCourse, subject, fetchChapters]);

    // Auto-set target course when source is selected
    useEffect(() => {
        if (sourceCourse) {
            setTargetCourse(sourceCourse === 'mdcat' ? 'nums' : 'mdcat');
        }
    }, [sourceCourse]);

    // Toggle chapter selection
    const handleChapterToggle = (chapterName) => {
        setSelectedChapters(prev =>
            prev.includes(chapterName)
                ? prev.filter(c => c !== chapterName)
                : [...prev, chapterName]
        );
        // Reset preview when selection changes
        setPreviewData(null);
    };

    const handleSelectAll = () => {
        if (selectedChapters.length === chapters.length) {
            setSelectedChapters([]);
        } else {
            setSelectedChapters(chapters.map(c => c.chapter));
        }
        setPreviewData(null);
    };

    // Fetch preview
    const fetchPreview = async () => {
        if (!selectedChapters.length) {
            enqueueSnackbar('Please select at least one chapter', { variant: 'warning' });
            return;
        }
        setLoading(true);
        try {
            const res = await axiosInstance.post('/mcq/chapter-management/preview', {
                sourceCourse,
                targetCourse,
                subject,
                chapters: selectedChapters
            });
            setPreviewData(res.data);
            setActiveStep(2);
        } catch (error) {
            enqueueSnackbar(error.response?.data?.message || 'Failed to load preview', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    // Execute move/copy
    const executeOperation = async () => {
        setExecuting(true);
        setConfirmOpen(false);
        try {
            const res = await axiosInstance.post('/mcq/chapter-management/execute', {
                sourceCourse,
                targetCourse,
                subject,
                chapters: selectedChapters,
                mode
            });
            setResult(res.data);
            enqueueSnackbar(res.data.message, { variant: 'success', autoHideDuration: 4000 });
        } catch (error) {
            enqueueSnackbar(error.response?.data?.message || 'Operation failed', { variant: 'error' });
        } finally {
            setExecuting(false);
        }
    };

    // Reset form
    const handleReset = () => {
        setSourceCourse('');
        setTargetCourse('');
        setSubject('');
        setMode('move');
        setChapters([]);
        setSelectedChapters([]);
        setPreviewData(null);
        setResult(null);
        setActiveStep(0);
    };

    const canProceedToStep2 = sourceCourse && targetCourse && subject && sourceCourse !== targetCourse;
    const canProceedToStep3 = selectedChapters.length > 0;

    // Step 1: Configure
    const renderConfigStep = () => (
        <Card elevation={2} sx={{ mb: 3 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SwapHoriz color="primary" /> Configuration
                </Typography>
                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                    {/* Source Course */}
                    <Grid item xs={12} md={5}>
                        <FormControl fullWidth>
                            <InputLabel>Source Course</InputLabel>
                            <Select
                                value={sourceCourse}
                                label="Source Course"
                                onChange={(e) => {
                                    setSourceCourse(e.target.value);
                                    setSelectedChapters([]);
                                    setPreviewData(null);
                                    setResult(null);
                                }}
                            >
                                {courses.map(c => (
                                    <MenuItem key={c} value={c}>
                                        {c.toUpperCase()}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Arrow */}
                    <Grid item xs={12} md={2} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <ArrowForward sx={{ fontSize: 32, color: 'primary.main' }} />
                    </Grid>

                    {/* Target Course */}
                    <Grid item xs={12} md={5}>
                        <FormControl fullWidth>
                            <InputLabel>Target Course</InputLabel>
                            <Select
                                value={targetCourse}
                                label="Target Course"
                                onChange={(e) => {
                                    setTargetCourse(e.target.value);
                                    setPreviewData(null);
                                    setResult(null);
                                }}
                            >
                                {courses.filter(c => c !== sourceCourse).map(c => (
                                    <MenuItem key={c} value={c}>
                                        {c.toUpperCase()}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Subject */}
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Subject</InputLabel>
                            <Select
                                value={subject}
                                label="Subject"
                                onChange={(e) => {
                                    setSubject(e.target.value);
                                    setSelectedChapters([]);
                                    setPreviewData(null);
                                    setResult(null);
                                }}
                            >
                                {subjects.map(s => (
                                    <MenuItem key={s} value={s}>
                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Mode */}
                    <Grid item xs={12} md={6}>
                        <FormControl component="fieldset">
                            <FormLabel component="legend">Operation Mode</FormLabel>
                            <RadioGroup
                                row
                                value={mode}
                                onChange={(e) => setMode(e.target.value)}
                            >
                                <FormControlLabel
                                    value="move"
                                    control={<Radio />}
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <DriveFileMove fontSize="small" /> Move
                                        </Box>
                                    }
                                />
                                <FormControlLabel
                                    value="copy"
                                    control={<Radio />}
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <ContentCopy fontSize="small" /> Copy
                                        </Box>
                                    }
                                />
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                </Grid>

                {/* Mode explanation */}
                <Alert severity="info" sx={{ mt: 2 }}>
                    {mode === 'move'
                        ? `Move will transfer MCQs from ${sourceCourse?.toUpperCase() || '___'} to ${targetCourse?.toUpperCase() || '___'}. The MCQs will no longer exist in the source course.`
                        : `Copy will duplicate MCQs from ${sourceCourse?.toUpperCase() || '___'} to ${targetCourse?.toUpperCase() || '___'}. The original MCQs will remain unchanged.`
                    }
                </Alert>

                {sourceCourse === targetCourse && sourceCourse && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        Source and target course cannot be the same.
                    </Alert>
                )}

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        variant="contained"
                        onClick={() => setActiveStep(1)}
                        disabled={!canProceedToStep2}
                        endIcon={<ArrowForward />}
                    >
                        Next: Select Chapters
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );

    // Step 2: Select chapters
    const renderChapterStep = () => (
        <Card elevation={2} sx={{ mb: 3 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DriveFileMove color="primary" /> Select Chapters to {mode === 'move' ? 'Move' : 'Copy'}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    {sourceCourse?.toUpperCase()} → {targetCourse?.toUpperCase()} | Subject: {subject?.charAt(0).toUpperCase() + subject?.slice(1)}
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : chapters.length === 0 ? (
                    <Alert severity="warning">
                        No chapters found for {subject} in {sourceCourse?.toUpperCase()}.
                    </Alert>
                ) : (
                    <>
                        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Button size="small" onClick={handleSelectAll}>
                                {selectedChapters.length === chapters.length ? 'Deselect All' : 'Select All'}
                            </Button>
                            <Chip
                                label={`${selectedChapters.length} / ${chapters.length} selected`}
                                color={selectedChapters.length > 0 ? 'primary' : 'default'}
                                size="small"
                            />
                        </Box>

                        <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                indeterminate={selectedChapters.length > 0 && selectedChapters.length < chapters.length}
                                                checked={selectedChapters.length === chapters.length && chapters.length > 0}
                                                onChange={handleSelectAll}
                                            />
                                        </TableCell>
                                        <TableCell><strong>Chapter Name</strong></TableCell>
                                        <TableCell align="right"><strong>MCQs Count</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {chapters.map((ch) => (
                                        <TableRow
                                            key={ch.chapter}
                                            hover
                                            onClick={() => handleChapterToggle(ch.chapter)}
                                            sx={{ cursor: 'pointer' }}
                                            selected={selectedChapters.includes(ch.chapter)}
                                        >
                                            <TableCell padding="checkbox">
                                                <Checkbox checked={selectedChapters.includes(ch.chapter)} />
                                            </TableCell>
                                            <TableCell>
                                                {ch.chapter.charAt(0).toUpperCase() + ch.chapter.slice(1)}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Chip label={ch.count} size="small" variant="outlined" />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {selectedChapters.length > 0 && (
                            <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                                <Typography variant="body2">
                                    <strong>Total MCQs to {mode}:</strong>{' '}
                                    {chapters
                                        .filter(c => selectedChapters.includes(c.chapter))
                                        .reduce((sum, c) => sum + c.count, 0)}
                                </Typography>
                            </Box>
                        )}
                    </>
                )}

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                    <Button onClick={() => setActiveStep(0)}>
                        Back
                    </Button>
                    <Button
                        variant="contained"
                        onClick={fetchPreview}
                        disabled={!canProceedToStep3 || loading}
                        endIcon={loading ? <CircularProgress size={16} /> : <Preview />}
                    >
                        Preview
                    </Button>
                </Box>
            </CardContent>
        </Card>
    );

    // Step 3: Preview & Confirm
    const renderPreviewStep = () => (
        <Card elevation={2} sx={{ mb: 3 }}>
            <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Preview color="primary" /> Preview & Confirm
                </Typography>
                <Divider sx={{ mb: 2 }} />

                {result ? (
                    <Box>
                        <Alert severity="success" sx={{ mb: 2 }} icon={<CheckCircle />}>
                            <Typography variant="subtitle1" fontWeight="bold">
                                Operation Completed Successfully!
                            </Typography>
                            <Typography variant="body2">{result.message}</Typography>
                        </Alert>
                        <Button variant="contained" onClick={handleReset}>
                            Start New Operation
                        </Button>
                    </Box>
                ) : previewData ? (
                    <>
                        {/* Summary */}
                        <Alert severity={mode === 'move' ? 'warning' : 'info'} sx={{ mb: 3 }}>
                            <Typography variant="subtitle2">
                                {mode === 'move' ? '⚠️ Move Operation' : '📋 Copy Operation'} — {previewData.totalMcqs} MCQs
                            </Typography>
                            <Typography variant="body2">
                                {mode === 'move'
                                    ? `${previewData.totalMcqs} MCQs will be moved from ${sourceCourse.toUpperCase()} to ${targetCourse.toUpperCase()}. They will be removed from ${sourceCourse.toUpperCase()}.`
                                    : `${previewData.totalMcqs} MCQs will be copied from ${sourceCourse.toUpperCase()} to ${targetCourse.toUpperCase()}. Originals remain unchanged.`
                                }
                            </Typography>
                        </Alert>

                        {/* Chapter breakdown */}
                        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell><strong>Chapter</strong></TableCell>
                                        <TableCell align="right"><strong>MCQs in Source</strong></TableCell>
                                        <TableCell align="right"><strong>Already in Target</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {previewData.chapterCounts.map(ch => {
                                        const existing = previewData.existingInTarget.find(e => e.chapter === ch.chapter);
                                        return (
                                            <TableRow key={ch.chapter}>
                                                <TableCell>
                                                    {ch.chapter.charAt(0).toUpperCase() + ch.chapter.slice(1)}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Chip label={ch.count} size="small" color="primary" variant="outlined" />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Chip
                                                        label={existing ? existing.count : 0}
                                                        size="small"
                                                        color={existing ? 'warning' : 'default'}
                                                        variant="outlined"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        {previewData.existingInTarget.length > 0 && (
                            <Alert severity="warning" sx={{ mb: 2 }} icon={<Warning />}>
                                Some chapters already have MCQs in {targetCourse.toUpperCase()}.
                                {mode === 'copy'
                                    ? ' Copying will add duplicate MCQs alongside existing ones.'
                                    : ' Moving will add these MCQs alongside the existing ones.'
                                }
                            </Alert>
                        )}

                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                            <Button onClick={() => setActiveStep(1)}>
                                Back
                            </Button>
                            <Button
                                variant="contained"
                                color={mode === 'move' ? 'warning' : 'primary'}
                                onClick={() => setConfirmOpen(true)}
                                disabled={executing}
                                startIcon={executing ? <CircularProgress size={16} /> : <PlayArrow />}
                            >
                                {mode === 'move' ? 'Move' : 'Copy'} {previewData.totalMcqs} MCQs
                            </Button>
                        </Box>
                    </>
                ) : (
                    <Alert severity="info">Loading preview...</Alert>
                )}
            </CardContent>
        </Card>
    );

    return (
        <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 900, mx: 'auto' }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Chapter Management
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Move or copy chapters (with all their MCQs) between courses.
                </Typography>
            </Box>

            {/* Stepper */}
            <Stepper activeStep={activeStep} sx={{ mb: 4 }} alternativeLabel>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            {/* Content based on step */}
            {activeStep === 0 && renderConfigStep()}
            {activeStep === 1 && renderChapterStep()}
            {activeStep === 2 && renderPreviewStep()}

            {/* Confirmation Dialog */}
            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <DialogTitle>
                    {mode === 'move' ? '⚠️ Confirm Move' : 'Confirm Copy'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {mode === 'move'
                            ? `Are you sure you want to MOVE ${previewData?.totalMcqs} MCQs from ${sourceCourse?.toUpperCase()} to ${targetCourse?.toUpperCase()}? This action will remove these MCQs from ${sourceCourse?.toUpperCase()}.`
                            : `Are you sure you want to COPY ${previewData?.totalMcqs} MCQs from ${sourceCourse?.toUpperCase()} to ${targetCourse?.toUpperCase()}?`
                        }
                    </DialogContentText>
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            <strong>Subject:</strong> {subject?.charAt(0).toUpperCase() + subject?.slice(1)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            <strong>Chapters:</strong> {selectedChapters.join(', ')}
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
                    <Button
                        onClick={executeOperation}
                        variant="contained"
                        color={mode === 'move' ? 'warning' : 'primary'}
                        disabled={executing}
                    >
                        {executing ? <CircularProgress size={20} /> : `Yes, ${mode === 'move' ? 'Move' : 'Copy'} them`}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ChapterManagement;
