import React, { useContext, useState } from 'react';
import { Col, Grid, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Button } from '@material-ui/core';
import Select from './Select';
import { QueryCacheProvider } from '../../hooks/use-query';
import NodeInputBox from './NodeInputBox';
import BiolinkContext from '~/context/biolink';

export default function EnrichedQueries() {
  const { concepts: categories, predicates } = useContext(BiolinkContext);

  const [curies, setCuries] = useState([]);
  const [inputNodeType, setInputNodeType] = useState(undefined);
  const [inputNodeTaxa, setInputNodeTaxa] = useState('');
  const [relationship, setRelationship] = useState('related_to');
  const [outputType, setOutputType] = useState('NamedThing');

  if (!categories.length || !predicates.length) {
    return null;
  }

  function onSubmit() {
    console.log('Submitted query');
  }

  return (
    <Grid style={{ marginBottom: '50px', marginTop: '50px' }}>
      <Row>
        <Col md={12}>
          <small>
            <Link to="/explore">← View all tools</Link>
            <h1>Enrichment Analysis</h1>
            <p style={{ fontSize: '1.6rem' }}>
              This tool helps discover common connections between nodes. Given a
              list of input nodes, a relationship, and an output type, it will
              return a list of nodes that are best connected to the input nodes
              via the relationship.
            </p>

            <hr />
            <div style={{ fontSize: '1.6rem' }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
              >
                <div
                  style={{ display: 'flex', flexDirection: 'row', gap: '24px' }}
                >
                  <Select
                    label="Input node type (optional)"
                    notSelectedOption="N/A"
                    options={categories.map((c) => c.split(':')[1]).sort()}
                    onChange={setInputNodeType}
                    value={inputNodeType}
                  />
                  <div style={{ flex: '1' }}>
                    <span
                      style={{
                        fontSize: '14px',
                        color: '#626262',
                        textTransform: 'uppercase',
                        fontWeight: 'bold',
                        paddingLeft: '8px',
                      }}
                    >
                      Input node taxa filter (optional, comma separated)
                    </span>
                    <input
                      style={{
                        width: '100%',
                        padding: '8px',
                        fontSize: '16px',
                        boxSizing: 'border-box',
                        border: '1px solid #9F9F9F',
                        borderRadius: '4px',
                      }}
                      value={inputNodeTaxa}
                      onChange={(e) => setInputNodeTaxa(e.target.value)}
                    />
                  </div>
                </div>

                <QueryCacheProvider>
                  <NodeInputBox
                    onCurieListChange={setCuries}
                    inputNodeType={inputNodeType}
                    inputNodeTaxa={inputNodeTaxa}
                  />
                </QueryCacheProvider>

                <div
                  style={{ display: 'flex', flexDirection: 'row', gap: '24px' }}
                >
                  <Select
                    label="Relationship"
                    options={predicates.map((p) => p.predicate.split(':')[1]).sort()}
                    onChange={setRelationship}
                    value={relationship}
                  />
                  <Select
                    label="Output type"
                    options={categories.map((c) => c.split(':')[1]).sort()}
                    onChange={setOutputType}
                    value={outputType}
                  />
                </div>
              </div>

              <Button
                onClick={onSubmit}
                style={{ marginTop: '24px' }}
                variant="contained"
                color="primary"
              >
                Submit Query
              </Button>
            </div>
          </small>
        </Col>
      </Row>
    </Grid>
  );
}
