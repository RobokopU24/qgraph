import * as d3 from 'd3';
import graphUtils from './graph';
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

function dragEdgeEnd(subject, simulation, width, height, nodeRadius, updateEdge) {
  function dragstarted(event) {
    // stop simulation if user grabs an edge end
    if (!event.active) simulation.stop();
    event.sourceEvent.stopPropagation();
  }

  function dragged(event, d) {
    const { id } = d;
    const type = d3.select(this).attr('class').split(' ')[0];
    const otherEdgeEnd = graphUtils.getOtherEdgeEnd(type);
    const otherEndX = d[otherEdgeEnd].x;
    const otherEndY = d[otherEdgeEnd].y;
    const targetX = graphUtils.boundedEdge(otherEndX, width);
    const targetY = graphUtils.boundedEdge(otherEndY, height);
    const mouseX = graphUtils.boundedEdge(event.x, width);
    const mouseY = graphUtils.boundedEdge(event.y, height);
    const {
      x: x2, y: y2,
    } = graphUtils.getShortenedLineEnd(targetX, targetY, mouseX, mouseY, nodeRadius);
    const source = type === 'source' ? `${mouseX},${mouseY}` : `${x2},${y2}`;
    const target = type === 'source' ? `${x2},${y2}` : `${mouseX},${mouseY}`;
    const path = `M${source} ${target}`;
    let labelPath = path;
    // this is just to keep the predicate label right side up
    if ((type === 'source' && mouseX > x2) || (type === 'target' && mouseX < x2)) {
      labelPath = `M${target} ${source}`;
    }
    d3.select(`#${id}`)
      .call((e) => e.select('.edgePath')
        .attr('d', path))
      .call((e) => e.select('.edgeTransparent')
        .attr('d', labelPath))
      .call((e) => e.select(`.${type}`)
        .attr('cx', mouseX)
        .attr('cy', mouseY))
      .call((e) => e.select(`.${otherEdgeEnd}`)
        .attr('cx', x2)
        .attr('cy', y2));
  }

  function dragended(event, d) {
    // see if edge was dropped on an edge
    const droppedCircle = d3.selectAll('.nodeCircle').data().find((n) => graphUtils.isInside(event.x, event.y, n.x, n.y, nodeRadius));
    const { id } = d;
    const type = d3.select(this).attr('class').split(' ')[0];
    if (droppedCircle) {
      // edge was on a node
      const mapping = {
        source: 'subject',
        target: 'object',
      };
      // no need to adjust anything internal because graph will be
      // redrawn
      updateEdge(id, mapping[type], droppedCircle.id);
    } else {
      // edge was dropped in space, put it back to previous nodes
      let {
        x1, y1, qx, qy, x2, y2, // eslint-disable-line prefer-const
      } = graphUtils.getCurvedEdgePos(d.source.x, d.source.y, d.target.x, d.target.y, d.numEdges, d.index, nodeRadius);
      x2 = graphUtils.boundedEdge(x2, width);
      y2 = graphUtils.boundedEdge(y2, height);
      x1 = graphUtils.boundedEdge(x1, width);
      y1 = graphUtils.boundedEdge(y1, height);
      const source = `${x1},${y1}`;
      const target = `${x2},${y2}`;
      const path = `M${source}Q${qx},${qy} ${target}`;
      // make the predicate label right side up
      let labelPath = path;
      if (x1 > x2) {
        labelPath = `M${target}Q${qx},${qy} ${source}`;
      }
      d3.select(`#${id}`)
        .call((e) => e.select('.edgePath')
          .attr('d', path))
        .call((e) => e.select('.edgeTransparent')
          .attr('d', labelPath))
        .call((e) => e.select('.source')
          .attr('cx', x1)
          .attr('cy', y1))
        .call((e) => e.select('.target')
          .attr('cx', x2)
          .attr('cy', y2));
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
