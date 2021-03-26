import * as d3 from 'd3';
import graphUtils from './graphUtils';
/**
 * Handle node dragging
 */
function dragNode(simulation, width, height, nodeRadius) {
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

function dragEdgeEnd(subject, simulation, width, height, nodeRadius, dispatch) {
  function dragstarted(event) {
    // stop simulation if user grabs an edge end
    if (!event.active) simulation.stop();
    event.sourceEvent.stopPropagation();
  }

  function dragged(event, d) {
    const { id } = d;
    const type = d3.select(this).attr('class');
    const inverseType = graphUtils.inverseEdgeType[type];
    const { x, y } = graphUtils.getAdjustedXY(d[inverseType].x, d[inverseType].y, event.x, event.y, nodeRadius);
    const otherSideX = graphUtils.boundedEdge(x, width);
    const otherSideY = graphUtils.boundedEdge(y, height);
    const mouseX = graphUtils.boundedEdge(event.x, width);
    const mouseY = graphUtils.boundedEdge(event.y, height);
    d3.select(`#${id}`)
      .call((e) => e.selectAll('line')
        .attr('x1', type === 'source' ? mouseX : otherSideX)
        .attr('y1', type === 'source' ? mouseY : otherSideY)
        .attr('x2', type === 'source' ? otherSideX : mouseX)
        .attr('y2', type === 'source' ? otherSideY : mouseY))
      .call((e) => e.select(`.${type}`)
        .attr('cx', mouseX)
        .attr('cy', mouseY))
      .call((e) => e.select(`.${inverseType}`)
        .attr('cx', otherSideX)
        .attr('cy', otherSideY));
  }

  function dragended(event, d) {
    // see if edge was dropped on an edge
    const droppedCircle = d3.selectAll('.nodeCircle').data().find((n) => graphUtils.isInside(event.x, event.y, n.x, n.y, nodeRadius));
    const { id } = d;
    const type = d3.select(this).attr('class');
    if (droppedCircle) {
      // edge was on a node
      const mapping = {
        source: 'subject',
        target: 'object',
      };
      // no need to adjust anything internal because graph will be
      // redrawn
      dispatch.call('update', null, id, mapping[type], droppedCircle.id);
    } else {
      // edge was dropped in space, put it back to previous nodes
      const inverseType = graphUtils.inverseEdgeType[type];
      let { x: thisSideX, y: thisSideY } = graphUtils.getAdjustedXY(d[type].x, d[type].y, d[inverseType].x, d[inverseType].y, nodeRadius);
      let { x: otherSideX, y: otherSideY } = graphUtils.getAdjustedXY(d[inverseType].x, d[inverseType].y, d[type].x, d[type].y, nodeRadius);
      otherSideX = graphUtils.boundedEdge(otherSideX, width);
      otherSideY = graphUtils.boundedEdge(otherSideY, height);
      thisSideX = graphUtils.boundedEdge(thisSideX, width);
      thisSideY = graphUtils.boundedEdge(thisSideY, height);
      d3.select(`#${id}`)
        .call((e) => e.selectAll('line')
          .attr('x1', type === 'source' ? thisSideX : otherSideX)
          .attr('y1', type === 'source' ? thisSideY : otherSideY)
          .attr('x2', type === 'source' ? otherSideX : thisSideX)
          .attr('y2', type === 'source' ? otherSideY : thisSideY))
        .call((e) => e.select(`.${type}`)
          .attr('cx', thisSideX)
          .attr('cy', thisSideY))
        .call((e) => e.select(`.${inverseType}`)
          .attr('cx', otherSideX)
          .attr('cy', otherSideY));
    }
  }

  return d3.drag()
    // subject is how we know which edge end we've grabbed
    .subject(() => subject)
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended);
}

export default {
  dragNode,
  dragEdgeEnd,
};
