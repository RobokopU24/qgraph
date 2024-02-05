import {
  Box,
  styled,
  Table, TableBody, TableCell, TableHead, TableRow, withStyles,
} from '@material-ui/core';
import React, {
  useState, useRef,
} from 'react';
import Button from '@material-ui/core/Button';
import { blue } from '@material-ui/core/colors';
import resultsUtils from '~/utils/results';
import Popover from '~/components/Popover';

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

  const [aiSummaryData, setAISummaryData] = useState('');
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });

  // const [anchorEl, setAnchorEl] = useState(null);
  // const spanRef = useRef();

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
    console.log('FROM GPT SUMMARY FUNC, publications: ', publicationsArr);
    console.log('FROM GPT SUMMARY FUNC, sentence: ', sentenceRes);
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
    console.log('CLICKED FROM GPU SUMMARY FUNC');
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
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json(); // Parse the JSON in the response ? Or is it a text?
      })
      .then(data => {
        console.log('KG SUMMARIZER Success:', data);
        setAISummaryData(data);
        setPopoverOpen('aiSummary');
        setPopoverPosition({ x: event.clientX, y: event.clientY });
        console.log(event.target);
      })
      .catch(error => {
        setAISummaryData('Error getting response from KG-Summarizer');
        setPopoverOpen('aiSummary');
        setPopoverPosition({ x: event.clientX, y: event.clientY });
        console.error('KG SUMMARIZER Error:', error);
      });
  }

  // function handlePopoverClose() {
  //   setAnchorEl(null);
  //   setPopoverOpen(null);
  // }
  // const open = Boolean(anchorEl);
  // const id = open ? "simple-popover" : undefined;

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
      <GPTSummaryButton
        onClick={(event) => {
          event.persist();
          onGPTSummary(event, aiJSON);
        }}
        variant="outlined"
        // aria-describedby={id}
      >
        Get AI Summary
      </GPTSummaryButton>
      {/* <Popover
        id={id}
        open={popoverOpen === 'aiSummary'}
        onClose={handlePopoverClose}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      > */}
      <Popover
        open={popoverOpen === 'aiSummary'}
        onClose={() => setPopoverOpen(null)}
        anchorPosition={{ top: popoverPosition.y, left: popoverPosition.x }}
        above
      >
        <div> {aiSummaryData} </div>
      </Popover>
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
