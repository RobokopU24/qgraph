import {
  Box,
  styled,
  Table, TableBody, TableCell, TableHead, TableRow,
} from '@material-ui/core';
import React from 'react';

const headerStyles = { fontWeight: 'bold', backgroundColor: '#eee' };

const StyledTableBody = styled(TableBody)(() => ({
  '& .MuiTableRow-root:last-of-type .MuiTableCell-root': {
    borderBottom: 'none',
  },
}));

const AttributesTable = ({ attributes }) => (
  <Box style={{ maxHeight: 500, overflow: 'auto' }}>
    <Table size="small" aria-label="edge attributes table">
      <TableHead style={{ position: 'sticky', top: 0 }}>
        <TableRow>
          <TableCell style={headerStyles}>
            attribute_type_id
          </TableCell>
          <TableCell style={headerStyles}>
            value
          </TableCell>
        </TableRow>
      </TableHead>
      <StyledTableBody>
        {attributes.map((attribute, index) => (
          <TableRow key={index}>
            <TableCell style={{ verticalAlign: 'top' }}>{attribute.attribute_type_id}</TableCell>
            <TableCell>
              <ul style={{ padding: 0, margin: 0, listStyleType: 'none' }}>
                {Array.isArray(attribute.value) ? (
                  attribute.value.map((valueItem, valueItemIndex) => (
                    <li key={valueItemIndex}>{valueItem}</li>
                  ))
                ) : (
                  <li>{attribute.value}</li>
                )}
              </ul>
            </TableCell>
          </TableRow>
        ))}
      </StyledTableBody>
    </Table>
  </Box>
);

export default AttributesTable;
