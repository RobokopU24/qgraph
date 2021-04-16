import React, { useState, useContext, useEffect } from 'react';

import ReactJson from 'react-json-view';
import IconButton from '@material-ui/core/IconButton';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';

import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import CheckIcon from '@material-ui/icons/Check';
// import UndoIcon from '@material-ui/icons/Undo';
import CloseIcon from '@material-ui/icons/Close';

import trapiUtils from '~/utils/trapi';
import usePageStatus from '~/stores/usePageStatus';
import AlertContext from '~/context/alert';
import QueryBuilderContext from '~/context/queryBuilder';

/**
 * Query Builder json editor interface
 * @param {obj} queryBuilder query builder custom hook
 * @param {bool} show whether to show the json editor or not
 * @param {func} close close the json editor
 */
export default function JsonEditor({ show, close }) {
  const queryBuilder = useContext(QueryBuilderContext);
  const [errorMessages, setErrorMessages] = useState('');
  const [queryGraph, updateQueryGraph] = useState(queryBuilder.query_graph);
  const pageStatus = usePageStatus(false);
  const displayAlert = useContext(AlertContext);

  function updateJson(e) {
    // updated_src is the updated graph RJV gives back
    const data = e.updated_src;
    setErrorMessages(trapiUtils.validateGraph(data, 'Query Graph'));
    updateQueryGraph(data);
  }

  function onUpload(event) {
    const { files } = event.target;
    files.forEach((file) => {
      const fr = new window.FileReader();
      fr.onloadstart = () => pageStatus.setLoading('Loading Query Graph');
      fr.onloadend = () => pageStatus.setSuccess();
      fr.onload = (e) => {
        const fileContents = e.target.result;
        try {
          let graph = JSON.parse(fileContents);
          let errors = [];
          if (graph.message) {
            errors = trapiUtils.validateMessage(graph);
            setErrorMessages(errors);
            if (!errors.length) {
              graph = graph.message.query_graph;
            }
          } else {
            setErrorMessages(trapiUtils.validateGraph(graph, 'Query Graph'));
          }
          updateQueryGraph(graph);
        } catch (err) {
          displayAlert('error', 'Failed to read this query graph. Are you sure this is valid JSON?');
        }
      };
      fr.onerror = () => {
        displayAlert('error', 'Sorry but there was a problem uploading the file. The file may be invalid JSON.');
      };
      fr.readAsText(file);
    });
    // This clears out the input value so you can upload a second time
    event.target.value = '';
  }

  useEffect(() => {
    if (show) {
      updateQueryGraph(queryBuilder.query_graph);
    }
  }, [show]);

  return (
    <Dialog
      open={show}
      fullWidth
      maxWidth="lg"
      onClose={close}
    >
      <DialogTitle style={{ padding: 0 }}>
        <div id="jsonEditorTitle">
          <div>
            {/* <IconButton
              style={{ fontSize: '18px' }}
              title="Revert"
              disabled={!pageStatus.displayPage}
              onClick={() => {
                setErrorMessages(trapiUtils.validateGraph(initialQueryGraph.current));
                updateQueryGraph(initialQueryGraph.current);
              }}
            >
              <UndoIcon />
            </IconButton> */}
            <label htmlFor="jsonEditorUpload" id="uploadIconLabel">
              <input
                accept=".json"
                style={{ display: 'none' }}
                type="file"
                id="jsonEditorUpload"
                onChange={(e) => onUpload(e)}
                disabled={!pageStatus.displayPage}
              />
              <IconButton
                component="span"
                disabled={!pageStatus.displayPage}
                style={{ fontSize: '18px' }}
                title="Load"
              >
                <CloudUploadIcon />
              </IconButton>
            </label>
          </div>
          <div style={{ color: '#777' }}>
            Query Graph JSON Editor
          </div>
          <IconButton
            style={{
              fontSize: '18px',
            }}
            title="Close Editor"
            onClick={close}
          >
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>
      <DialogContent dividers style={{ padding: 0, height: '10000px' }}>
        <pageStatus.Display />
        {pageStatus.displayPage && (
          <div style={{ display: 'flex', height: '100%' }}>
            <div
              style={{
                overflowY: 'auto',
                paddingBottom: '5px',
                flexGrow: 1,
              }}
            >
              <ReactJson
                name={false}
                theme="rjv-default"
                collapseStringsAfterLength={15}
                indentWidth={2}
                iconStyle="triangle"
                displayObjectSize={false}
                displayDataTypes={false}
                defaultValue=""
                src={queryGraph}
                onEdit={updateJson}
                onAdd={updateJson}
                onDelete={updateJson}
              />
            </div>
            {errorMessages.length > 0 && (
              <div style={{ flexShrink: 1, paddingRight: '20px' }}>
                <h4>
                  This query graph is not valid.
                </h4>
                {errorMessages.map((err, i) => (
                  <p key={i}>{err}</p>
                ))}
              </div>
            )}
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <IconButton
          disabled={errorMessages.length > 0 || !pageStatus.displayPage}
          style={{
            fontSize: '18px',
          }}
          title="Save Changes"
          onClick={() => {
            queryBuilder.saveJson(queryGraph);
            close();
          }}
        >
          <CheckIcon />
        </IconButton>
      </DialogActions>
    </Dialog>
  );
}
