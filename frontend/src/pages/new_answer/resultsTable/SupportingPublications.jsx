import React, { useReducer, useEffect } from 'react';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import shortid from 'shortid';

function reducer(state, action) {
  switch (action.type) {
    case 'toggle':
      state[action.key] = !state[action.key];
      break;
    case 'clear':
      return {};
    default:
      break;
  }
  return { ...state };
}

export default function SupportingPublications({ metaData }) {
  const [open, dispatch] = useReducer(reducer, {});

  useEffect(() => {
    dispatch({ type: 'clear' });
  }, [metaData]);

  return (
    <Paper
      id="resultMetaData"
      elevation={3}
    >
      <h4>Supporting Publications</h4>
      <List>
        {Object.entries(metaData).map(([edgeDescription, publications]) => (
          <React.Fragment key={shortid.generate()}>
            {publications.length > 0 && (
              <>
                <ListItem
                  button
                  onClick={() => dispatch({ type: 'toggle', key: edgeDescription })}
                >
                  <ListItemText primary={edgeDescription} />
                  {open[edgeDescription] ? <ExpandLess /> : <ExpandMore />}
                </ListItem>
                <Collapse in={open[edgeDescription]} timeout="auto" unmountOnExit>
                  <List component="div">
                    {publications.map((publication) => (
                      <ListItem
                        button
                        component="a"
                        key={shortid.generate()}
                        href={`https://www.ncbi.nlm.nih.gov/pubmed/${publication.split(':')[1]}/`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ListItemText
                          primary={`https://www.ncbi.nlm.nih.gov/pubmed/${publication.split(':')[1]}/`}
                          inset
                        />
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </>
            )}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
}
