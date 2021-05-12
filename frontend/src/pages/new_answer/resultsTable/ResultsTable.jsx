import React, { useMemo } from 'react';
import { useTable, usePagination } from 'react-table';

import Paper from '@material-ui/core/Paper';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';

import ResultExplorer from './ResultExplorer';

import './resultsTable.css';

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
        pageSize: 10,
        sortBy: [
          {
            id: 'score',
            desc: true,
          },
        ],
      },
    },
    usePagination,
  );

  return (
    <>
      {page.length > 0 && (
        <div id="resultsContainer">
          <Paper id="resultsTable" elevation={3}>
            <TableContainer>
              <Table {...getTableProps()}>
                <TableHead>
                  {headerGroups.map((headerGroup, i) => (
                    <TableRow key={i} {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column) => (
                        <TableCell key={column.id} className="resultsTableHeader">
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
                      <TableRow
                        {...row.getRowProps()}
                        hover
                        selected={store.selectedRowId === row.id}
                        onClick={() => store.selectRow(row.original, row.id)}
                        role="button"
                      >
                        {row.cells.map((cell) => (
                          <TableCell {...cell.getCellProps()}>
                            {cell.render('Cell')}
                          </TableCell>
                        ))}
                      </TableRow>
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
          <ResultExplorer
            store={store}
          />
        </div>
      )}
    </>
  );
}
