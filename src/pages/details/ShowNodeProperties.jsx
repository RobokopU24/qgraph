import React from 'react';

import {
  Row,
  Col,
} from 'react-bootstrap';

import propertyFriendlyNames from './property-friendly-names.json';
import ShowPropertyValue from './ShowPropertyValue';

export default function ShowNodeProperties({
  properties,
}) {
  const propertyNames = Object.keys(
    properties ?? {},
  );

  return (
    <Row>
      <Col>
        <h2>Node Properties</h2>
        <table className="table table-th-block">
          <tbody>
            {propertyNames.map(
              (property) => (
                <tr key={property}>
                  <td
                    className="active"
                    md={4}>
                    {propertyFriendlyNames[
                      property
                    ] ?? property}
                  </td>
                  <td>
                    <ShowPropertyValue
                      propertyValue={
                        properties[
                          property
                        ]
                      }></ShowPropertyValue>
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </Col>
    </Row>
  );
}
