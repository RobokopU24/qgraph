import React, { useState } from 'react';
import { Col, Grid, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Button } from '@material-ui/core';
import Select from './Select';
import { QueryCacheProvider } from '../../hooks/use-query';
import NodeInputBox from './NodeInputBox';

export default function EnrichedQueries() {
  const [curies, setCuries] = useState([]);
  const [inputNodeType, setInputNodeType] = useState(undefined);
  const [inputNodeTaxa, setInputNodeTaxa] = useState('');
  const [relationship, setRelationship] = useState(undefined);
  const [outputType, setOutputType] = useState(undefined);

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
                    options={[
                      'biolink:NamedThing',
                      'biolink:Gene',
                      'biolink:Disease',
                      'biolink:ChemicalEntity',
                    ]}
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
                    notSelectedOption="Please select a relationship"
                    options={[
                      'biolink:related_to',
                      'biolink:causes',
                      'biolink:associates_with',
                    ]}
                    onChange={setRelationship}
                    value={relationship}
                  />
                  <Select
                    label="Output type"
                    notSelectedOption="Please select an output type"
                    options={[
                      'biolink:NamedThing',
                      'biolink:Gene',
                      'biolink:Disease',
                      'biolink:ChemicalEntity',
                    ]}
                    onChange={setOutputType}
                    value={outputType}
                  />
                </div>
              </div>

              <Button style={{ marginTop: '24px' }}>Run query</Button>

              <pre>{JSON.stringify(curies, null, 2)}</pre>
            </div>
          </small>
        </Col>
      </Row>
    </Grid>
  );
}
