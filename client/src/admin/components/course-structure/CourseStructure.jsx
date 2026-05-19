import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Card, CardContent, Typography, Button, TextField,
    Chip, Divider, Tab, Tabs, CircularProgress, IconButton,
    List, ListItem, ListItemText, ListItemSecondaryAction, Alert,
    Tooltip,
} from '@mui/material';
import { Add, Delete, School, MenuBook, Refresh } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import axiosInstance from '../../../baseUrl';

const COURSES = ['mdcat', 'nums'];

const CourseStructure = () => {
    const { enqueueSnackbar } = useSnackbar();

    const [selectedCourse, setSelectedCourse] = useState('mdcat');
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [chapters, setChapters] = useState([]);

    const [loadingSubjects, setLoadingSubjects] = useState(false);
    const [loadingChapters, setLoadingChapters] = useState(false);
    const [addingSubject, setAddingSubject] = useState(false);
    const [addingChapter, setAddingChapter] = useState(false);

    const [newSubject, setNewSubject] = useState('');
    const [newChapter, setNewChapter] = useState('');

    // ─── Fetch subjects when course changes ───────────────────────────────────
    const fetchSubjects = useCallback(async () => {
        setLoadingSubjects(true);
        setSubjects([]);
        setSelectedSubject('');
        setChapters([]);
        try {
            const res = await axiosInstance.get(`/course-structure/${selectedCourse}/subjects`);
            setSubjects(res.data);
            if (res.data.length > 0) setSelectedSubject(res.data[0]);
        } catch {
            enqueueSnackbar('Failed to load subjects', { variant: 'error' });
        } finally {
            setLoadingSubjects(false);
        }
    }, [selectedCourse, enqueueSnackbar]);

    // ─── Fetch chapters when subject changes ──────────────────────────────────
    const fetchChapters = useCallback(async () => {
        if (!selectedSubject) return;
        setLoadingChapters(true);
        try {
            const res = await axiosInstance.get(
                `/course-structure/${selectedCourse}/subjects/${encodeURIComponent(selectedSubject)}/chapters`
            );
            setChapters(res.data);
        } catch {
            enqueueSnackbar('Failed to load chapters', { variant: 'error' });
        } finally {
            setLoadingChapters(false);
        }
    }, [selectedCourse, selectedSubject, enqueueSnackbar]);

    useEffect(() => { fetchSubjects(); }, [fetchSubjects]);
    useEffect(() => { fetchChapters(); }, [fetchChapters]);

    // ─── Subject actions ──────────────────────────────────────────────────────
    const handleAddSubject = async () => {
        if (!newSubject.trim()) return;
        setAddingSubject(true);
        try {
            const res = await axiosInstance.post(
                `/course-structure/${selectedCourse}/subjects`,
                { name: newSubject.trim() }
            );
            enqueueSnackbar(res.data.message, { variant: 'success' });
            setNewSubject('');
            fetchSubjects();
        } catch (e) {
            enqueueSnackbar(e.response?.data?.message || 'Failed to add subject', { variant: 'error' });
        } finally {
            setAddingSubject(false);
        }
    };

    const handleDeleteSubject = async (name) => {
        try {
            await axiosInstance.delete(
                `/course-structure/${selectedCourse}/subjects/${encodeURIComponent(name)}`
            );
            enqueueSnackbar(`Subject "${name}" removed`, { variant: 'success' });
            fetchSubjects();
        } catch (e) {
            enqueueSnackbar(e.response?.data?.message || 'Failed to remove subject', { variant: 'error' });
        }
    };

    // ─── Chapter actions ──────────────────────────────────────────────────────
    const handleAddChapter = async () => {
        if (!newChapter.trim() || !selectedSubject) return;
        setAddingChapter(true);
        try {
            const res = await axiosInstance.post(
                `/course-structure/${selectedCourse}/subjects/${encodeURIComponent(selectedSubject)}/chapters`,
                { name: newChapter.trim() }
            );
            enqueueSnackbar(res.data.message, { variant: 'success' });
            setNewChapter('');
            fetchChapters();
        } catch (e) {
            enqueueSnackbar(e.response?.data?.message || 'Failed to add chapter', { variant: 'error' });
        } finally {
            setAddingChapter(false);
        }
    };

    const handleDeleteChapter = async (name) => {
        try {
            await axiosInstance.delete(
                `/course-structure/${selectedCourse}/subjects/${encodeURIComponent(selectedSubject)}/chapters/${encodeURIComponent(name)}`
            );
            enqueueSnackbar(`Chapter "${name}" removed`, { variant: 'success' });
            fetchChapters();
        } catch (e) {
            enqueueSnackbar(e.response?.data?.message || 'Failed to remove chapter', { variant: 'error' });
        }
    };

    const cap = str => str.charAt(0).toUpperCase() + str.slice(1);

    return (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <School color="primary" sx={{ fontSize: 32 }} />
                <Typography variant="h4" fontWeight="bold" color="primary">
                    Course Structure
                </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Manage which subjects and chapters appear for each course.
                Changes reflect immediately across the student dashboard and MCQ forms.
            </Typography>

            {/* Course Tabs */}
            <Tabs
                value={selectedCourse}
                onChange={(_, v) => setSelectedCourse(v)}
                sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
            >
                {COURSES.map(c => (
                    <Tab key={c} label={c.toUpperCase()} value={c} />
                ))}
            </Tabs>

            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'flex-start' }}>

                {/* ── Subjects panel ─────────────────────────────────────────── */}
                <Card sx={{ flex: '1 1 260px', maxWidth: 340 }} elevation={3}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <MenuBook color="primary" fontSize="small" /> Subjects
                            </Typography>
                            <Tooltip title="Refresh">
                                <IconButton size="small" onClick={fetchSubjects}>
                                    <Refresh fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Box>
                        <Divider sx={{ mb: 2 }} />

                        {loadingSubjects ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                                <CircularProgress size={24} />
                            </Box>
                        ) : (
                            <List dense disablePadding>
                                {subjects.map(sub => (
                                    <ListItem
                                        key={sub}
                                        button
                                        selected={selectedSubject === sub}
                                        onClick={() => setSelectedSubject(sub)}
                                        sx={{
                                            borderRadius: 1,
                                            mb: 0.5,
                                            bgcolor: selectedSubject === sub ? 'primary.main' : 'transparent',
                                            color: selectedSubject === sub ? 'primary.contrastText' : 'text.primary',
                                            '&:hover': {
                                                bgcolor: selectedSubject === sub ? 'primary.dark' : 'action.hover',
                                            },
                                        }}
                                    >
                                        <ListItemText
                                            primary={cap(sub)}
                                            primaryTypographyProps={{
                                                fontWeight: selectedSubject === sub ? 'bold' : 'normal',
                                                fontSize: 14,
                                            }}
                                        />
                                        <ListItemSecondaryAction>
                                            <Tooltip title="Remove subject">
                                                <IconButton
                                                    size="small"
                                                    color={selectedSubject === sub ? 'inherit' : 'error'}
                                                    onClick={e => { e.stopPropagation(); handleDeleteSubject(sub); }}
                                                >
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                                {subjects.length === 0 && !loadingSubjects && (
                                    <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                                        No subjects yet
                                    </Typography>
                                )}
                            </List>
                        )}

                        <Divider sx={{ my: 2 }} />

                        {/* Add subject */}
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <TextField
                                size="small"
                                placeholder="New subject name"
                                value={newSubject}
                                onChange={e => setNewSubject(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleAddSubject()}
                                fullWidth
                            />
                            <Button
                                variant="contained"
                                size="small"
                                onClick={handleAddSubject}
                                disabled={!newSubject.trim() || addingSubject}
                                sx={{ minWidth: 40, px: 1 }}
                            >
                                {addingSubject ? <CircularProgress size={16} color="inherit" /> : <Add />}
                            </Button>
                        </Box>
                    </CardContent>
                </Card>

                {/* ── Chapters panel ─────────────────────────────────────────── */}
                <Card sx={{ flex: '2 1 380px' }} elevation={3}>
                    <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                Chapters
                                {selectedSubject && (
                                    <Chip label={cap(selectedSubject)} color="primary" size="small" />
                                )}
                            </Typography>
                            {selectedSubject && (
                                <Tooltip title="Refresh">
                                    <IconButton size="small" onClick={fetchChapters}>
                                        <Refresh fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Box>
                        <Divider sx={{ mb: 2 }} />

                        {!selectedSubject ? (
                            <Alert severity="info" sx={{ mb: 2 }}>
                                Select a subject on the left to manage its chapters.
                            </Alert>
                        ) : loadingChapters ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                <CircularProgress size={28} />
                            </Box>
                        ) : (
                            <>
                                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                                    {chapters.length} chapter{chapters.length !== 1 ? 's' : ''}
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2, maxHeight: 320, overflowY: 'auto' }}>
                                    {chapters.map((ch, idx) => (
                                        <Chip
                                            key={ch}
                                            label={`${idx + 1}. ${ch}`}
                                            onDelete={() => handleDeleteChapter(ch)}
                                            variant="outlined"
                                            color="primary"
                                            size="small"
                                            sx={{ textTransform: 'capitalize', fontSize: 12 }}
                                        />
                                    ))}
                                    {chapters.length === 0 && (
                                        <Typography variant="body2" color="text.secondary">
                                            No chapters yet. Add one below.
                                        </Typography>
                                    )}
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                {/* Add chapter */}
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <TextField
                                        size="small"
                                        placeholder="New chapter name (e.g. optics)"
                                        value={newChapter}
                                        onChange={e => setNewChapter(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleAddChapter()}
                                        fullWidth
                                    />
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={handleAddChapter}
                                        disabled={!newChapter.trim() || addingChapter}
                                        sx={{ minWidth: 40, px: 1 }}
                                    >
                                        {addingChapter ? <CircularProgress size={16} color="inherit" /> : <Add />}
                                    </Button>
                                </Box>
                            </>
                        )}
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};

export default CourseStructure;
