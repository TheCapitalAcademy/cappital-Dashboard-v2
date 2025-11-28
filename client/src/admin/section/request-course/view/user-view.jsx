import { useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import { Select, MenuItem, FormControl, InputLabel, Box, Grid, Menu, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import TableNoData from '../table-no-data';
import UserTableRow from '../user-table-row';
import UserTableHead from '../user-table-head';
import TableEmptyRows from '../table-empty-rows';
import UserTableToolbar from '../user-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';
import axios from 'axios';
import { VerifiedUser } from '@mui/icons-material';
import axiosInstance from '../../../../baseUrl';

// ----------------------------------------------------------------------

export default function UserPage() {
  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('desc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('date');
  const [filterName, setFilterName] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [users, setUsers] = useState([]);
  const [reload, setReload] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState('');

  const [yearAnchorEl, setYearAnchorEl] = useState(null);
  const [monthAnchorEl, setMonthAnchorEl] = useState(null);
  const [dayAnchorEl, setDayAnchorEl] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const response = await axiosInstance.get('/purchase');
      setUsers(response.data);
    };
    fetchData();
  }, [reload]);

  const handleSort = (event, id) => {
    const isAsc = orderBy === id && order === 'asc';
    if (id !== '') {
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    }
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = users.map((n) => n.id);
      setSelected(newSelecteds);
      console.log(newSelecteds)
      return;
    }
    setSelected([]);
  };


  //handling the event generated.
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

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const handleYearChange = (year) => {
    setPage(0);
    setSelectedYear(year);
    setSelectedMonth('');
    setSelectedDay('');
    setYearAnchorEl(null);
  };

  const handleMonthChange = (month) => {
    setPage(0);
    setSelectedMonth(month);
    setSelectedDay('');
    setMonthAnchorEl(null);
  };

  const handleDayChange = (day) => {
    setPage(0);
    setSelectedDay(day);
    setDayAnchorEl(null);
  };

  const availableYears = [...new Set(users.map((user) => new Date(user.date).getFullYear()))].sort(
    (a, b) => b - a
  );

  const availableMonths = selectedYear
    ? [
        ...new Set(
          users
            .filter((user) => new Date(user.date).getFullYear() === selectedYear)
            .map((user) => new Date(user.date).getMonth())
        ),
      ].sort((a, b) => a - b)
    : [];

  const availableDays = selectedYear && selectedMonth !== ''
    ? [
        ...new Set(
          users
            .filter((user) => {
              const d = new Date(user.date);
              return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
            })
            .map((user) => new Date(user.date).getDate())
        ),
      ].sort((a, b) => a - b)
    : [];

  const filteredData = users.filter((user) => {
    const date = new Date(user.date);
    const yearMatches = selectedYear ? date.getFullYear() === selectedYear : true;
    const monthMatches = selectedMonth !== '' ? date.getMonth() === selectedMonth : true;
    const dayMatches = selectedDay ? date.getDate() === selectedDay : true;
    return yearMatches && monthMatches && dayMatches;
  });

  const dataFiltered = applyFilter({
    inputData: filteredData,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const notFound = !dataFiltered.length && !!filterName;

  return (
    <Container maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }} className='fw-bold text-success'>
          Course Request Users <VerifiedUser fontSize='33'/> 
        </Typography>
      </Stack>

      <Grid container spacing={2} mb={5}>
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              p: 3,
              bgcolor: 'primary.main',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 3,
              color: 'common.white'
            }}
          >
            <Box 
              onClick={() => {
                setSelectedYear(new Date().getFullYear());
                setSelectedMonth('');
                setSelectedDay('');
              }}
              sx={{ flexGrow: 1, cursor: 'pointer' }}
            >
              <Typography variant="h6" sx={{ color: 'inherit' }}>
                {selectedYear || "Year"}
              </Typography>
            </Box>
            <IconButton onClick={(e) => setYearAnchorEl(e.currentTarget)}>
              <ExpandMoreIcon sx={{ color: 'inherit' }} />
            </IconButton>
            <Menu
              anchorEl={yearAnchorEl}
              open={Boolean(yearAnchorEl)}
              onClose={() => setYearAnchorEl(null)}
            >
              <MenuItem onClick={() => handleYearChange('')}>
                <em>All</em>
              </MenuItem>
              {availableYears.map((year) => (
                <MenuItem key={year} onClick={() => handleYearChange(year)}>
                  {year}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box
            sx={{
              p: 3,
              bgcolor: 'info.main',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 3,
              color: 'common.white',
              opacity: !selectedYear ? 0.5 : 1,
              pointerEvents: !selectedYear ? 'none' : 'auto'
            }}
          >
            <Box 
              onClick={() => {
                if (selectedYear) {
                    setSelectedMonth(new Date().getMonth());
                    setSelectedDay('');
                }
              }}
              sx={{ flexGrow: 1, cursor: 'pointer' }}
            >
              <Typography variant="h6" sx={{ color: 'inherit' }}>
                {selectedMonth !== '' ? new Date(0, selectedMonth).toLocaleString('default', { month: 'long' }) : "Month"}
              </Typography>
            </Box>
            <IconButton onClick={(e) => setMonthAnchorEl(e.currentTarget)} disabled={!selectedYear}>
              <ExpandMoreIcon sx={{ color: 'inherit' }} />
            </IconButton>
            <Menu
              anchorEl={monthAnchorEl}
              open={Boolean(monthAnchorEl)}
              onClose={() => setMonthAnchorEl(null)}
            >
              <MenuItem onClick={() => handleMonthChange('')}>
                <em>All</em>
              </MenuItem>
              {availableMonths.map((month) => (
                <MenuItem key={month} onClick={() => handleMonthChange(month)}>
                  {new Date(0, month).toLocaleString('default', { month: 'long' })}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box
            sx={{
              p: 3,
              bgcolor: 'success.main',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: 3,
              color: 'common.white',
              opacity: (!selectedYear || selectedMonth === '') ? 0.5 : 1,
              pointerEvents: (!selectedYear || selectedMonth === '') ? 'none' : 'auto'
            }}
          >
            <Box 
              onClick={() => {
                if (selectedYear && selectedMonth !== '') {
                    setSelectedDay(new Date().getDate());
                }
              }}
              sx={{ flexGrow: 1, cursor: 'pointer' }}
            >
              <Typography variant="h6" sx={{ color: 'inherit' }}>
                {selectedDay || "Date"}
              </Typography>
            </Box>
            <IconButton onClick={(e) => setDayAnchorEl(e.currentTarget)} disabled={!selectedYear || selectedMonth === ''}>
              <ExpandMoreIcon sx={{ color: 'inherit' }} />
            </IconButton>
            <Menu
              anchorEl={dayAnchorEl}
              open={Boolean(dayAnchorEl)}
              onClose={() => setDayAnchorEl(null)}
            >
              <MenuItem onClick={() => handleDayChange('')}>
                <em>All</em>
              </MenuItem>
              {availableDays.map((day) => (
                <MenuItem key={day} onClick={() => handleDayChange(day)}>
                  {day}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
        <UserTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterByName}
          selectedId={selected}
          handleReload={() => setReload(!reload)}
        />

        <TableContainer>
          <Table sx={{ minWidth: 800 }}  >
            <UserTableHead

              order={order}
              orderBy={orderBy}
              rowCount={users.length}
              numSelected={selected.length}
              onRequestSort={handleSort}
              onSelectAllClick={handleSelectAllClick}
              headLabel={[
                { id: 'name', label: 'Name' },
                { id: 'course', label: 'Course' },
                { id: 'price', label: 'Price' },
                { id: 'date', label: 'Request Info', align: 'center' },
                { id: 'daysLeft', label: 'Days left', align: 'center' },
                { id: 'status', label: 'Status' },
                { id: 'paymentImg', label: 'ScreenShot' },
                { id: 'refCode', label: 'Referral Code', align: 'center' },
                { id: '' },
              ]}
            />
            <TableBody>
              {dataFiltered
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
                  <UserTableRow
                    key={row.id}
                    avatarUrl={row.avatarUrl}
                    name={row.name}
                    course={row.course}
                    price={row.price}
                    date={row.date}
                    expiryDate={row.expiryDate}
                    status={row.status}
                    paymentImg={row.paymentImg}
                    refCode={row.refCode}

                    isVerified={row.isVerified}
                    selected={selected.indexOf(row.id) !== -1}
                    handleClick={(event) => handleClick(event, row.id)}
                    index={index}
                    userId={row.id}
                    handleReload={() => setReload(!reload)}

                  />
                ))}

              <TableEmptyRows
                height={77}
                emptyRows={emptyRows(page, rowsPerPage, users.length)}
              />

              {notFound && <TableNoData query={filterName} />}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          page={page}
          component="div"
          count={dataFiltered.length}
          rowsPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[10, 25, 50, 100]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </Container>
  );
}
