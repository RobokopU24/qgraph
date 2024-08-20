import { Button, makeStyles } from '@material-ui/core';
import { ArrowRight } from '@material-ui/icons';
import React from 'react';
import {
  Grid, Row, Col,
} from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import QueryBuilderContext from '~/context/queryBuilder';
import useQueryBuilder from './queryBuilder/useQueryBuilder';

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

const fetchPairs = async () => {
  const res = await fetch('/api/explore', { method: 'POST' });
  if (!res.ok) throw new Error(res.statusText);
  return res.json();
};

export default function Explore() {
  const [pairs, setPairs] = React.useState([]);
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
              name: pair.disease.name,
              ids: [pair.disease.id],
            },
            n1: {
              name: pair.drug.name,
              ids: [pair.drug.id],
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

  React.useEffect(() => {
    let ignore = false;

    (async () => {
      try {
        const data = await fetchPairs();

        if (ignore) return;

        setPairs(data);
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

  return (
    <Grid style={{ marginBottom: '50px', marginTop: '50px' }}>
      <Row>
        <Col md={12}>
          <h1>Drug - Disease Pairs</h1>
          <p>
            These drug-disease pairs were generated using a machine learning model to align with the nodes
            in the ROBOKOP knowledge graph. They highlight potential associations between various drugs and
            a broad range of diseases, suggesting possible avenues for further research. These connections
            can serve as a starting point for a new query by hovering over a pair and clicking &ldquo;Start a Query&rdquo;.
          </p>

          <hr />

          {isLoading ? 'Loading...' : (
            <table style={{ fontSize: '1.5rem', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ textTransform: 'uppercase' }}>
                    <h4>Disease</h4>
                  </th>
                  <th style={{ textTransform: 'uppercase' }}>
                    <h4>Drug</h4>
                  </th>
                </tr>
              </thead>
              <tbody>
                {
                  pairs.map((pair, i) => (
                    <tr className={classes.hover} key={i}>
                      <td>
                        {pair.disease.name}
                        <Chip>{pair.disease.id}</Chip>
                      </td>
                      <td>
                        {pair.drug.name}
                        <Chip>{pair.drug.id}</Chip>
                      </td>
                      <Button
                        variant="contained"
                        color="primary"
                        endIcon={<ArrowRight />}
                        onClick={() => handleStartQuery(pair)}
                      >
                        Start a query
                      </Button>
                    </tr>
                  ))
                }
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
