/* eslint-disable no-restricted-syntax */
import React, { useContext, useEffect, useRef, useState } from 'react';
import { Col, Grid, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Button } from '@material-ui/core';
import axios from 'axios';
import Select from './Select';
import { QueryCacheProvider } from '../../hooks/use-query';
import NodeInputBox from './NodeInputBox';
import BiolinkContext from '~/context/biolink';

function generateEnrichmentQuery(inputNodeType, outputNodeType, inputCuries, predicate, inputIsSubject = false) {
  return {
    message: {
      query_graph: {
        nodes: {
          input: {
            categories: [inputNodeType],
            ids: ['uuid:1'],
            member_ids: inputCuries,
            set_interpretation: 'MANY',
          },
          output: {
            categories: [outputNodeType],
          },
        },
        edges: {
          edge_0: {
            subject: inputIsSubject ? 'input' : 'output',
            object: inputIsSubject ? 'output' : 'input',
            predicates: [predicate],
            // knowledge_type: "inferred"
          },
        },
      },
    },
  };
}

function extractResultsStructured(resp) {
  const resultsArray = [];

  const results = resp.message.results || [];
  const kgNodes = resp.message.knowledge_graph.nodes || {};
  const kgEdges = resp.message.knowledge_graph.edges || {};

  for (const result of results) {
    const nb = result.node_bindings.output[0].id;
    const name = (Boolean(kgNodes[nb]) && kgNodes[nb].name) || 'N/A';

    const edgeId = result.analyses[0].edge_bindings.edge_0[0].id;
    const edge = kgEdges[edgeId];
    let pValue = null;

    for (const att of edge.attributes || []) {
      if (att.attribute_type_id === 'biolink:p_value') {
        pValue = att.value;
        break;
      }
    }

    resultsArray.push({
      id: nb,
      name,
      p_value: pValue,
    });
  }

  return resultsArray;
}

export default function EnrichedQueries() {
  const { concepts: categories, predicates } = useContext(BiolinkContext);

  const [curies, setCuries] = useState([]);
  const [inputNodeType, setInputNodeType] = useState(undefined);
  const [inputNodeTaxa, setInputNodeTaxa] = useState('');
  const [relationship, setRelationship] = useState('related_to');
  const [outputType, setOutputType] = useState('NamedThing');

  const abortControllerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState([]);

  React.useEffect(() => {
    console.log(results);
  }, [results]);

  function stopQuery() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
    setIsLoading(false);
  }

  async function startQuery() {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    const query = generateEnrichmentQuery(
      `biolink:${inputNodeType || 'NamedThing'}`,
      `biolink:${outputType}`,
      curies,
      `biolink:${relationship}`,
    );
    const { data } = await axios.post('https://answercoalesce.renci.org/query', query, { signal: controller.signal });
    setResults(extractResultsStructured(data));
    setIsLoading(false);
  }

  if (!categories.length || !predicates.length) {
    return null;
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
                onClick={isLoading ? stopQuery : startQuery}
                style={{ marginTop: '24px' }}
                variant="contained"
                color={isLoading ? 'secondary' : 'primary'}
              >
                {isLoading ? 'Stop Query' : 'Submit Query'}
              </Button>
            </div>
          </small>
        </Col>
      </Row>
    </Grid>
  );
}
