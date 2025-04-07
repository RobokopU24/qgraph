/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Button, makeStyles, TablePagination } from '@material-ui/core';
import { ArrowRight } from '@material-ui/icons';
import React from 'react';
import {
  Grid, Row, Col,
} from 'react-bootstrap';
import { useHistory, Link } from 'react-router-dom';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import QueryBuilderContext from '~/context/queryBuilder';
import useQueryBuilder from '../queryBuilder/useQueryBuilder';
import explorePage from '~/API/explorePage';
import TablePaginationActions from './TableActions';

const useStyles = makeStyles({
  hover: {
    '& .MuiButtonBase-root': {
      visibility: 'hidden',
    },
    '&:hover .MuiButtonBase-root': {
      visibility: 'visible',
    },
  },
});

const fetchPairs = explorePage.getDrugChemicalPairs;

export default function DrugDiseasePairs() {
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 20,
  });
  const [sorting, setSorting] = React.useState([]);
  const [data, setData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // eslint-disable-next-line no-unused-vars
  const [error, setError] = React.useState(null);

  const queryBuilder = useQueryBuilder(QueryBuilderContext);
  const history = useHistory();

  const handleStartQuery = (pair) => {
    const query = {
      message: {
        query_graph: {
          nodes: {
            n0: {
              name: pair.disease_name,
              ids: [pair.disease_id],
            },
            n1: {
              name: pair.drug_name,
              ids: [pair.drug_id],
            },
          },
          edges: {
            e0: {
              subject: 'n0',
              object: 'n1',
              predicates: [
                'biolink:related_to',
              ],
            },
          },
        },
      },
    };

    queryBuilder.dispatch({ type: 'saveGraph', payload: query });
    history.push('/');
  };

  const classes = useStyles();

  const columnHelper = createColumnHelper();
  const columns = React.useMemo(() => ([
    columnHelper.accessor('disease_name', {
      header: 'Disease',
      cell: (info) => (
        <>
          {info.row.original.disease_name}
          <Chip>{info.row.original.disease_id}</Chip>
        </>
      ),
    }),
    columnHelper.accessor('drug_name', {
      header: 'Drug',
      cell: (info) => (
        <>
          {info.row.original.drug_name}
          <Chip>{info.row.original.drug_id}</Chip>
        </>
      ),
    }),
    columnHelper.accessor('score', {
      header: 'Score',
      cell: (info) => (info.row.original.known ? (
        <span style={{ textDecoration: 'underline' }}>
          {info.row.original.score.toFixed(6)}*
        </span>
      ) : (
        info.row.original.score.toFixed(6)
      )),
    }),
    columnHelper.display({
      id: 'startQueryButton',
      cell: (props) => (
        <Button
          variant="contained"
          color="primary"
          endIcon={<ArrowRight />}
          onClick={() => handleStartQuery(props.row.original)}
        >
          Start a query
        </Button>
      ),
    }),
  ]), []);

  const fetchFunctionSortingFormat = React.useMemo(() => (
    sorting.reduce((obj, currCol) => {
      obj[currCol.id] = currCol.desc ? 'desc' : 'asc';
      return obj;
    }, {})
  ), [sorting]);

  React.useEffect(() => {
    setIsLoading(true);
    let ignore = false;

    (async () => {
      try {
        if (ignore) return;

        setData(await fetchPairs({
          pagination,
          sort: fetchFunctionSortingFormat,
        }));
        setIsLoading(false);
      } catch (e) {
        setError(e.message);
        setIsLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [pagination, fetchFunctionSortingFormat]);

  const table = useReactTable({
    data: isLoading ? [] : data.rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    enableMultiSort: false,
    manualSorting: true,
    rowCount: data.num_of_results,
    state: {
      pagination,
      sorting,
    },
    onSortingChange: setSorting,
  });

  return (
    <Grid style={{ marginBottom: '50px', marginTop: '50px' }}>
      <Row>
        <Col md={12}>
          <small><Link to="/explore">← View all datasets</Link></small>
          <h1>Drug - Disease Pairs</h1>
          <p style={{ fontSize: '1.6rem' }}>
            These drug-disease pairs were generated using a machine learning model to align with the nodes
            in the ROBOKOP knowledge graph. They highlight potential associations between various drugs and
            a broad range of diseases, suggesting possible avenues for further research. These connections
            can serve as a starting point for a new query by hovering over a pair and clicking &ldquo;Start a Query&rdquo;.
          </p>

          <p style={{ fontSize: '1.6rem' }}>
            Scores with an asterisk and underline means the drug-disease pair is already known. The score is still
            predicted using the trained model.
          </p>

          <hr />

          {isLoading ? 'Loading...' : (
            <>
              <table style={{ fontSize: '1.6rem', width: '100%' }}>
                <thead>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} style={{ borderBottom: '1px solid #eee' }}>
                      {headerGroup.headers.map((header) => (
                        <th key={header.id} style={{ paddingBottom: '1rem' }}>
                          {header.isPlaceholder ? null : (
                            <div
                              style={
                                header.column.getCanSort()
                                  ? { userSelect: 'none', cursor: 'pointer' }
                                  : undefined
                              }
                              onClick={header.column.getToggleSortingHandler()}
                              title={
                                header.column.getCanSort()
                                  ? header.column.getNextSortingOrder() === 'asc'
                                    ? 'Sort ascending'
                                    : header.column.getNextSortingOrder() === 'desc'
                                      ? 'Sort descending'
                                      : 'Clear sort'
                                  : undefined
                              }
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                              {{
                                asc: ' 🔼',
                                desc: ' 🔽',
                              }[header.column.getIsSorted()] || null}
                            </div>
                          )}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className={classes.hover}>
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <TablePagination
                rowsPerPageOptions={[10, 20, 50, 100]}
                component="div"
                count={data.num_of_results}
                rowsPerPage={pagination.pageSize}
                page={pagination.pageIndex}
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${
                  count !== -1 ? count.toLocaleString() : `more than ${to}`
                }`}
                onChangePage={(_, page) => {
                  setPagination((prev) => ({ ...prev, pageIndex: page }));
                }}
                onChangeRowsPerPage={(e) => {
                  const pageSize = e.target.value ? Number(e.target.value) : 10;
                  setPagination(({ pageIndex: 0, pageSize }));
                }}
                ActionsComponent={TablePaginationActions}
              />
            </>
          )}
        </Col>
      </Row>
    </Grid>
  );
}

function Chip({ children }) {
  return (
    <span style={{
      fontSize: '1.1rem', backgroundColor: '#e9e9e9', borderRadius: '4px', padding: '2px 4px', marginLeft: '1ch',
    }}
    >
      {children}
    </span>
  );
}
