import { Button, makeStyles } from '@material-ui/core';
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
    columnHelper.accessor('diseaseName', {
      header: 'Disease',
      cell: (info) => (
        <>
          {info.row.original.disease_name}
          <Chip>{info.row.original.disease_id}</Chip>
        </>
      ),
    }),
    columnHelper.accessor('drugName', {
      header: 'Drug',
      cell: (info) => (
        <>
          {info.row.original.disease_name}
          <Chip>{info.row.original.disease_id}</Chip>
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

  React.useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        if (ignore) return;

        setData(await fetchPairs());
        setIsLoading(false);
      } catch (e) {
        setError(e.message);
        setIsLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  const table = useReactTable({
    data: isLoading ? [] : data.rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
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
            <table style={{ fontSize: '1.6rem', width: '100%' }}>
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} style={{ borderBottom: '1px solid #eee' }}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} style={{ paddingBottom: '1rem' }}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
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
