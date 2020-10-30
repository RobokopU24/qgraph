import React, {
  useState, useEffect, useContext, useMemo,
} from 'react';
import ReactJson from 'react-json-view';
import SplitPane from 'react-split-pane';
import IconButton from '@material-ui/core/IconButton';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';

import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import CheckIcon from '@material-ui/icons/Check';
import UndoIcon from '@material-ui/icons/Undo';

import QuestionGraphView from '@/components/shared/graphs/QuestionGraphView';

import config from '@/config.json';
import AlertContext from '@/context/alert';
import queryGraphUtils from '@/utils/queryGraph';

import './jsonEditor.css';

export default function QuestionJsonEditor(props) {
  const {
    height = '100%',
    questionStore,
    callbackSave,
    close,
    show,
  } = props;
  const [queryGraph, updateQueryGraph] = useState(queryGraphUtils.getEmptyGraph());
  const [thinking, setThinking] = useState(false);
  const [errorMessages, setErrorMessages] = useState('');

  const displayAlert = useContext(AlertContext);

  function validateQueryGraph(graph) {
    // Quick question validity checks (not bullet proof, just to help you out a little)
    // This is primary meant to catch graph display errors
    const errMessage = [];

    // Check for nodes
    if (!graph.nodes) {
      errMessage.push('A query graph requires a "nodes" property.');
    } else {
      // Since every node has and id we can check if they are unique
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
      // question.edges is an array
      const edgesHaveIds = Object.keys(graph.edges).reduce((val, e) => val && graph.edges[e] && graph.edges[e].source_id && graph.edges[e].target_id, true);
      if (!edgesHaveIds) {
        errMessage.push('Each edge must have a "source_id" and a "target_id" property.');
      }
    }

    setErrorMessages(errMessage);
  }

  function updateJson(e) {
    const data = e.updated_src;
    validateQueryGraph(data);

    updateQueryGraph(data);
  }

  function onUpload(acceptedFiles) {
    acceptedFiles.forEach((file) => {
      const fr = new window.FileReader();
      fr.onloadstart = () => setThinking(true);
      fr.onloadend = () => setThinking(false);
      fr.onload = (e) => {
        const fileContents = e.target.result;
        try {
          let graph = JSON.parse(fileContents);

          if (graph.query_graph) {
            graph = graph.query_graph;
          } else if (graph.question_graph) {
            graph = graph.question_graph;
          }
          if (graph.nodes && Array.isArray(graph.nodes)) {
            graph = queryGraphUtils.convert.reasonerToInternal(graph);
          }
          console.log(graph);
          validateQueryGraph(graph);
          // only store query_graph
          updateQueryGraph(graph);
        } catch (err) {
          displayAlert('error', 'Failed to read this query graph. Are you sure this is valid json?');
        }
      };
      fr.onerror = () => {
        displayAlert('error', 'Sorry but there was a problem uploading the file. The file may be invalid JSON.');
      };
      fr.readAsText(file);
    });
  }

  useEffect(() => {
    validateQueryGraph(questionStore.query_graph);
    updateQueryGraph(questionStore.query_graph);
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
              disabled={thinking}
              onClick={close}
            >
              <UndoIcon />
            </IconButton>
            <label htmlFor="jsonEditorUpload">
              <input
                accept=".json"
                style={{ display: 'none' }}
                type="file"
                id="jsonEditorUpload"
                onChange={(e) => onUpload(e.target.files)}
                disabled={thinking}
              />
              <IconButton
                component="span"
                disabled={thinking}
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
            disabled={errorMessages.length > 0 || thinking}
            style={{
              fontSize: '18px',
            }}
            title="Save Changes"
            onClick={() => callbackSave(queryGraph)}
          >
            <CheckIcon />
          </IconButton>
        </div>
      </DialogTitle>
      <DialogContent style={{ padding: 0 }}>
        <div style={{ height, borderTop: '1px solid grey' }}>
          <SplitPane
            split="vertical"
            minSize={300}
            maxSize={-300}
            defaultSize="50%"
          >
            <div style={{ overflowY: 'auto' }}>
              <ReactJson
                name={false}
                theme="rjv-default"
                collapseStringsAfterLength={15}
                indentWidth={2}
                iconStyle="triangle"
                displayObjectSize={false}
                displayDataTypes={false}
                src={queryGraph}
                onEdit={updateJson}
                onAdd={updateJson}
                onDelete={updateJson}
              />
            </div>
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
          </SplitPane>
        </div>
      </DialogContent>
    </Dialog>
  );
}
