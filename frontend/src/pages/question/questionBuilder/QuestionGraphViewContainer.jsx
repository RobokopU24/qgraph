import React, {
  useState, useEffect, useMemo,
} from 'react';
import { FaPlusSquare } from 'react-icons/fa';
import { Button } from 'react-bootstrap';

import queryGraphUtils from '@/utils/queryGraph';

import QuestionGraphView from '../../../components/shared/graphs/QuestionGraphView';
import NewQuestionPanelModal from '../panels/NewQuestionPanelModal';
import ButtonGroupPanel from '../subComponents/ButtonGroupPanel';
import QueryJsonEditor from './QueryJsonEditor';

import useNewQuestionPanel from './useNewQuestionPanel';

import config from '../../../config.json';

// const graphStates = {
//   fetching: 'fetching',
//   empty: 'empty',
//   display: 'display',
//   error: 'error',
// };

function getHeight() {
  const h = window.innerHeight - 50;
  return `${h}px`;
}

/**
 * Question Graph View Container
 * @param {Object} questionStore new question custom hook
 * @param {Number} height height of the Question Graph
 * @param {Number} width width of the Question Graph
 */
export default function QuestionGraphViewContainer(props) {
  const { questionStore, height = getHeight(), width = '100%' } = props;
  const [showJsonEditor, toggleJsonEditor] = useState(false);
  const panelStore = useNewQuestionPanel();
  function graphClickCallback(data) {
    if (data.nodes.length > 0) {
      // const clickedNode = questionStore.getNode(data.nodes[0]);
      // questionStore.updateNodeById(data.nodes[0]);
      panelStore.openPanel('node', data.nodes[0]);
      // panelStore.loadNode(clickedNode);
    } else if (data.edges.length > 0) {
      // questionStore.updateEdgeById(data.edges[0]);
      // const clickedEdge = questionStore.getEdge(data.edges[0]);
      panelStore.openPanel('edge', data.edges[0]);
      // panelStore.loadEdge(clickedEdge);
    }
  }
  const graphClickCallbackMemo = useMemo(() => graphClickCallback, []);

  /**
   * Save the value from the json editor
   * @param {Object} query json object of format
   * @param {Object} query.query_graph consisting of nodes and edges
   */
  function saveJsonEditor(query) {
    questionStore.updateQueryGraph(query);
    toggleJsonEditor(!showJsonEditor);
  }

  const numNodes = Object.keys(panelStore.query_graph.nodes).length;
  const numEdges = Object.keys(panelStore.query_graph.edges).length;

  // Update panelStore when questionStore changes
  useEffect(() => {
    panelStore.load(questionStore.query_graph);
  }, [questionStore.query_graph]);

  const query_graph_list_format = useMemo(
    () => queryGraphUtils.convert.internalToReasoner(panelStore.query_graph),
    [panelStore.query_graph],
  );

  return (
    <div id="QuestionGraphViewContainer">
      <ButtonGroupPanel panelStore={panelStore} toggleJsonEditor={() => toggleJsonEditor(!showJsonEditor)} />
      {(numNodes || numEdges) ? (
        <QuestionGraphView
          height={height}
          width={width}
          question={query_graph_list_format}
          concepts={config.concepts}
          graphState={questionStore.graphState}
          selectable
          graphClickCallback={graphClickCallbackMemo}
        />
      ) : (
        <div
          style={{
            height, display: 'table', width: '100%',
          }}
        >
          <div style={{ display: 'table-cell', verticalAlign: 'middle', textAlign: 'center' }}>
            {/* {showFetching && (
              <div>
                <FaSpinner className="icon-spin" style={{ marginRight: '10px', verticalAlign: 'text-top' }} />
                Graph update in progress... Please wait.
              </div>
            )} */}
            {/* {notInitialized && ( */}
            {numNodes === 0 && (
              <Button bsSize="large" onClick={() => panelStore.openPanel('node')}>
                <FaPlusSquare style={{ verticalAlign: 'text-top' }} />{' Add Node'}
              </Button>
            )}
            {/* {error && (
              <span>
                There was an error with the query graph specification
              </span>
            )} */}
          </div>
        </div>
      )}
      {((numNodes === 1 || numNodes === 2) && numEdges === 0) && (
        <div style={{ position: 'absolute', top: '47%', right: '20%' }}>
          <Button bsSize="large" onClick={() => panelStore.openPanel(numNodes === 1 ? 'node' : 'edge')}>
            <FaPlusSquare style={{ verticalAlign: 'text-top' }} />{` Add ${numNodes === 1 ? 'Node' : 'Edge'}`}
          </Button>
        </div>
      )}
      <NewQuestionPanelModal
        onQuestionUpdated={(updated_q) => questionStore.updateQueryGraph(updated_q)}
        panelStore={panelStore}
      />
      <QueryJsonEditor
        show={showJsonEditor}
        questionStore={questionStore}
        callbackSave={saveJsonEditor}
        close={() => toggleJsonEditor(!showJsonEditor)}
      />
    </div>
  );
}
