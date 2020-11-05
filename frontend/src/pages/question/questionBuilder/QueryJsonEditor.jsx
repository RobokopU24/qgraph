import React, {
  useState, useEffect, useContext, useMemo, useRef,
} from 'react';
import ReactJson from 'react-json-view';
import SplitPane from 'react-split-pane';
import { AutoSizer } from 'react-virtualized';
import IconButton from '@material-ui/core/IconButton';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';

import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import CheckIcon from '@material-ui/icons/Check';
import UndoIcon from '@material-ui/icons/Undo';
import CloseIcon from '@material-ui/icons/Close';

import QuestionGraphView from '@/components/shared/graphs/QuestionGraphView';

import config from '@/config.json';
import AlertContext from '@/context/alert';
import usePageStatus from '@/utils/usePageStatus';
import queryGraphUtils from '@/utils/queryGraph';

import './jsonEditor.css';

export default function QuestionJsonEditor(props) {
  const {
    questionStore,
    callbackSave,
    close,
    show,
  } = props;
  const initialQueryGraph = useRef(queryGraphUtils.getEmptyGraph());
  const [queryGraph, updateQueryGraph] = useState(queryGraphUtils.getEmptyGraph());
  const pageStatus = usePageStatus(false);
  const [errorMessages, setErrorMessages] = useState('');

  const displayAlert = useContext(AlertContext);

  function validateQueryGraph(graph) {
    // Quick question validity checks (not bullet proof, just to help you out a little)
    // This is primarily meant to catch graph display errors
    const errMessage = [];

    // Check for nodes
    if (!graph.nodes) {
      errMessage.push('A query graph requires a "nodes" property.');
    } else {
      if (Array.isArray(graph.nodes)) {
        errMessage.push('Nodes should be an object.');
      }
      // Since every node has an id we can check if they are unique
      const nodeIds = new Set(Object.keys(graph.nodes));
      const hasUniqueNodeIds = nodeIds.size === Object.keys(graph.nodes).length;
      if (!hasUniqueNodeIds) {
        errMessage.push('There are multiple nodes with the same ID.');
      }
    }

    // Check for edges
    if (!graph.edges) {
      errMessage.push('A query graph requires an "edges" property.');
    } else {
      if (Array.isArray(graph.edges)) {
        errMessage.push('Edges should be an object.');
      }
      // each edge should have a valid source and target id
      const edgesHaveIds = Object.keys(graph.edges).reduce((val, e) => val && graph.edges[e] && graph.edges[e].source_id && graph.edges[e].target_id, true);
      if (!edgesHaveIds) {
        errMessage.push('Each edge must have a valid "source_id" and a "target_id" property.');
      }
    }

    setErrorMessages(errMessage);
  }

  function updateJson(e) {
    // updated_src is the updated graph RJV gives back
    const data = e.updated_src;
    validateQueryGraph(data);
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

          // rip out just the query graph and convert to our internal
          // representation
          if (graph.query_graph) {
            graph = graph.query_graph;
          } else if (graph.question_graph) {
            graph = graph.question_graph;
          }
          if (graph.nodes && Array.isArray(graph.nodes) && Array.isArray(graph.edges)) {
            graph = queryGraphUtils.convert.reasonerToInternal(graph);
          }
          validateQueryGraph(graph);
          updateQueryGraph(graph);
          initialQueryGraph.current = questionStore.query_graph;
        } catch (err) {
          displayAlert('error', 'Failed to read this query graph. Are you sure this is valid json?');
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
    validateQueryGraph(questionStore.query_graph);
    updateQueryGraph(questionStore.query_graph);
    initialQueryGraph.current = questionStore.query_graph;
  }, [questionStore.query_graph]);

  const query_graph_list_format = useMemo(() => {
    if (!errorMessages.length) {
      return queryGraphUtils.convert.internalToReasoner(queryGraph);
    }
    return queryGraphUtils.getEmptyGraph();
  }, [queryGraph]);

  return (
    <Dialog
      open={show}
      fullWidth
      maxWidth="lg"
    >
      <DialogTitle style={{ padding: 0 }}>
        <div id="jsonEditorTitle">
          <div>
            <IconButton
              style={{ fontSize: '18px' }}
              title="Revert"
              disabled={!pageStatus.displayPage}
              onClick={() => {
                validateQueryGraph(initialQueryGraph.current);
                updateQueryGraph(initialQueryGraph.current);
              }}
            >
              <UndoIcon />
            </IconButton>
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
          <AutoSizer disableWidth id="jsonEditorSplitter">
            {({ height }) => (
              <SplitPane
                split="vertical"
                minSize={300}
                maxSize={-300}
                defaultSize="50%"
              >
                <div
                  style={{
                    height,
                    overflowY: 'auto',
                    paddingBottom: '5px',
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
                {/*
                  TODO: height changes are not causing a graph rerender, so we
                  wait until we have height here.
                */}
                {height ? (
                  <>
                    {!errorMessages.length ? (
                      <QuestionGraphView
                        height={height}
                        concepts={config.concepts}
                        question={query_graph_list_format}
                        selectable
                        interactable={false}
                        graphClickCallback={() => {}}
                      />
                    ) : (
                      <>
                        <h4>
                          This query graph is not valid.
                        </h4>
                        {errorMessages.map((err, i) => (
                          <p key={i}>{err}</p>
                        ))}
                      </>
                    )}
                  </>
                ) : (
                  <div />
                )}
              </SplitPane>
            )}
          </AutoSizer>
        )}
      </DialogContent>
      <DialogActions>
        <IconButton
          disabled={errorMessages.length > 0 || !pageStatus.displayPage}
          style={{
            fontSize: '18px',
          }}
          title="Save Changes"
          onClick={() => callbackSave(queryGraph)}
        >
          <CheckIcon />
        </IconButton>
      </DialogActions>
    </Dialog>
  );
}