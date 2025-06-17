import {
  Button, Divider, IconButton, List, ListItem, ListItemText, ListSubheader, Modal, makeStyles,
} from '@material-ui/core';
import ReactJsonView from 'react-json-view';
import React, { useContext, useState, useEffect } from 'react';
import { Close } from '@material-ui/icons';
import QueryBuilderContext from '~/context/queryBuilder';
import API from '~/API/authRoutes';
import { authApi } from '../../../API/baseUrlProxy';

const useStyles = makeStyles((theme) => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[5],
    display: 'flex',
    flexDirection: 'row',
    width: 1200,
    height: 900,
    borderRadius: '8px',
  },
}));

function PleaseSelectAnExampleText() {
  return (
    <div style={{
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '2.5rem',
      fontStyle: 'italic',
      color: '#acacac',
    }}
    >
      Please select a query from the list
    </div>
  );
}

export default function LoadQuery({
  open,
  setOpen,
}) {
  const classes = useStyles();
  const queryBuilder = useContext(QueryBuilderContext);

  const [queries, setQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);

  const handleClose = () => {
    setOpen(false);
    setSelectedQuery(null);
  };

  const handleSelectQuery = (query) => {
    setSelectedQuery(query);
    queryBuilder.dispatch({ type: 'saveGraph', payload: query.query });
  };

  useEffect(() => {
    authApi.get(API.queryRoutes.base).then((response) => {
      setQueries(response.data);
    }).catch(() => {
      // TODO: Handle error appropriately
    });
  }, []);

  return (
    <Modal open={open} onClose={handleClose} className={classes.modal}>
      <div className={classes.paper}>
        <List
          style={{ flexBasis: 350, overflowY: 'auto' }}
          subheader={(
            <ListSubheader
              component="div"
              style={{
                background: 'white',
                borderBottom: '2px solid rgba(0, 0, 0, 0.12)',
              }}
            >
              Please select a saved query below
            </ListSubheader>
          )}
        >
          {queries.map((query, i) => (
            <ListItem
              button
              divider
              key={i}
              onClick={() => {
                handleSelectQuery(query);
              }}
            >
              <ListItemText>
                {query.name}
              </ListItemText>
            </ListItem>
          ))}
        </List>
        <Divider orientation="vertical" flexItem />
        <div
          style={{
            display: 'flex',
            flex: '1',
            padding: '1rem',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <IconButton size="small" onClick={handleClose}>
              <Close />
            </IconButton>
          </div>

          <div style={{ flex: '1', overflowY: 'auto' }}>
            {
              selectedQuery === null
                ? <PleaseSelectAnExampleText />
                : (
                  <ReactJsonView
                    name={false}
                    theme="rjv-default"
                    collapseStringsAfterLength={15}
                    indentWidth={2}
                    iconStyle="triangle"
                    enableClipboard={false}
                    displayObjectSize={false}
                    displayDataTypes={false}
                    defaultValue=""
                    src={selectedQuery.query.message.query_graph}
                  />
                )
            }
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <Button variant="contained" color="primary" onClick={handleClose}>
              Done
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
