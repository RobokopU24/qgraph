import React, {
  useEffect, useMemo, useRef, useContext, useState,
} from 'react';
import * as d3 from 'd3';
import Popover from '@material-ui/core/Popover';
import Popper from '@material-ui/core/Popper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';

import queryGraphUtils from '~/utils/queryGraphUtils';
import getNodeCategoryColorMap from '~/utils/colorUtils';
import BiolinkContext from '~/context/biolink';

import queryGraph from './queryGraph';
import NodeSelector from './nodeSelector/NodeSelector';
import PredicateSelector from './nodeSelector/PredicateSelector';
// import GraphPopup from './graphPopup/GraphPopup';

import './d3Graph.css';

const width = 600;
const height = 400;

export default function NewD3Graph({ queryBuilder }) {
  const { query_graph } = queryBuilder;
  const convertedQueryGraph = useMemo(() => queryGraphUtils.convert.internalToReasoner(query_graph), [query_graph]);
  const svgRef = useRef();
  const { concepts } = useContext(BiolinkContext);
  const nodeCategoryColorMap = useMemo(() => getNodeCategoryColorMap(concepts), [concepts]);
  const updateGraph = useRef(() => {});
  const [anchorEl, setAnchorEl] = useState(null);
  const [popoverType, setPopoverType] = useState('');
  const [nodeId, setNodeId] = useState('');
  const [edgeId, setEdgeId] = useState('');
  // const [popupContent, setPopupContent] = useState({});

  function openNodeEditor(id, anchor) {
    setNodeId(id);
    setAnchorEl(anchor);
    setPopoverType('editNode');
  }

  function openEdgeEditor(id, anchor) {
    setEdgeId(id);
    setAnchorEl(anchor);
    setPopoverType('editEdge');
  }

  useEffect(() => {
    d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('border', '1px solid black')
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', [0, 0, width, height]);
    updateGraph.current = queryGraph(
      svgRef, height, width, nodeCategoryColorMap, 40,
      openNodeEditor, openEdgeEditor,
    );
  }, []);

  function drawGraph() {
    const { nodes, edges } = convertedQueryGraph;
    edges.forEach((e) => {
      e.source = e.subject;
      e.target = e.object;
    });
    // need to send updated queryBuilder instance to graph
    updateGraph.current.update({ nodes, edges }, queryBuilder);
  }

  useEffect(() => {
    drawGraph();
  }, [convertedQueryGraph]);

  return (
    <div id="graphContainer" style={{ height: height + 50, width }}>
      <svg ref={svgRef} />
      <div id="graphBottomButtons">
        <Button
          onClick={(e) => {
            setNodeId(queryBuilder.addHop());
            setAnchorEl(e.currentTarget);
            setPopoverType('newNode');
          }}
        >
          Add New Term
        </Button>
        <Popper
          open={Boolean(anchorEl) && popoverType === 'newEdge'}
          anchorEl={anchorEl}
          placement="top-start"
        >
          <ClickAwayListener onClickAway={() => setAnchorEl(null)}>
            <Paper style={{ padding: '10px' }}>
              <p>Select two terms to connect!</p>
            </Paper>
          </ClickAwayListener>
        </Popper>
        <Button
          onClick={(e) => {
            updateGraph.current.addNewConnection(queryBuilder.addEdge);
            setAnchorEl(e.currentTarget);
            setPopoverType('newEdge');
            // auto close after 5 seconds
            setTimeout(() => {
              setAnchorEl(null);
            }, 5000);
          }}
        >
          Connect Terms
        </Button>
      </div>
      {/* <GraphPopup
        popup={popupContent}
        close={() => setPopupContent('')}
      /> */}
      <Popover
        open={Boolean(anchorEl) && (popoverType === 'newNode' || popoverType === 'editNode')}
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
        <NodeSelector
          node={query_graph.nodes[nodeId]}
          nodeId={nodeId}
          updateNode={queryBuilder.updateNode}
          original
          nodeOptions={{
            includeExistingNodes: false,
          }}
        />
      </Popover>
      <Popover
        open={Boolean(anchorEl) && popoverType === 'editEdge'}
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
        <PredicateSelector
          queryBuilder={queryBuilder}
          edgeId={edgeId}
        />
      </Popover>
    </div>
  );
}
