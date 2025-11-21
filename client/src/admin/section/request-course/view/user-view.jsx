import { useState, useEffect } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import { Select, MenuItem, FormControl, InputLabel, Box } from '@mui/material';

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

  const handleYearChange = (event) => {
    setPage(0);
    setSelectedYear(event.target.value);
    setSelectedMonth('');
  };

  const handleMonthChange = (event) => {
    setPage(0);
    setSelectedMonth(event.target.value);
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

  const filteredData = users.filter((user) => {
    const date = new Date(user.date);
    const yearMatches = selectedYear ? date.getFullYear() === selectedYear : true;
    const monthMatches = selectedMonth !== '' ? date.getMonth() === selectedMonth : true;
    return yearMatches && monthMatches;
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
        <Stack direction="row" spacing={2}>
          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel>Year</InputLabel>
            <Select value={selectedYear} label="Year" onChange={handleYearChange}>
              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              {availableYears.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }} size="small" disabled={!selectedYear}>
            <InputLabel>Month</InputLabel>
            <Select value={selectedMonth} label="Month" onChange={handleMonthChange}>
              <MenuItem value="">
                <em>All</em>
              </MenuItem>
              {availableMonths.map((month) => (
                <MenuItem key={month} value={month}>
                  {new Date(0, month).toLocaleString('default', { month: 'long' })}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Stack>

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
