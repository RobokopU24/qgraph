import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@material-ui/core';

const ValueCell = ({ value }) => (
  <TableCell>
    <ul style={{ padding: 0, margin: 0, listStyleType: 'none' }}>
      {Array.isArray(value) ? (
        value.map((valueItem, valueItemIndex) => (
          <li key={valueItemIndex}>{valueItem}</li>
        ))
      ) : (
        <li>{value}</li>
      )}
    </ul>
  </TableCell>
);

const NodeAttributesTable = ({ nodeData }) => {
  const {
    name, id, categories, count,
  } = nodeData;

  return (
    <Box style={{ maxHeight: 500, overflow: 'auto' }}>
      <Table size="small" aria-label="node attributes table">
        <TableBody>
          {Boolean(name) && (
            <TableRow style={{ verticalAlign: 'top' }}>
              <TableCell>
                Name
              </TableCell>
              <ValueCell value={name} />
            </TableRow>
          )}

          {Boolean(id) && (
            <TableRow style={{ verticalAlign: 'top' }}>
              <TableCell>
                ID
              </TableCell>
              <ValueCell value={id} />
            </TableRow>
          )}

          {Boolean(categories) && (
            <TableRow style={{ verticalAlign: 'top' }}>
              <TableCell>
                Categories
              </TableCell>
              <ValueCell value={categories} />
            </TableRow>
          )}

          {Boolean(count) && (
            <TableRow style={{ verticalAlign: 'top' }}>
              <TableCell>
                Count
              </TableCell>
              <ValueCell value={count} />
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Box>
  );
};

export default NodeAttributesTable;
