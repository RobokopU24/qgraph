/* eslint-disable indent, no-use-before-define */
import { useRef, useCallback } from 'react';
import * as d3 from 'd3';

/**
 * Initialize query graph and provide update method
 * @param {*} svgRef DOM ref to svg element
 * @param {int} height height of the query graph element
 * @param {int} width width of the query graph element
 * @param {func} colorMap function to get node category color
 * @param {int} nodeRadius radius of each node
 * @param {func} updateEdge update edge function
 * @returns {func} update function
 */
export default function useQueryGraph(svgRef, height, width, colorMap, nodeRadius, updateEdge) {
  const simulation = useRef();
  const nodes = useRef();
  const edges = useRef();
  const labels = useRef();
  const edgeEnds = useRef();

  function initialize() {
    const svg = d3.select(svgRef.current);
    if (svg.select('#nodeContainer').empty()) {
      svg.append('g')
        .attr('id', 'nodeContainer');
    }
    if (svg.select('#edgeContainer').empty()) {
      svg.append('g')
        .attr('id', 'edgeContainer');
    }
    const edgeContainer = svg.select('#edgeContainer');
    const nodeContainer = svg.select('#nodeContainer');

    edges.current = edgeContainer.selectAll('line');

    edgeEnds.current = edgeContainer.selectAll('circle');

    nodes.current = nodeContainer.selectAll('circle');

    labels.current = nodeContainer.selectAll('text');

    /**
     * Base d3 force simulation initialization
     */
    simulation.current = d3.forceSimulation()
      .force('collide', d3.forceCollide().radius(nodeRadius))
      .force('link', d3.forceLink().id((d) => {
        console.log(d);
        return d.id;
      }).distance(200))
      // .force('charge', d3.forceManyBody().strength(200))
      .force('center', d3.forceCenter(width / 2, height / 2).strength(0.05))
      // force y towards middle, more linear
      // .force('forceY', d3.forceY(height / 2).strength(0.15))
      // .force('forceX', d3.forceX());
      .on('tick', ticked);
  }

  /**
   * Find bounded value
   * @param {int} pos position to bound
   * @param {int} bound bound
   * @returns {int} bounded value
   */
  function bounded(pos, bound) {
    return Math.max(nodeRadius, Math.min(bound - nodeRadius, pos));
  }

  /**
   * Move all nodes and edges on each simulation 'tick'
   */
  function ticked() {
    nodes.current
      .attr('cx', (d) => bounded(d.x, width))
      .attr('cy', (d) => bounded(d.y, height));

    labels.current
      .attr('x', (d) => bounded(d.x, width))
      .attr('y', (d) => bounded(d.y, height));

    edges.current
      .attr('x1', (d) => bounded(d.source.x, width))
      .attr('y1', (d) => bounded(d.source.y, height))
      .attr('x2', (d) => bounded(d.target.x, width))
      .attr('y2', (d) => bounded(d.target.y, height));

    edgeEnds.current
      .attr('cx', (d) => {
        // get edge id and target/source from edge end
        const [edgeId, edgeType] = d.id.split('__');
        // find edge object from edge id
        const edgeObj = edges.current.data().find((e) => e.id === edgeId);
        // get properties from target/soure of edge
        const val = edgeObj[edgeType];
        const boundedVal = bounded(val.x, width);
        // set internal x value of edge end
        d.x = boundedVal;
        return boundedVal;
      })
      .attr('cy', (d) => {
        const [edgeId, edgeType] = d.id.split('__');
        const edgeObj = edges.current.data().find((e) => e.id === edgeId);
        const val = edgeObj[edgeType];
        const boundedVal = bounded(val.y, height);
        // set internal y value of edge end
        d.y = boundedVal;
        return boundedVal;
      });
  }

  /**
   * Handle node dragging
   */
  function dragNode() {
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = bounded(event.x, width);
      d.fy = bounded(event.y, height);
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  }

  function dragEdge() {
    function dragged(event, d) {
      const edgePoint = d3.select(this);
      edgePoint
        .attr('cx', () => bounded(event.x, width))
        .attr('cy', () => bounded(event.y, height));
      const [id, type] = d.id.split('__');
      if (type === 'source') {
        edges.current
          .filter((e) => e.id === id)
          .attr('x1', () => bounded(event.x, width))
          .attr('y1', () => bounded(event.y, height));
      } else if (type === 'target') {
        edges.current
          .filter((e) => e.id === id)
          .attr('x2', () => bounded(event.x, width))
          .attr('y2', () => bounded(event.y, height));
      }
    }

    function isInside(x, y, cx, cy) {
      return (x - cx) * (x - cx) + (y - cy) * (y - cy) <= nodeRadius ** 2;
    }

    function dragended(event, d) {
      const droppedCircle = nodes.current.data().find((n) => isInside(event.x, event.y, n.x, n.y));
      const [id, type] = d.id.split('__');
      if (droppedCircle) {
        const mapping = {
          source: 'subject',
          target: 'object',
        };
        console.log('dropped on node', droppedCircle);
        console.log('edge id', id);
        // console.log('type', mapping[type]);
        updateEdge(id, mapping[type], droppedCircle.id);
      } else {
        const edgePoint = d3.select(this);
        const attachedEdge = edges.current.data().find((e) => e.id === id);
        edgePoint
          .attr('cx', () => bounded(attachedEdge[type].x, width))
          .attr('cy', () => bounded(attachedEdge[type].y, height));
        edges
          .filter((e) => e.id === id)
          .attr('x1', () => bounded(attachedEdge.source.x, width))
          .attr('y1', () => bounded(attachedEdge.source.y, height))
          .attr('x2', () => bounded(attachedEdge.target.x, width))
          .attr('y2', () => bounded(attachedEdge.target.y, height));
      }
    }

    return d3.drag()
      .on('drag', dragged)
      .on('end', dragended);
  }

  function update(query_graph) {
    const oldNodes = new Map(nodes.current.data().map((d) => [d.id, d]));
    // preserve node position by using the already existing nodes
    const newNodes = query_graph.nodes.map((d) => Object.assign(oldNodes.get(d.id) || { x: Math.random() * width, y: Math.random() * height }, d));
    const newEdges = query_graph.edges.map((d) => ({ ...d }));

    console.log(nodes.current);

    nodes.current = nodes.current.data(newNodes)
      .join(
        (enter) => enter
          .append('circle')
            .attr('r', nodeRadius)
            .attr('fill', (d) => colorMap((d.category && d.category[0]) || 'unknown'))
          .call(dragNode())
          .call((n) => n.append('title')
            .text((d) => d.id)),
        (u) => u
          .attr('fill', (d) => colorMap((d.category && d.category[0]) || 'unknown')),
        (exit) => exit
          .call((e) => e.transition()
            .duration(1000)
            .attr('fill', 'red')
            .attr('cy', 0)
            // .attr('fill-opacity', 0)
            .remove()),
      );

    labels.current = labels.current.data(newNodes)
      .join(
        (enter) => enter.append('text')
          .style('pointer-events', 'none')
          .attr('text-anchor', 'middle')
          .attr('alignment-baseline', 'middle')
          .text((d) => {
            const { name } = d;
            return name || 'Any';
          }),
        (u) => u
          .text((d) => {
            const { name } = d;
            return name || 'Any';
          }),
        (exit) => exit
          .call((e) => e.transition()
            .duration(1000)
            .attr('y', 0)
            .remove()),
      );

    edges.current = edges.current.data(newEdges)
      .join(
        (enter) => enter.append('line')
          .attr('stroke', '#999')
          .attr('stroke-width', 3)
          .on('mouseover', () => console.log('hovering')),
        (u) => u,
      );

    // simulation adds x and y properties to nodes
    simulation.current.nodes(nodes.current);
    // simulation converts source and target properties of
    // edges to node objects
    simulation.current.force('link').links(edges.current);
    simulation.current.alpha(1).restart();

    // edge ends need the x and y of their attached nodes
    // must come after simulation
    const edgeSourceEnds = edges.current.map((e) => ({ x: e.source.x, y: e.source.y, id: `${e.id}__source` }));
    const edgeTargetEnds = edges.current.map((e) => ({ x: e.target.x, y: e.target.y, id: `${e.id}__target` }));
    const edgeCircles = edgeSourceEnds.concat(edgeTargetEnds);
    edgeEnds.current = edgeEnds.current.data(edgeCircles)
      .join(
        (enter) => enter.append('circle')
          .attr('r', 5)
          .attr('fill', 'blue')
          .call(dragEdge()),
      );
  }

  return {
    initialize,
    update,
  };
}
