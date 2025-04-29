import React from 'react';
import { Col, Grid, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Button } from '@material-ui/core';

export default function EnrichedQueries() {
  return (
    <Grid style={{ marginBottom: '50px', marginTop: '50px' }}>
      <Row>
        <Col md={12}>
          <small>
            <Link to="/explore">← View all tools</Link>
            <h1>Enrichment Analysis</h1>
            <p style={{ fontSize: '1.6rem' }}>
              This tool helps discover common connections between nodes. Given a list of input nodes, a relationship, and an output type, it will return a list of nodes that are best connected to the input nodes via the relationship.
            </p>

            <hr />
            <div style={{ fontSize: '1.6rem' }}>

              <Button>Run query</Button>
            </div>
          </small>
        </Col>
      </Row>
    </Grid>
  );
}
