import { useState } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import { FormControl, InputLabel, Select, MenuItem, Grid, Button, TextField, Chip, Box } from '@mui/material';

import TableNoData from '../table-no-data';
import UserTableRow from '../user-table-row';
import UserTableHead from '../user-table-head';
import TableEmptyRows from '../table-empty-rows';
import UserTableToolbar from '../user-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';
import { useEffect } from 'react';
import axios from 'axios';
import axiosInstance from '../../../../baseUrl';
import { QuestionAnswer, SelectAll, Warning } from '@mui/icons-material';
import { Spinner } from 'react-bootstrap';

// ----------------------------------------------------------------------

export default function UserPage() {
  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [rowsPerPage, setRowsPerPage] = useState(150);
  const [mcqs, setMcqs] = useState([]);
  const [reload, setReload] = useState(false);
  const [filteredIds, setFilteredIds] = useState([]);

  const [fetchPage, setFetchpage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [loading, setLoading] = useState(false);

  // Filter states
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [availableChapters, setAvailableChapters] = useState([]);
  const [availableTopics, setAvailableTopics] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Build query parameters
        const params = new URLSearchParams({ page: fetchPage });
        if (selectedSubject) params.append('subject', selectedSubject);
        if (selectedChapter) params.append('chapter', selectedChapter);
        if (selectedCourse) params.append('course', selectedCourse);
        if (selectedTopic) params.append('topic', selectedTopic);
        if (searchQuery) params.append('question', searchQuery);

        console.log('Fetching MCQs with params:', params.toString());
        
        // Use search endpoint if there's a search query, otherwise use pages endpoint
        const endpoint = searchQuery ? '/mcq/search' : '/mcq/pages';
        const response = await axiosInstance.get(`${endpoint}?${params.toString()}`);
        
        console.log('Response:', response.data);
        setMcqs(response.data.mcqs);
        setTotalPages(response.data.totalPages);
        setTotalCount(response.data.totalCount || 0);
        
        // Update available filter options (only from pages endpoint)
        if (response.data.filters) {
          setAvailableSubjects(response.data.filters.subjects || []);
          setAvailableChapters(response.data.filters.chapters || []);
          setAvailableTopics(response.data.filters.topics || []);
        }
        
        // Reset table page to first page
        setPage(0);
        
        setLoading(false)
      } catch (error) {
        console.error('Error fetching MCQs:', error);
        setLoading(false)
      }
    }
    fetchData();
  }, [reload, fetchPage, selectedSubject, selectedChapter, selectedCourse, selectedTopic, searchQuery]);

  const HandleSearch = async (e) => {
    e.preventDefault();
    const searchQuestion = e.target.form[0].value;
    setSearchQuery(searchQuestion);
    setFetchpage(1); // Reset to first page when searching
  }

  const HandleClearSearch = () => {
    setSearchQuery('');
    setFetchpage(1);
  }


  const handleSort = (event, id) => {
    const isAsc = orderBy === id && order === 'asc';
    if (id !== '') {
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    }
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = mcqs.map((n) => n._id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  // No client-side filtering - we now use backend filtering
  const dataFiltered = mcqs;
  
  const notFound = !dataFiltered.length && (searchQuery || selectedSubject || selectedChapter || selectedCourse);



  return (
    <Container style={{ padding: 0 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <div>
          <Typography variant="h4" className='fw-bold text-primary'>MCQ'S <QuestionAnswer fontSize='44' /></Typography>
          {totalCount > 0 && (
            <Typography variant="body2" color="text.secondary">
              Showing {totalCount} MCQ{totalCount !== 1 ? 's' : ''} 
              {searchQuery && ` matching "${searchQuery}"`}
              {(selectedSubject || selectedChapter || selectedCourse) && ' with filters applied'}
            </Typography>
          )}
        </div>
      </Stack>
      <p>1: You can Select Option and Delete Single or Multiple Options</p>
      <p>2: Deletion Paramently <Warning color='error' /></p>
      <p>2: In every Page 500 McQ Fetch For next 500 Select Next Page in drop down<SelectAll color='success' /></p>
      <p>3: You can Search McQ's By Question from Database</p>

      <form>
        <hr />
        <div className="d-flex gap-2">
          <input 
            type="text" 
            className='form-control' 
            placeholder="Search By Question from Database" 
            defaultValue={searchQuery}
          />
          <button onClick={HandleSearch} type='submit' className='btn btn-info'>Search</button>
          {searchQuery && (
            <button onClick={HandleClearSearch} type='button' className='btn btn-outline-secondary'>Clear</button>
          )}
        </div>
      </form>
      <br />

      {/* Filter Section */}
      <Card sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Filters</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Course</InputLabel>
              <Select
                value={selectedCourse}
                label="Course"
                onChange={(e) => {
                  setSelectedCourse(e.target.value);
                  setFetchpage(1);
                }}
              >
                <MenuItem value="">All Courses</MenuItem>
                <MenuItem value="mdcat">MDCAT</MenuItem>
                <MenuItem value="nums">NUMS</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Subject</InputLabel>
              <Select
                value={selectedSubject}
                label="Subject"
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setSelectedChapter('');
                  setSelectedTopic('');
                  setFetchpage(1);
                }}
              >
                <MenuItem value="">All Subjects</MenuItem>
                <MenuItem value="biology">Biology</MenuItem>
                <MenuItem value="chemistry">Chemistry</MenuItem>
                <MenuItem value="physics">Physics</MenuItem>
                <MenuItem value="english">English</MenuItem>
                <MenuItem value="logic">Logic</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Chapter Name"
              placeholder="Enter chapter name"
              value={selectedChapter}
              onChange={(e) => {
                setSelectedChapter(e.target.value);
                setSelectedTopic('');
                setFetchpage(1);
              }}
              disabled={!selectedSubject}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Topic"
              placeholder="Enter topic name"
              value={selectedTopic}
              onChange={(e) => {
                setSelectedTopic(e.target.value);
                setFetchpage(1);
              }}
              disabled={!selectedChapter}
            />
          </Grid>
        </Grid>

        {/* Active Filters Display */}
        {(selectedCourse || selectedSubject || selectedChapter || selectedTopic || searchQuery) && (
          <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 1 }}>Active Filters:</Typography>
            {searchQuery && (
              <Chip 
                label={`Search: "${searchQuery}"`} 
                onDelete={() => {
                  setSearchQuery('');
                  setFetchpage(1);
                }} 
                color="primary" 
                size="small"
              />
            )}
            {selectedCourse && (
              <Chip 
                label={`Course: ${selectedCourse.toUpperCase()}`} 
                onDelete={() => {
                  setSelectedCourse('');
                  setFetchpage(1);
                }} 
                size="small"
              />
            )}
            {selectedSubject && (
              <Chip 
                label={`Subject: ${selectedSubject}`} 
                onDelete={() => {
                  setSelectedSubject('');
                  setSelectedChapter('');
                  setSelectedTopic('');
                  setFetchpage(1);
                }} 
                size="small"
              />
            )}
            {selectedChapter && (
              <Chip 
                label={`Chapter: ${selectedChapter}`} 
                onDelete={() => {
                  setSelectedChapter('');
                  setSelectedTopic('');
                  setFetchpage(1);
                }} 
                size="small"
              />
            )}
            {selectedTopic && (
              <Chip 
                label={`Topic: ${selectedTopic}`} 
                onDelete={() => {
                  setSelectedTopic('');
                  setFetchpage(1);
                }} 
                size="small"
              />
            )}
          </Box>
        )}

        <Button 
          variant="outlined" 
          sx={{ mt: 2 }}
          onClick={() => {
            setSelectedCourse('');
            setSelectedSubject('');
            setSelectedChapter('');
            setSelectedTopic('');
            setSearchQuery('');
            setFetchpage(1);
          }}
        >
          Clear All Filters
        </Button>
      </Card>

      <Card>
        <UserTableToolbar
          numSelected={selected.length}
          selectedId={selected}
          handleReload={() => setReload(!reload)}
          totalPages={totalPages}
          fetchPage={fetchPage}
          setFetchpage={setFetchpage}
        />

        <TableContainer sx={{ overflowX: 'scroll' }}>
          <Table sx={{ minWidth: 800 }}  >
            <UserTableHead

              order={order}
              orderBy={orderBy}
              rowCount={mcqs.length}
              numSelected={selected.length}
              onRequestSort={handleSort}
              onSelectAllClick={handleSelectAllClick}
              headLabel={[
                { id: 'question', label: 'Question' },
                { id: 'option 1', label: 'op 1' },
                { id: 'option 2', label: 'op 2' },
                { id: 'option 3', label: 'op 3' },
                { id: 'option 4', label: 'op 4' },
                { id: 'correct', label: 'Correct' },
                { id: 'course', label: 'Course' },
                { id: 'subject', label: 'Subject' },
                { id: 'chapter', label: 'Chapter' },
                { id: 'topic', label: 'Topic' },
                { id: 'mcqInfo', label: 'mcqInfo' },
                { id: 'isImage', label: 'Images' },
                { id: '' },
              ]}
            />
            {
              loading ? <div className="container py-5 text-center"><Spinner variant='primary' /></div> :
                <TableBody  >
                  {dataFiltered
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row, index) => (
                      <UserTableRow
                        key={row._id}
                        question={row.question}
                        option1={row.options[0]}
                        option2={row.options[1]}
                        option3={row.options[2]}
                        option4={row.options[3]}
                        correct={row.correctOption}
                        course={row.course}
                        subject={row.subject}
                        chapter={row.chapter}
                        chapTopic={row.topic}
                        isImage={row.imageUrl}
                        questionImg={row.questionImg}
                        mcqInfo={row.info}
                        mcqExplain={row.explain}
                        totalMcqs={dataFiltered}

                        selected={selected.indexOf(row._id) !== -1}
                        handleClick={(event) => handleClick(event, row._id)}
                        index={index}
                        userId={row._id}
                        handleReload={() => setReload(!reload)}

                      />
                    ))}

                  <TableEmptyRows
                    height={77}
                    emptyRows={emptyRows(page, rowsPerPage, mcqs.length)}
                  />

                  {notFound && <TableNoData query={searchQuery || 'with current filters'} />}
                </TableBody>
            }
          </Table>
        </TableContainer>

        <TablePagination
          page={page}
          component="div"
          count={mcqs.length}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[50, 150, 350, 500]}
          onRowsPerPageChange={handleChangeRowsPerPage}

        />
      </Card>
    </Container>
  );
}
