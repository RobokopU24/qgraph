/* eslint-disable indent, no-use-before-define, func-names, no-return-assign */
import * as d3 from 'd3';
import graphUtils from './graphUtils';
import strings from '~/utils/stringUtils';

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
export default function queryGraph(svgRef, height, width, colorMap, nodeRadius) {
  let queryBuilder = null;
  let chosenNodes = [];
  let makeConnection = null;
  let showBubbles = false;
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

  let edge = edgeContainer.selectAll('line');

  let edgeEnds = edgeContainer.selectAll('circle');

  let node = nodeContainer.selectAll('circle');

  let label = nodeContainer.selectAll('text');

  let deleteBubbles = nodeContainer.selectAll('circle');
  let deleteBubblesLabels = nodeContainer.selectAll('circle');

  let editBubbles = nodeContainer.selectAll('circle');
  let editBubblesLabels = nodeContainer.selectAll('circle');

  /**
   * Move all nodes and edges on each simulation 'tick'
   */
  function ticked() {
    node
      .attr('cx', (d) => d.x = graphUtils.boundedNode(d.x, width, nodeRadius))
      .attr('cy', (d) => d.y = graphUtils.boundedNode(d.y, height, nodeRadius));

    deleteBubbles
      .attr('x', (d) => d.x - 50)
      .attr('y', (d) => d.y - 90);
      // .attr('cx', (d) => d.x - 50)
      // .attr('cy', (d) => d.y - 50);

    deleteBubblesLabels
      .attr('x', (d) => d.x - 25)
      .attr('y', (d) => d.y - 77);

    editBubbles
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y - 90);
      // .attr('cx', (d) => d.x + 50)
      // .attr('cy', (d) => d.y - 50);

    editBubblesLabels
      .attr('x', (d) => d.x + 25)
      .attr('y', (d) => d.y - 77);

    label
      .attr('x', (d) => graphUtils.boundedNode(d.x, width, nodeRadius))
      .attr('y', (d) => graphUtils.boundedNode(d.y, height, nodeRadius));

    edge
      .attr('x1', (d) => {
        const { source, target } = d;
        const x = graphUtils.getAdjustedX(source.x, source.y, target.x, target.y, nodeRadius);
        return graphUtils.boundedEdge(x, width);
      })
      .attr('y1', (d) => {
        const { source, target } = d;
        const y = graphUtils.getAdjustedY(source.x, source.y, target.x, target.y, nodeRadius);
        return graphUtils.boundedEdge(y, height);
      })
      .attr('x2', (d) => {
        const { source, target } = d;
        const x = graphUtils.getAdjustedX(target.x, target.y, source.x, source.y, nodeRadius);
        return graphUtils.boundedEdge(x, width);
      })
      .attr('y2', (d) => {
        const { source, target } = d;
        const y = graphUtils.getAdjustedY(target.x, target.y, source.x, source.y, nodeRadius);
        return graphUtils.boundedEdge(y, height);
      });

    edgeEnds
      .attr('cx', (d) => {
        // get edge id and target/source from edge end
        const [edgeId, edgeType] = d.id.split('__');
        // find edge object from edge id
        const edgeObj = edge.data().find((e) => e.id === edgeId);
        // get properties from target/soure of edge
        const connectedNode = edgeObj[edgeType];
        const attachedNode = graphUtils.getAttachedNode(edgeObj, edgeType);
        const x = graphUtils.getAdjustedX(connectedNode.x, connectedNode.y, attachedNode.x, attachedNode.y, nodeRadius);
        const boundedVal = graphUtils.boundedEdge(x, width);
        // set internal x value of edge end
        d.x = boundedVal;
        return boundedVal;
      })
      .attr('cy', (d) => {
        const [edgeId, edgeType] = d.id.split('__');
        const edgeObj = edge.data().find((e) => e.id === edgeId);
        const connectedNode = edgeObj[edgeType];
        const attachedNode = graphUtils.getAttachedNode(edgeObj, edgeType);
        const y = graphUtils.getAdjustedY(connectedNode.x, connectedNode.y, attachedNode.x, attachedNode.y, nodeRadius);
        const boundedVal = graphUtils.boundedEdge(y, height);
        // set internal y value of edge end
        d.y = boundedVal;
        return boundedVal;
      });
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
   * Handle node dragging
   */
  function dragNode() {
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = graphUtils.boundedNode(event.x, width, nodeRadius);
      d.fy = graphUtils.boundedNode(event.y, height, nodeRadius);
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
    function dragstarted(event) {
      // stop simulation if user grabs an edge end
      if (!event.active) simulation.stop();
    }

    function dragged(event, d) {
      const [id, type] = d.id.split('__');
      const edgeObj = edge.data().find((e) => e.id === id);
      const attachedNode = graphUtils.getAttachedNode(edgeObj, type);
      const { x, y } = graphUtils.getAdjustedXY(attachedNode.x, attachedNode.y, event.x, event.y, nodeRadius);
      const attachedX = graphUtils.boundedEdge(x, width);
      const attachedY = graphUtils.boundedEdge(y, height);
      const connectedX = graphUtils.boundedEdge(event.x, width);
      const connectedY = graphUtils.boundedEdge(event.y, height);
      const edgePoint = d3.select(this);
      edgePoint
        .attr('cx', connectedX)
        .attr('cy', connectedY);
      if (type === 'source') {
        edge
          .filter((e) => e.id === id)
          .attr('x1', connectedX)
          .attr('y1', connectedY)
          .attr('x2', attachedX)
          .attr('y2', attachedY);
      } else if (type === 'target') {
        edge
          .filter((e) => e.id === id)
          .attr('x1', attachedX)
          .attr('y1', attachedY)
          .attr('x2', connectedX)
          .attr('y2', connectedY);
      }
      const inverseType = graphUtils.inverseEdgeType[type];
      const otherEdgeEnd = d3.select(`#${id}__${inverseType}`);
      otherEdgeEnd
        .attr('cx', attachedX)
        .attr('cy', attachedY);
    }

    function dragended(event, d) {
      // see if edge was dropped on an edge
      const droppedCircle = node.data().find((n) => graphUtils.isInside(event.x, event.y, n.x, n.y, nodeRadius));
      const [id, type] = d.id.split('__');
      if (droppedCircle) {
        // edge was on a node
        const mapping = {
          source: 'subject',
          target: 'object',
        };
        // no need to adjust anything internal because graph will be
        // redrawn
        queryBuilder.updateEdge(id, mapping[type], droppedCircle.id);
      } else {
        // edge was dropped in space, put it back to previous nodes
        const edgePoint = d3.select(this);
        const edgeObj = edge.data().find((e) => e.id === id);
        const inverseType = graphUtils.inverseEdgeType[type];
        const connectedNode = edgeObj[type];
        const attachedNode = graphUtils.getAttachedNode(edgeObj, type);
        const otherEdgeEnd = d3.select(`#${id}__${inverseType}`);
        const { x: connectedX, y: connectedY } = graphUtils.getAdjustedXY(connectedNode.x, connectedNode.y, attachedNode.x, attachedNode.y, nodeRadius);
        const { x: attachedX, y: attachedY } = graphUtils.getAdjustedXY(attachedNode.x, attachedNode.y, connectedNode.x, connectedNode.y, nodeRadius);
        const connectedXBounded = graphUtils.boundedEdge(connectedX, width);
        const connectedYBounded = graphUtils.boundedEdge(connectedY, height);
        const attachedXBounded = graphUtils.boundedEdge(attachedX, width);
        const attachedYBounded = graphUtils.boundedEdge(attachedY, height);
        edgePoint
          .attr('cx', connectedXBounded)
          .attr('cy', connectedYBounded);
        edge
          .filter((e) => e.id === id)
          .attr('x1', connectedXBounded)
          .attr('y1', connectedYBounded)
          .attr('x2', attachedXBounded)
          .attr('y2', attachedYBounded);
        otherEdgeEnd
          .attr('cx', attachedXBounded)
          .attr('cy', attachedYBounded);
      }
    }

    return d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  }

  function update(query_graph, newQueryBuilder, editNode, editEdge) {
    // we need to update this function internally to get an updated version
    // of the current query builder
    queryBuilder = newQueryBuilder;
    // clear out makeConnection whenever external updates happen.
    makeConnection = null;
    // preserve node position by using the already existing nodes
    const oldNodes = new Map(node.data().map((d) => [d.id, { x: d.x, y: d.y }]));
    const nodes = query_graph.nodes.map((d) => Object.assign(oldNodes.get(d.id) || { x: Math.random() * width, y: Math.random() * height }, d));
    // edges need to preserve some internal properties
    const edges = query_graph.edges.map((d) => ({ ...d }));

    node = node.data(nodes)
      .join(
        (enter) => enter
          .append('circle')
            .attr('r', nodeRadius)
            .attr('fill', (d) => colorMap((d.category && d.category[0]) || 'unknown'))
            .attr('class', 'node')
            .attr('id', (d) => d.id)
            // .attr('stroke', '#999')
            // .attr('stroke-width', 2)
            .style('cursor', 'pointer')
            .on('click', function (e, d) {
              const { id, x, y } = d;
              // only if we're currently making a connection
              if (makeConnection) {
                d3.select(this)
                  .attr('stroke', '#e0dfdf')
                  .attr('stroke-width', '5');
                chooseNode(id);
              } else if (!showBubbles) {
                // open node selector
                d3.selectAll(`.${id}`)
                  .style('display', 'inherit');
                showBubbles = true;
              } else {
                d3.selectAll(`.${id}`)
                  .style('display', 'none');
                showBubbles = false;
              }
            })
          .call(dragNode())
          .call((n) => n.append('title')
            .text((d) => d.id)),
        (u) => u.attr('fill', (d) => colorMap((d.category && d.category[0]) || 'unknown')),
        (exit) => exit
          .call((e) => e.transition()
            .duration(1000)
            .attr('fill', 'red')
            .attr('cy', 0)
            // .attr('fill-opacity', 0)
            .remove()),
      );

    label = label.data(nodes)
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

    edge = edge.data(edges)
      .join(
        (enter) => enter.append('line')
          .attr('stroke', '#999')
          .attr('stroke-width', 3)
          .attr('class', 'edge'),
        //   .clone()
        //     .attr('stroke', 'transparent')
        //     .attr('stroke-width', 10)
        //     .on('click', (e, d) => {
        //       console.log('clicked', d);
        //       editEdge(d.id, e.target);
        //     })
        //     .call((n) => n.append('title')
        //       .text((d) => d.predicate.map((p) => strings.displayPredicate(p)).join(', '))),
        // (u) => u.select('title')
        //   .text((d) => d.predicate.map((p) => strings.displayPredicate(p)).join(', ')),
      );

    // simulation adds x and y properties to nodes
    simulation.nodes(nodes);
    // simulation converts source and target properties of
    // edges to node objects
    simulation.force('link').links(edges);
    simulation.alpha(1).restart();

    // edge ends need the x and y of their attached nodes
    // must come after simulation
    const edgeCircles = [];
    edges.forEach((e) => {
      const { x: connectedX, y: connectedY } = graphUtils.getAdjustedXY(e.source.x, e.source.y, e.target.x, e.target.y, nodeRadius);
      edgeCircles.push({
        x: connectedX, y: connectedY, id: `${e.id}__source`,
      });
      const { x: attachedX, y: attachedY } = graphUtils.getAdjustedXY(e.target.x, e.target.y, e.source.x, e.source.y, nodeRadius);
      edgeCircles.push({
        x: attachedX, y: attachedY, id: `${e.id}__target`,
      });
    });
    edgeEnds = edgeEnds.data(edgeCircles)
      .join(
        (enter) => enter.append('circle')
          .attr('r', 5)
          .attr('fill', '#B5D3E3')
          .attr('stroke', '#999')
          .attr('stroke-width', 1)
          .style('cursor', 'pointer')
          // id is how we grab the attached node later
          .attr('id', (d) => d.id)
          .call(dragEdge()),
      );

    deleteBubbles = deleteBubbles.data(nodes)
      .join(
        (enter) => enter.append('rect')
          .attr('x', (d) => d.x - 50)
          .attr('y', (d) => d.y - 90)
          .attr('width', 50)
          .attr('height', 25)
          .attr('stroke', 'black')
          .attr('fill', 'white')
          .style('display', 'none')
          .attr('class', (d) => d.id)
          .on('click', (e, d) => {
            const { id } = d;
            d3.selectAll(`.${id}`)
              .style('display', 'none');
            showBubbles = false;
            // don't delete things yet
            queryBuilder.deleteNode(d.id);
          }),
        // (enter) => enter.append('circle')
        //   .attr('cx', (d) => d.x - 50)
        //   .attr('cy', (d) => d.y - 50)
        //   .attr('r', 13)
        //   .attr('stroke', 'black')
        //   .attr('fill', 'red')
        //   .style('display', 'none')
        //   .attr('class', (d) => d.id)
        //   .on('click', (e, d) => {
        //     const { id } = d;
        //     d3.selectAll(`.${id}`)
        //       .style('display', 'none');
        //     showBubbles = false;
        //     // don't delete things yet
        //     queryBuilder.deleteNode(d.id);
        //   }),
      );

    deleteBubblesLabels = deleteBubblesLabels.data(nodes)
      .join(
        (enter) => enter.append('text')
          .style('pointer-events', 'none')
          .attr('text-anchor', 'middle')
          .attr('alignment-baseline', 'middle')
          .attr('class', (d) => d.id)
          .style('display', 'none')
          .text('delete'),
      );

    editBubbles = editBubbles.data(nodes)
      .join(
        (enter) => enter.append('rect')
          .attr('x', (d) => d.x)
          .attr('y', (d) => d.y - 90)
          .attr('width', 50)
          .attr('height', 25)
          .attr('stroke', 'black')
          .attr('fill', 'white')
          .style('display', 'none')
          .attr('class', (d) => d.id)
          .on('click', (e, d) => {
            const { id, x, y } = d;
            const nodeAnchor = d3.select(`#${id}`).node();
            editNode(id, nodeAnchor);
            d3.selectAll(`.${id}`)
              .style('display', 'none');
            showBubbles = false;
          }),
        // (enter) => enter.append('circle')
        //   .attr('cx', (d) => d.x + 50)
        //   .attr('cy', (d) => d.y - 50)
        //   .attr('r', 13)
        //   .attr('stroke', 'black')
        //   .attr('fill', 'white')
        //   .style('display', 'none')
        //   .attr('class', (d) => d.id)
        //   .on('click', (e, d) => {
        //     const { id, x, y } = d;
        //     const nodeAnchor = d3.select(`#${id}`).node();
        //     editNode(id, nodeAnchor);
        //     d3.selectAll(`.${id}`)
        //       .style('display', 'none');
        //     showBubbles = false;
        //   }),
      );

    editBubblesLabels = editBubblesLabels.data(nodes)
      .join(
        (enter) => enter.append('text')
          .style('pointer-events', 'none')
          .attr('text-anchor', 'middle')
          .attr('alignment-baseline', 'middle')
          .attr('class', (d) => d.id)
          .style('display', 'none')
          .text('edit'),
      );
  }

  function chooseNode(id) {
    if (chosenNodes.length < 2) {
      chosenNodes.push(id);
    }
    if (chosenNodes.length === 2) {
      makeConnection(...chosenNodes);
      makeConnection = null;
      d3.selectAll('.node')
        .transition()
        .delay(2000)
        .duration(1000)
        .attr('stroke-width', '0');
    }
  }

  function addNewConnection(func) {
    makeConnection = func;
    chosenNodes = [];
  }

  return {
    update,
    addNewConnection,
  };
}
