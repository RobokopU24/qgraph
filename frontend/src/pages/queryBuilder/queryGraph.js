/* eslint-disable indent, no-use-before-define, func-names, no-return-assign */
import * as d3 from 'd3';
import graphUtils from '~/utils/d3/graph';
import nodeUtils from '~/utils/d3/nodes';
import edgeUtils from '~/utils/d3/edges';
import highlighter from '~/utils/d3/highlighter';

function findKey(obj, prop) {
  const [s, t] = prop.split('--');
  const key = Object.keys(obj).find((k) => {
    const nodeIds = k.split('--');
    if (nodeIds.indexOf(s) > -1 && nodeIds.indexOf(t) > -1) {
      return true;
    }
    return false;
  });
  return key;
}

const edgeHandler = {
  get: (obj, prop) => {
    const key = findKey(obj, prop);
    let inverse = false;
    if (key) {
      if (key !== prop) {
        inverse = true;
      }
      return { indices: obj[key], inverse };
    }
    return { indices: [], inverse };
  },
  set: (obj, prop, val) => {
    const key = findKey(obj, prop);
    if (key) {
      obj[key] = val;
    } else {
      obj[prop] = val;
    }
    return true;
  },
};

/**
 * Main D3 query graph component
 * @param {*} svgRef DOM ref to svg element
 * @param {int} height height of the query graph element
 * @param {int} width width of the query graph element
 * @param {func} colorMap function to get node category color
 * @param {int} nodeRadius radius of each node
 * @param {func} openNodeEditor function to open node editor
 * @param {func} openEdgeEditor function to open edge editor
 * @returns {func} update function
 */
export default function queryGraph(
  svgRef, height, width, colorMap, nodeRadius,
  openNodeEditor, openEdgeEditor,
) {
  let chosenNodes = [];
  const edit = { active: '' };
  /**
   * Common node and edge args
   */
  const edgeArgs = {
    height,
    width,
    nodeRadius,
    edit,
    queryBuilder: null,
  };
  /**
   * Mutable node args
   * @property {func} colorMap function to get node background color
   * @property {func} connectTerms function to create edge between two nodes
   */
  const nodeArgs = {
    ...edgeArgs,
    colorMap,
    connectTerms: null,
  };
  const svg = d3.select(svgRef.current);
  if (svg.select('#nodeContainer').empty()) {
    svg.append('g')
      .attr('id', 'nodeContainer');
  }
  if (svg.select('#edgeContainer').empty()) {
    svg.append('g')
      .attr('id', 'edgeContainer');
  }
  let edge = svg.select('#edgeContainer').selectAll('g');
  let node = svg.select('#nodeContainer').selectAll('g');

  if (svg.select('defs').empty()) {
    // edge arrow
    const defs = svg.append('defs');
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

  svg.on('click', (e) => {
    d3.selectAll('.deleteRect,.deleteLabel,.editRect,.editLabel')
      .style('display', 'none');
    d3.select('#edgeContainer').raise();
    highlighter.clearAllNodes();
    highlighter.clearAllEdges();
    edit.active = '';
    // stop click events from leaving svg area.
    // clicks were closing any alerts immediately.
    e.stopPropagation();
  });

  /**
   * Move all nodes and edges on each simulation 'tick'
   */
  function ticked() {
    node
      .select('.nodeCircle')
        .attr('cx', (d) => d.x = graphUtils.boundedNode(d.x, width, nodeRadius))
        .attr('cy', (d) => d.y = graphUtils.boundedNode(d.y, height, nodeRadius));
    node
      .select('.nodeLabel')
        .attr('x', (d) => graphUtils.boundedNode(d.x, width, nodeRadius))
        .attr('y', (d) => graphUtils.boundedNode(d.y, height, nodeRadius));

    node
      .select('.deleteRect')
        .attr('x', (d) => d.x - 50)
        .attr('y', (d) => d.y - 90);

    node
      .select('.deleteLabel')
        .attr('x', (d) => d.x - 25)
        .attr('y', (d) => d.y - 77);

    node
      .select('.editRect')
        .attr('x', (d) => d.x)
        .attr('y', (d) => d.y - 90);

    node
      .select('.editLabel')
        .attr('x', (d) => d.x + 25)
        .attr('y', (d) => d.y - 77);

    edge
      .select('.edge')
        .attr('d', (d) => {
          const {
            x1, y1, qx, qy, x2, y2,
          } = graphUtils.getCurvedEdgePos(d.source.x, d.source.y, d.target.x, d.target.y, d.numEdges, d.index, nodeRadius);
          return `M${x1},${y1}Q${qx},${qy} ${x2},${y2}`;
        });

    edge
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

    edge
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

    edge
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

    edge
      .select('.deleteRect')
        .attr('x', (d) => graphUtils.getEdgeMiddle(d).x - 50)
        .attr('y', (d) => graphUtils.getEdgeMiddle(d).y - 50);

    edge
      .select('.deleteLabel')
        .attr('x', (d) => graphUtils.getEdgeMiddle(d).x - 25)
        .attr('y', (d) => graphUtils.getEdgeMiddle(d).y - 37);

    edge
      .select('.editRect')
        .attr('x', (d) => graphUtils.getEdgeMiddle(d).x)
        .attr('y', (d) => graphUtils.getEdgeMiddle(d).y - 50);

    edge
      .select('.editLabel')
        .attr('x', (d) => graphUtils.getEdgeMiddle(d).x + 25)
        .attr('y', (d) => graphUtils.getEdgeMiddle(d).y - 37);
  }

  /**
   * Base d3 force simulation initialization
   */
  const simulation = d3.forceSimulation()
    .force('collide', d3.forceCollide().radius(nodeRadius))
    .force('link', d3.forceLink().id((d) => d.id).distance(200).strength(1))
    // .force('charge', d3.forceManyBody().strength(200))
    .force('center', d3.forceCenter(width / 2, height / 2).strength(0.05))
    // force y towards middle, more linear
    // .force('forceY', d3.forceY(height / 2).strength(0.15))
    // .force('forceX', d3.forceX());
    .on('tick', ticked);

  /**
   * Update displayed query graph
   * @param {object} query_graph query graph object
   * @param {object} queryBuilder query builder hook
   */
  function update(query_graph, queryBuilder) {
    // we need to update this function internally to get an updated version
    // of the current query builder
    edgeArgs.updateEdge = queryBuilder.updateEdge;
    edgeArgs.deleteEdge = queryBuilder.deleteEdge;
    nodeArgs.deleteNode = queryBuilder.deleteNode;
    // clear out connectTerms whenever external updates happen.
    nodeArgs.connectTerms = null;
    // preserve node position by using the already existing nodes
    const oldNodes = new Map(node.data().map((d) => [d.id, { x: d.x, y: d.y }]));
    const nodes = query_graph.nodes.map((d) => Object.assign(oldNodes.get(d.id) || { x: Math.random() * width, y: Math.random() * height }, d));
    // edges need to preserve some internal properties
    const edges = query_graph.edges.map((d) => ({ ...d }));

    // simulation adds x and y properties to nodes
    simulation.nodes(nodes);
    // simulation converts source and target properties of
    // edges to node objects
    simulation.force('link').links(edges);
    simulation.alpha(1).restart();

    node = node.data(nodes, (d) => d.id)
      .join(
        (n) => nodeUtils.enter(n, simulation, chooseNode, openNodeEditor, nodeArgs),
        (n) => nodeUtils.update(n, colorMap),
        (n) => nodeUtils.exit(n),
      );

    // edge ends need the x and y of their attached nodes
    // must come after simulation
    const edgeIndices = new Proxy({}, edgeHandler);
    edges.forEach((e, i) => {
      const edgeObj = edgeIndices[`${e.source.id}--${e.target.id}`];
      edgeObj.indices.push(i);
      edgeIndices[`${e.source.id}--${e.target.id}`] = edgeObj.indices;
    });
    edges.forEach((e, i) => {
      const edgeObj = edgeIndices[`${e.source.id}--${e.target.id}`];
      e.numEdges = edgeObj.indices.length;
      const edgeIndex = edgeObj.indices.indexOf(i);
      e.index = edgeIndex;
      // if an even number of edges, move first middle edge to outside
      // to keep edges symmetrical
      if (edgeObj.indices.length % 2 === 0 && edgeIndex === 0) {
        e.index = edgeObj.indices.length - 1;
      }
      // if not the first index (0)
      if (edgeIndex) {
        // all even index should be one less and odd indices
        // should be inverse
        const edgeL = edgeIndex % 2;
        if (!edgeL) {
          e.index -= 1;
        } else {
          e.index = -e.index;
        }
      }
      // flip any inverse edges
      if (edgeObj.inverse) {
        e.index = -e.index;
      }
      e.strokeWidth = '3';
    });

    edge = edge.data(edges, (d) => d.id)
      .join(
        (e) => edgeUtils.enter(e, simulation, openEdgeEditor, edgeArgs),
        edgeUtils.update,
        edgeUtils.exit,
      );
  }

  /**
   * Collect node ids to make a new edge connection
   * @param {string} id node id
   */
  function chooseNode(id) {
    if (chosenNodes.length < 2) {
      chosenNodes.push(id);
    }
    if (chosenNodes.length >= 2) {
      nodeArgs.connectTerms(...chosenNodes);
      nodeArgs.connectTerms = null;
      d3.selectAll('.node > .nodeCircle')
        .transition()
        .delay(2000)
        .duration(1000)
        .attr('stroke-width', '0');
    }
  }

  /**
   * Set callback function for creating a new edge
   * @param {function} func callback function
   */
  function addNewConnection(func) {
    nodeArgs.connectTerms = func;
    chosenNodes = [];
  }

  return {
    update,
    addNewConnection,
  };
}
