import React from 'react';
import { Col, Grid, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function EnrichedQueries() {
  return (
    <Grid style={{ marginBottom: '50px', marginTop: '50px' }}>
      <Row>
        <Col md={12}>
          <small>
            <Link to="/explore">← View all tools</Link>
            <h1>Enrichment Analysis</h1>
            <div>
              Tool
            </div>
          </small>
        </Col>
      </Row>
    </Grid>
  );
}
