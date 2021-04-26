/* eslint-disable indent, no-use-before-define, func-names, no-return-assign */
import React, {
  useEffect, useContext, useRef, useMemo,
} from 'react';
import * as d3 from 'd3';
import graphUtils from '~/utils/d3/graph';
import nodeUtils from '~/utils/d3/nodes';
import edgeUtils from '~/utils/d3/edges';
import highlighter from '~/utils/d3/highlighter';

import BiolinkContext from '~/context/biolink';
import QueryBuilderContext from '~/context/queryBuilder';
import getNodeCategoryColorMap from '~/utils/colors';
import queryGraphUtils from '~/utils/queryGraph';

const nodeRadius = 40;

/**
 * Main D3 query graph component
 * @param {int} height - height of the query graph element
 * @param {int} width - width of the query graph element
 * @param {func} openEditor - function to open node or edge editor
 * @param {obj} graphClickState - dict of graph click state properties
 * @param {func} updateClickState - reducer to update graph click state
 */
export default function QueryGraph({
  height, width,
  openEditor,
  graphClickState, updateClickState,
}) {
  const { concepts } = useContext(BiolinkContext);
  const queryBuilder = useContext(QueryBuilderContext);
  const nodeCategoryColorMap = useMemo(() => getNodeCategoryColorMap(concepts), [concepts]);
  const { query_graph } = queryBuilder;
  const queryGraph = useMemo(() => queryGraphUtils.getGraphEditorFormat(query_graph), [query_graph]);
  const node = useRef({});
  const edge = useRef({});
  const svgRef = useRef();
  const svg = useRef();
  const simulation = useRef();
  /**
   * Node args
   * @property {int} nodeRadius - radius of node circles
   * @property {func} colorMap - function to get node background color
   */
  const nodeArgs = {
    nodeRadius,
    colorMap: nodeCategoryColorMap,
  };

  /**
   * Initialize the svg
   */
   useEffect(() => {
    svg.current = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('border', '1px solid black')
      .attr('preserveAspectRatio', 'xMinYMin meet')
      .attr('viewBox', [0, 0, width, height]);
  }, []);

  /**
   * Initialize node and edge containers
   */
  useEffect(() => {
    if (svg.current.select('#nodeContainer').empty()) {
      svg.current.append('g')
        .attr('id', 'nodeContainer');
    }
    if (svg.current.select('#edgeContainer').empty()) {
      svg.current.append('g')
        .attr('id', 'edgeContainer');
    }
    edge.current = svg.current.select('#edgeContainer').selectAll('g');
    node.current = svg.current.select('#nodeContainer').selectAll('g');
  }, []);

  /**
   * Create special svg effects on initialization
   *
   * - Edge arrows
   * - Shading for 'Set' nodes
   */
  useEffect(() => {
    if (svg.current.select('defs').empty()) {
      // edge arrow
      const defs = svg.current.append('defs');
      defs.append('marker')
        .attr('id', 'arrow')
        .attr('viewBox', [0, 0, 20, 13])
        .attr('refX', 20)
        .attr('refY', 6.5)
        .attr('markerWidth', 6.5)
        .attr('markerHeight', 25)
        .attr('orient', 'auto-start-reverse')
        .append('path')
          .attr('d', d3.line()([[0, 0], [0, 13], [25, 6.5]]))
          .attr('fill', '#999');
      // set nodes shadow
      // http://bl.ocks.org/cpbotha/5200394
      const shadow = defs.append('filter')
        .attr('id', 'setShadow')
        .attr('width', '250%')
        .attr('height', '250%');
      shadow.append('feGaussianBlur')
        .attr('in', 'SourceAlpha')
        .attr('stdDeviation', 5)
        .attr('result', 'blur');
      shadow.append('feOffset')
        .attr('in', 'blur')
        .attr('dx', 0)
        .attr('dy', 0)
        .attr('result', 'offsetBlur');
      const feMerge = shadow.append('feMerge');
      feMerge.append('feMergeNode')
        .attr('in', 'offsetBlur');
      feMerge.append('feMergeNode')
        .attr('in', 'SourceGraphic');
    }
  }, []);

  /**
   * Base d3 force simulation initialization
   */
  useEffect(() => {
    simulation.current = d3.forceSimulation()
      .force('collide', d3.forceCollide().radius(nodeRadius))
      .force('link', d3.forceLink().id((d) => d.id).distance(200).strength(1))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.05))
      .on('tick', ticked);
  }, []);

  /**
   * Move all nodes and edges on each simulation 'tick'
   */
  function ticked() {
    node.current
      .attr('transform', (d) => {
        d.x = graphUtils.boundedNode(d.x, width, nodeRadius);
        d.y = graphUtils.boundedNode(d.y, height, nodeRadius);
        return `translate(${d.x},${d.y})`;
      });

    edge.current
      .select('.edgePath')
        .attr('d', (d) => {
          const {
            x1, y1, qx, qy, x2, y2,
          } = graphUtils.getCurvedEdgePos(d.source.x, d.source.y, d.target.x, d.target.y, d.numEdges, d.index, nodeRadius);
          return `M${x1},${y1}Q${qx},${qy} ${x2},${y2}`;
        });

    edge.current
      .select('.edgeTransparent')
        .attr('d', (d) => {
          const {
            x1, y1, qx, qy, x2, y2,
          } = graphUtils.getCurvedEdgePos(d.source.x, d.source.y, d.target.x, d.target.y, d.numEdges, d.index, nodeRadius);
          // if necessary, flip transparent path so text is always right side up
          const leftNode = x1 > x2 ? `${x2},${y2}` : `${x1},${y1}`;
          const rightNode = x1 > x2 ? `${x1},${y1}` : `${x2},${y2}`;
          return `M${leftNode}Q${qx},${qy} ${rightNode}`;
        });

    edge.current
      .select('.source')
        .attr('cx', (d) => {
          const { x1 } = graphUtils.getCurvedEdgePos(d.source.x, d.source.y, d.target.x, d.target.y, d.numEdges, d.index, nodeRadius);
          const boundedVal = graphUtils.boundedEdge(x1, width);
          // set internal x value of edge end
          d.x = boundedVal;
          return boundedVal;
        })
        .attr('cy', (d) => {
          const { y1 } = graphUtils.getCurvedEdgePos(d.source.x, d.source.y, d.target.x, d.target.y, d.numEdges, d.index, nodeRadius);
          const boundedVal = graphUtils.boundedEdge(y1, height);
          // set internal y value of edge end
          d.y = boundedVal;
          return boundedVal;
        });

    edge.current
      .select('.target')
        .attr('cx', (d) => {
          const { x2 } = graphUtils.getCurvedEdgePos(d.source.x, d.source.y, d.target.x, d.target.y, d.numEdges, d.index, nodeRadius);
          const boundedVal = graphUtils.boundedEdge(x2, width);
          // set internal x value of edge end
          d.x = boundedVal;
          return boundedVal;
        })
        .attr('cy', (d) => {
          const { y2 } = graphUtils.getCurvedEdgePos(d.source.x, d.source.y, d.target.x, d.target.y, d.numEdges, d.index, nodeRadius);
          const boundedVal = graphUtils.boundedEdge(y2, height);
          // set internal y value of edge end
          d.y = boundedVal;
          return boundedVal;
        });

    edge.current
      .select('.edgeButtons')
        .attr('transform', (d) => {
          const { x, y } = graphUtils.getEdgeMiddle(d);
          return `translate(${x},${y})`;
        });
  }

  /**
   * Update displayed query graph
   */
  useEffect(() => {
    // preserve node position by using the already existing nodes
    const oldNodes = new Map(node.current.data().map((d) => [d.id, { x: d.x, y: d.y }]));
    const nodes = queryGraph.nodes.map((d) => Object.assign(oldNodes.get(d.id) || { x: Math.random() * width, y: Math.random() * height }, d));
    // edges need to preserve some internal properties
    const edges = queryGraph.edges.map((d) => ({ ...d }));

    // simulation adds x and y properties to nodes
    simulation.current.nodes(nodes);
    // simulation converts source and target properties of
    // edges to node objects
    simulation.current.force('link').links(edges);
    simulation.current.alpha(1).restart();

    node.current = node.current.data(nodes, (d) => d.id)
      .join(
        (n) => nodeUtils.enter(n, nodeArgs),
        (n) => nodeUtils.update(n, nodeArgs),
        (n) => nodeUtils.exit(n),
      );

    // edge ends need the x and y of their attached nodes
    // must come after simulation
    const edgesWithCurves = queryGraphUtils.addEdgeCurveProperties(edges);

    edge.current = edge.current.data(edgesWithCurves, (d) => d.id)
      .join(
        edgeUtils.enter,
        edgeUtils.update,
        edgeUtils.exit,
      );
  }, [queryGraph]);

  function updateEdge(edgeId, edgeType, nodeId) {
    const success = queryBuilder.updateEdge(edgeId, edgeType, nodeId);
    if (!success) {
      // hacky, calls the tick function which moves the edge ends back
      simulation.current.alpha(0.001).restart();
    }
  }

  /**
   * Set click and hover listeners when graphClickState or query graph changes
   */
  useEffect(() => {
    if (graphClickState.creatingConnection) {
      // creating a new edge
      const addNodeToConnection = (id) => updateClickState({ type: 'connectTerm', value: id });
      nodeUtils.attachConnectionClick(addNodeToConnection);
      nodeUtils.removeMouseHover();
      // edges shouldn't react when creating a new edge
      edgeUtils.removeClicks();
      edgeUtils.removeMouseHover();
    } else {
      const { editId } = graphClickState;
      const setEditId = (id) => updateClickState({ type: 'setEditId', value: id });
      nodeUtils.attachNodeClick(editId, setEditId);
      nodeUtils.attachEditClick(openEditor, setEditId);
      nodeUtils.attachDeleteClick(queryBuilder.deleteNode, setEditId);
      nodeUtils.attachMouseHover(editId);
      nodeUtils.attachDrag(simulation.current, width, height, nodeRadius);

      edgeUtils.attachEdgeClick(editId, setEditId);
      edgeUtils.attachEditClick(openEditor, setEditId);
      edgeUtils.attachDeleteClick(queryBuilder.deleteEdge, setEditId);
      edgeUtils.attachMouseHover(editId);
      edgeUtils.attachDrag(simulation.current, width, height, nodeRadius, updateEdge);
    }
    // set svg global click listener for highlighting
    svg.current.on('click', (e) => {
      d3.selectAll('.deleteRect,.deleteLabel,.editRect,.editLabel')
        .style('display', 'none');
      d3.select('#edgeContainer').raise();
      highlighter.clearAllNodes();
      highlighter.clearAllEdges();
      if (graphClickState.editId !== '') {
        updateClickState({ type: 'setEditId', value: '' });
      }
      // stop click events from leaving svg area.
      // clicks were closing any alerts immediately.
      e.stopPropagation();
    });
  }, [graphClickState, queryGraph]);

  return (
    <svg ref={svgRef} />
  );
}
