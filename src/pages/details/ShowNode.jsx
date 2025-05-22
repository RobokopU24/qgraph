import React from 'react';

import {
  Row,
  Col,
} from 'react-bootstrap';

import ShowPropertyValue from './ShowPropertyValue';

export default function ShowNode({
  node,
}) {
  return (
    <Row>
      <Col>
        <h2>Node Information</h2>
        <table className="table table-th-block">
          <tbody>
            <tr>
              <td
                className="active"
                md={4}>
                Name
              </td>
              <td>{node.name}</td>
            </tr>
            <tr>
              <td className="active">
                Categories
              </td>
              <td>
                <ShowPropertyValue
                  propertyValue={
                    node.category
                  }></ShowPropertyValue>
              </td>
            </tr>
          </tbody>
        </table>
      </Col>
    </Row>
  );
}
