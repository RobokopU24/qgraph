import React, {
  useContext, useState, useRef,
} from 'react';
import Popover from '@material-ui/core/Popover';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';

import QueryBuilderContext from '~/context/queryBuilder';

import QueryGraph from './QueryGraph';
import NodeSelector from './textEditorRow/NodeSelector';
import PredicateSelector from './textEditorRow/PredicateSelector';

import './graphEditor.css';

const width = 600;
const height = 400;

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
  /**
   * Is the user currently creating an edge?
   * *This property can be changed in the child Query Graph component*
   */
  const creatingEdge = useRef(false);

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
          creatingEdge={creatingEdge}
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
              creatingEdge.current = true;
              openEditor('', e.currentTarget, 'newEdge');
              // auto close after 5 seconds
              setTimeout(() => {
                setAnchorEl(null);
              }, 5000);
            }}
          >
            Connect Terms
          </Button>
        </div>
        <Popover
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
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
              queryBuilder={queryBuilder}
              edgeId={editorId}
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
