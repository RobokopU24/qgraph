import React, {
  useContext, useReducer, useEffect,
} from 'react';
import Popover from '@material-ui/core/Popover';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';

import QueryBuilderContext from '~/context/queryBuilder';
import nodeUtils from '~/utils/d3/nodes';

import QueryGraph from './QueryGraph';
import NodeSelector from './textEditorRow/NodeSelector';
import PredicateSelector from './textEditorRow/PredicateSelector';

import './graphEditor.css';

const width = 600;
const height = 400;

function reducer(state, action) {
  switch (action.type) {
    case 'startConnection': {
      const { anchor } = action.payload;
      state.creatingConnection = true;
      state.popoverId = '';
      state.popoverAnchor = anchor;
      state.popoverType = 'newEdge';
      break;
    }
    case 'connectTerm': {
      const { id } = action.payload;
      state.chosenTerms = [...state.chosenTerms, id];
      break;
    }
    case 'connectionMade': {
      state.creatingConnection = false;
      state.chosenTerms = [];
      break;
    }
    case 'click': {
      const { id } = action.payload;
      state.clickedId = id;
      break;
    }
    case 'openEditor': {
      const { id, type, anchor } = action.payload;
      state.popoverId = id;
      state.popoverType = type;
      state.popoverAnchor = anchor;
      break;
    }
    case 'closeEditor': {
      state.popoverId = '';
      state.popoverType = '';
      state.popoverAnchor = null;
      break;
    }
    default: {
      return state;
    }
  }
  return { ...state };
}

/**
 * Query Builder graph editor interface
 * @param {obj} queryBuilder query builder custom hook
 */
export default function GraphEditor() {
  const queryBuilder = useContext(QueryBuilderContext);
  const { query_graph } = queryBuilder.state;

  const [state, dispatch] = useReducer(reducer, {
    creatingConnection: false,
    chosenTerms: [],
    clickedId: '',
    popoverId: '',
    popoverAnchor: null,
    popoverType: '',
  });

  function addEdge() {
    queryBuilder.dispatch({ type: 'addEdge', payload: state.chosenTerms });
  }

  function addHop() {
    if (!Object.keys(query_graph.nodes).length) {
      // add a node to an empty graph
      queryBuilder.dispatch({ type: 'addNode', payload: {} });
    } else {
      // add a node and edge
      queryBuilder.dispatch({ type: 'addHop', payload: {} });
    }
  }

  function editNode(id, node) {
    queryBuilder.dispatch({ type: 'editNode', payload: { id, node } });
  }

  function clickNode() {
    const nodeIds = Object.keys(query_graph);
    const lastNodeId = nodeIds[nodeIds.length - 1];
    nodeUtils.clickNode(lastNodeId);
  }

  /**
   * When user selects two nodes while creating an edge, make a new edge
   * and reset click state
   */
  useEffect(() => {
    if (state.creatingConnection && state.chosenTerms.length >= 2) {
      addEdge();
      dispatch({ type: 'connectionMade' });
      // remove border from connected nodes
      nodeUtils.removeBorder();
    }
  }, [state]);

  return (
    <div id="queryGraphEditor">
      <div id="graphContainer" style={{ height: height + 50, width }}>
        <QueryGraph
          height={height}
          width={width}
          clickState={state}
          updateClickState={dispatch}
        />
        <div id="graphBottomButtons">
          <Button
            onClick={(e) => {
              addHop();
              clickNode();
            }}
          >
            Add New Term
          </Button>
          <Button
            onClick={(e) => {
              dispatch({ type: 'startConnection', payload: { anchor: e.currentTarget } });
              // auto close after 5 seconds
              setTimeout(() => {
                dispatch({ type: 'closeEditor' });
              }, 5000);
            }}
          >
            Connect Terms
          </Button>
        </div>
        <Popover
          open={Boolean(state.popoverAnchor)}
          anchorEl={state.popoverAnchor}
          onClose={() => dispatch({ type: 'closeEditor' })}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          {(state.popoverType === 'editNode' || state.popoverType === 'newNode') && (
            <NodeSelector
              properties={query_graph.nodes[state.popoverId]}
              id={state.popoverId}
              update={editNode}
              isReference={false}
              options={{
                includeExistingNodes: false,
              }}
            />
          )}
          {state.popoverType === 'editEdge' && (
            <PredicateSelector
              id={state.popoverId}
            />
          )}
          {state.popoverType === 'newEdge' && (
            <Paper style={{ padding: '10px' }}>
              <p>Select two terms to connect!</p>
            </Paper>
          )}
        </Popover>
      </div>
    </div>
  );
}
