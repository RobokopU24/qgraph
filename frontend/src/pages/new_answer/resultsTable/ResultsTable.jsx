import React, { useMemo } from 'react';
import { useTable, usePagination, useExpanded } from 'react-table';

import Paper from '@material-ui/core/Paper';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';

export default function ResultsTable({ store }) {
  const columns = useMemo(() => store.tableHeaders, [store.tableHeaders]);
  const data = useMemo(() => store.message.results, [store.message]);
  const {
    getTableProps, getTableBodyProps,
    headerGroups,
    page, prepareRow,
    state,
    canPreviousPage, canNextPage,
    setPageSize,
    nextPage, previousPage,
  } = useTable(
    {
      columns,
      // defaultColumn,
      data,
      initialState: {
        pageIndex: 0,
        pageSize: 5,
        sortBy: [
          {
            id: 'score',
            desc: true,
          },
        ],
      },
    },
    useExpanded,
    usePagination,
  );

  return (
    <>
      {page.length > 0 && (
        <Paper id="resultsTable">
          <TableContainer>
            <Table {...getTableProps()}>
              <TableHead>
                {headerGroups.map((headerGroup, i) => (
                  <TableRow key={i} {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <TableCell key={column.id}>
                        {column.render('Header')}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableHead>
              <TableBody {...getTableBodyProps()}>
                {page.map((row) => {
                  prepareRow(row);
                  return (
                    <React.Fragment key={row.id}>
                      <TableRow {...row.getRowProps()}>
                        {row.cells.map((cell) => (
                          <TableCell {...cell.getCellProps()}>
                            {cell.render('Cell')}
                          </TableCell>
                        ))}
                      </TableRow>
                      {row.isExpanded && (
                        <TableRow>
                          <TableCell colSpan={row.cells.length}>
                            <h1>Test</h1>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            rowsPerPageOptions={[5, 10, 15]}
            count={data.length}
            rowsPerPage={state.pageSize}
            page={state.pageIndex}
            backIconButtonProps={{
              onClick: previousPage,
              disabled: !canPreviousPage,
            }}
            nextIconButtonProps={{
              onClick: nextPage,
              disabled: !canNextPage,
            }}
            onChangePage={() => {}} // required prop
            onChangeRowsPerPage={(e) => setPageSize(e.target.value)}
          />
        </Paper>
      )}
    </>
  );
}
