import React, {
  useContext, useState, useReducer, useEffect,
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
    case 'startConnection':
      return { ...state, creatingConnection: action.value };
    case 'connectTerm':
      return { ...state, chosenTerms: [...state.chosenTerms, action.value] };
    case 'connectionMade':
      return { ...state, creatingConnection: false, chosenTerms: [] };
    case 'setEditId':
      return { ...state, editId: action.value };
    default:
      return state;
  }
}

/**
 * Query Builder graph editor interface
 * @param {obj} queryBuilder query builder custom hook
 */
export default function GraphEditor() {
  const queryBuilder = useContext(QueryBuilderContext);
  const { query_graph } = queryBuilder;
  const [anchorEl, setAnchorEl] = useState(null);
  const [popoverType, setPopoverType] = useState('');
  const [editorId, setEditorId] = useState('');

  const [graphClickState, updateClickState] = useReducer(reducer, {
    creatingConnection: false,
    chosenTerms: [],
    editId: '',
  });

  /**
   * When user selects two nodes while creating an edge, make a new edge
   * and reset click state
   */
  useEffect(() => {
    if (graphClickState.creatingConnection && graphClickState.chosenTerms.length >= 2) {
      queryBuilder.addEdge(...graphClickState.chosenTerms);
      updateClickState({ type: 'connectionMade' });
      // remove border from connected nodes
      nodeUtils.removeBorder();
    }
  }, [graphClickState]);

  /**
   * Close popover editor and reset popover type
   */
  function closeEditor() {
    setAnchorEl(null);
    setPopoverType('');
  }

  /**
   * Open Popover editor
   * @param {string} id - node or edge id
   * @param {HTMLElement} anchor - DOM Element to attach popover
   * @param {string} type - type of popover
   */
  function openEditor(id, anchor, type) {
    setEditorId(id);
    setAnchorEl(anchor);
    setPopoverType(type);
  }

  return (
    <div id="queryGraphEditor">
      <div id="graphContainer" style={{ height: height + 50, width }}>
        <QueryGraph
          height={height}
          width={width}
          openEditor={openEditor}
          graphClickState={graphClickState}
          updateClickState={updateClickState}
        />
        <div id="graphBottomButtons">
          <Button
            onClick={(e) => {
              openEditor(queryBuilder.addHop(), e.currentTarget, 'newNode');
            }}
          >
            Add New Term
          </Button>
          <Button
            onClick={(e) => {
              updateClickState({ type: 'startConnection', value: true });
              openEditor('', e.currentTarget, 'newEdge');
              // auto close after 5 seconds
              setTimeout(() => {
                closeEditor();
              }, 5000);
            }}
          >
            Connect Terms
          </Button>
        </div>
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={closeEditor}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          {(popoverType === 'editNode' || popoverType === 'newNode') && (
            <NodeSelector
              properties={query_graph.nodes[editorId]}
              id={editorId}
              update={queryBuilder.updateNode}
              isReference={false}
              options={{
                includeExistingNodes: false,
              }}
            />
          )}
          {popoverType === 'editEdge' && (
            <PredicateSelector
              id={editorId}
            />
          )}
          {popoverType === 'newEdge' && (
            <Paper style={{ padding: '10px' }}>
              <p>Select two terms to connect!</p>
            </Paper>
          )}
        </Popover>
      </div>
    </div>
  );
}
