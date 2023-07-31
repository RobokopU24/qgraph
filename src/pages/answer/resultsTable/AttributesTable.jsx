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

const PublicationLinkCell = ({ value }) => {
  const getLinkFromValue = (pmidValue) => {
    const pmid = pmidValue.split(':');
    if (pmid.length < 2) return null;
    return `https://pubmed.ncbi.nlm.nih.gov/${pmid[1]}/`;
  };

  return (
    <TableCell>
      <ul style={{ padding: 0, margin: 0, listStyleType: 'none' }}>
        {Array.isArray(value) ? (
          value.map((valueItem, valueItemIndex) => {
            const link = getLinkFromValue(valueItem);
            return (
              <li key={valueItemIndex}>
                {link === null ? (
                  valueItem
                ) : (
                  <a href={link} target="_blank" rel="noreferrer">
                    {valueItem}
                  </a>
                )}
              </li>
            );
          })
        ) : (
          <li>
            {getLinkFromValue(value) === null ? (
              value
            ) : (
              <a
                href={getLinkFromValue(value)}
                target="_blank"
                rel="noreferrer"
              >
                {value}
              </a>
            )}
          </li>
        )}
      </ul>
    </TableCell>
  );
};

const AttributesTable = ({ attributes, sources }) => (
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
            {
              attribute.attribute_type_id === 'biolink:publications'
                ? <PublicationLinkCell value={attribute.value} />
                : <ValueCell value={attribute.value} />
            }
          </TableRow>
        ))}
        <TableRow>
          <TableCell>
            Sources
          </TableCell>
          <TableCell>
            <pre>
              {JSON.stringify(sources, null, 2)}
            </pre>
          </TableCell>
        </TableRow>
      </StyledTableBody>
    </Table>
  </Box>
);

export default AttributesTable;
