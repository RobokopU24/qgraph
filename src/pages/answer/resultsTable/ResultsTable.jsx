import React, { useMemo } from 'react';
import {
  useTable, usePagination, useSortBy, useFilters,
} from 'react-table';

import Paper from '@material-ui/core/Paper';
import TableContainer from '@material-ui/core/TableContainer';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';
import TableSortLabel from '@material-ui/core/TableSortLabel';

import ResultExplorer from './ResultExplorer';
import EmptyTable from '~/components/shared/emptyTableRows/EmptyTable';

import './resultsTable.css';

/**
 * Paginated results table
 * @param {object} answerStore - answer store hook
 */
export default function ResultsTable({ answerStore }) {
  const columns = useMemo(() => answerStore.tableHeaders, [answerStore.tableHeaders]);
  const data = useMemo(() => answerStore.message.results, [answerStore.message]);

  // This is a custom filter UI for selecting
  // a unique option from a list
  function SelectColumnFilterFn({
    column: {
      filterValue, setFilter, preFilteredRows, id,
    },
  }) {
    // Calculate the options for filtering
    // using the preFilteredRows
    const options = useMemo(() => {
      const o = new Set();
      preFilteredRows.forEach((row) => {
        o.add(row.values[id] ? row.values[id] : null);
      });
      return [...o.values()];
    }, [id, preFilteredRows]);

    // Render a multi-select box
    return (
      <select
        value={filterValue}
        onChange={(e) => {
          setFilter(e.target.value || undefined);
        }}
        className="resultsFilterSelect"
      >
        <option value="">All</option>
        {options.map((option, i) => (
          <option key={i} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  // Let's set up our default Filter UI
  const defaultColumn = useMemo(() => ({ Filter: SelectColumnFilterFn }), []);

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
      data,
      defaultColumn,
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
    useFilters,
    useSortBy,
    usePagination,
  );

  return (
    <>
      <div id="resultsContainer">
        <Paper id="resultsTable" elevation={3}>
          <TableContainer>
            <Table {...getTableProps()}>
              <TableHead>
                {headerGroups.map((headerGroup, i) => (
                  <TableRow key={i} {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <TableCell
                        key={column.id}
                        className="resultsTableHeader"
                        {...column.getHeaderProps(column.getSortByToggleProps(
                          {
                            style: {
                              backgroundColor: column.color,
                              cursor: column.canSort ? 'pointer' : '',
                              width: column.width,
                            },
                          },
                        ))}
                      >
                        {column.canSort ? (
                          <TableSortLabel
                            active={column.isSorted}
                            direction={column.isSortedDesc ? 'desc' : 'asc'}
                          >
                            {column.render('Header')}
                          </TableSortLabel>
                        ) : (
                          <>
                            {column.render('Header')}
                          </>
                        )}
                        <div>{column.canFilter ? column.render('Filter') : null}</div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableHead>
              <TableBody style={{ position: 'relative' }} {...getTableBodyProps()}>
                {page.length > 0 ? (
                  <>
                    {page.map((row) => {
                      prepareRow(row);
                      return (
                        <TableRow
                          {...row.getRowProps()}
                          hover
                          selected={answerStore.selectedRowId === row.id}
                          onClick={() => answerStore.selectRow(row.original, row.id)}
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
                  </>
                ) : (
                  <EmptyTable
                    numRows={10}
                    numCells={columns.length}
                    text="No Results"
                  />
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            rowsPerPageOptions={[5, 10, 15, 50, 100]}
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
          answerStore={answerStore}
        />
      </div>
    </>
  );
}
