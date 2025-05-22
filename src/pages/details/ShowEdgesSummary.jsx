import React, {
  useState,
  useEffect,
} from 'react';

import {
  Row,
  Col,
} from 'react-bootstrap';

import Select, {
  SelectChangeEvent,
} from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import ShowPropertyValue from './ShowPropertyValue';

import API from '~/API';
import useBiolinkModel from '~/stores/useBiolinkModel';

import propertyFriendlyNames from './property-friendly-names.json';

export default function ShowEdges({
  node,
  nodeId,
}) {
  const biolink = useBiolinkModel();

  const pageSizeOptions = [
    10, 25, 50, 100, 1000,
  ];
  const [
    hasEdgesSummaryError,
    setHasEdgesSummaryError,
  ] = useState(false);

  const [edgeSummary, setEdgeSummary] =
    useState([]);

  async function fetchEdgesSummary() {
    const edgeSummaryResponse =
      await API.details.getNodeEdgeSummary(
        nodeId,
      );

    if (
      edgeSummaryResponse.status ===
      'error'
    ) {
      setHasEdgesSummaryError(true);
      setEdgeSummary([]);
    } else {
      setHasEdgesSummaryError(false);
      setEdgeSummary(
        edgeSummaryResponse.edge_types,
      );
    }
  }

  useEffect(() => {
    fetchEdgesSummary();
  }, []);

  const ShowEdgeSummary = ({
    edge: edgeSummaryItem,
  }) => {
    return (
      <tr>
        <td>
          {propertyFriendlyNames[
            edgeSummaryItem.predicate
          ] ??
            edgeSummaryItem.predicate}
        </td>
        <td>
          <ShowPropertyValue
            propertyValue={
              edgeSummaryItem.category
            }></ShowPropertyValue>
        </td>
        <td>{edgeSummaryItem.count}</td>
      </tr>
    );
  };

  return (
    <Row>
      {hasEdgesSummaryError ? (
        <Col>
          <h2>Edges Summary</h2>
          <div>
            An error occurred while
            getting the edges summary
          </div>
        </Col>
      ) : (
        <Col>
          <h2>Edges Summary</h2>
          {edgeSummary.length === 0 ? (
            <Row>
              <Col md={8}>
                No edges found for this
                node.
              </Col>
            </Row>
          ) : (
            <table className="table table-striped ">
              <thead>
                <tr>
                  <th>Predicate</th>
                  <th>Category</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {edgeSummary.map(
                  (edgeRow, index) => (
                    <ShowEdgeSummary
                      key={index}
                      edge={edgeRow}
                    />
                  ),
                )}
              </tbody>
            </table>
          )}
        </Col>
      )}
    </Row>
  );
}
