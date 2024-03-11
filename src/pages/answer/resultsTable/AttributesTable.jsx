import {
  Box,
  styled,
  Table, TableBody, TableCell, TableHead, TableRow, withStyles,
} from '@material-ui/core';
import React, {
  useState, useContext,
} from 'react';
import Button from '@material-ui/core/Button';
import { blue } from '@material-ui/core/colors';
import resultsUtils from '~/utils/results';
import GPTContext from '~/context/gpt';

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

const PublicationLinkCell = ({ value, aiJSON }) => {
  const getLinkFromValue = (pmidValue) => {
    const pmid = pmidValue.split(':');
    if (pmid.length < 2) return null;
    return `https://pubmed.ncbi.nlm.nih.gov/${pmid[1]}/`;
  };

  const { enabled } = useContext(GPTContext);
  const [aiSummaryData, setAISummaryData] = useState('');

  const GPTSummaryButton = withStyles((theme) => ({
    root: {
      marginLeft: 'auto',
      color: theme.palette.getContrastText(blue[600]),
      backgroundColor: blue[600],
      '&:hover': {
        backgroundColor: blue[700],
      },
    },
  }))(Button);

  async function onGPTSummary(event, inJSON) {
    const publicationsArr = resultsUtils.getPublications(inJSON.edge);
    const sentenceRes = resultsUtils.getSentences(inJSON.edge);
    // setAnchorEl(spanRef.current);
    console.log(publicationsArr);
    const toSendData = {
      edge: {
        nodes: inJSON.nodes,
        edge: {
          subject: inJSON.edge.subject,
          object: inJSON.edge.object,
          predicate: inJSON.edge.predicate,
          publications: publicationsArr,
          sentences: sentenceRes,
        },
      },
      parameters: {
        llm: {
          gpt_model: 'gpt-3.5-turbo',
          temperature: 0,
          system_prompt: '',
        },
      },
    };
    console.log(JSON.stringify(toSendData, null, 2));
    const options = {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify(toSendData),
    };
    const kgsummarizerurl = 'https://kg-summarizer.apps.renci.org/summarize/edge';
    await fetch(kgsummarizerurl, options)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json(); // Parse the JSON in the response ? Or is it a text?
      })
      .then((data) => {
        console.log(data);
        setAISummaryData(data);
        inJSON.edge.aisummary = data;
      })
      .catch((error) => {
        setAISummaryData('Error getting response from KG-Summarizer:: ', error);
      });
  }

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
      {enabled &&
        (
          <GPTSummaryButton
            onClick={(event) => {
              event.persist();
              onGPTSummary(event, aiJSON);
            }}
            variant="outlined"
          >
            Get AI Summary
          </GPTSummaryButton>
        )}
      {enabled && (aiSummaryData.length > 0) &&
        (
          <p style={{
            margin: '20px', padding: '20px', fontStyle: 'italic', backgroundColor: '#f0f0f0',
          }}
          > {aiSummaryData}
          </p>
        )}
    </TableCell>
  );
};

const AttributesTable = ({ aiJSON, attributes, sources }) => (
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
                ? <PublicationLinkCell value={attribute.value} aiJSON={aiJSON} />
                : <ValueCell value={attribute.value} />
            }
          </TableRow>
        ))}
        <TableRow>
          <TableCell>
            Sources
          </TableCell>
          <TableCell>
            {Array.isArray(sources) && sources.map((source, i) => (
              <section key={i}>
                <p style={{ marginBottom: '0px', fontStyle: 'italic' }}>{source.resource_id}</p>
                <p style={{ filter: 'opacity(0.75)', fontSize: '0.8em' }}>{source.resource_role}</p>
                {Boolean(source.upstream_resource_ids) && Array.isArray(source.upstream_resource_ids) && (
                  <>
                    <p style={{ marginBottom: '0px' }}>Upstream resource ids:</p>
                    <ul>
                      {source.upstream_resource_ids.map((urid, j) => (
                        <li key={j}>
                          {urid}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {i === sources.length - 1 ? null : <hr />}
              </section>
            ))}
          </TableCell>
        </TableRow>
      </StyledTableBody>
    </Table>
  </Box>
);

export default AttributesTable;
