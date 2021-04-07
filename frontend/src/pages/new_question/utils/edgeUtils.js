/* eslint-disable indent */
import * as d3 from 'd3';
import graphUtils from './graphUtils';
import dragUtils from './dragUtils';
import strings from '~/utils/stringUtils';
import highlighter from './highlighter';

const dispatch = d3.dispatch('update', 'delete');

/**
 * Handle creation of edges
 * @param {obj} edge d3 edge object
 * @param {obj} simulation d3 force simulation
 * @param {int} width width of svg container
 * @param {int} height height of svg container
 * @param {int} nodeRadius node radius
 * @param {obj} args mutable edge args object
 */
function enter(edge, simulation, openEdgeEditor, args) {
  const {
    height, width, nodeRadius,
    updateEdge, deleteEdge, edit,
  } = args;
  dispatch.on('update', (edgeId, edgeType, nodeId) => {
    const success = updateEdge(edgeId, edgeType, nodeId);
    if (!success) {
      // hacky, calls the tick function which moves the edge ends back
      simulation.alpha(0.001).restart();
    }
  });
  dispatch.on('delete', deleteEdge);
  return edge.append('g')
    .attr('id', (d) => d.id)
    // visible line
    .call((e) => e.append('path')
      .attr('stroke', '#999')
      .attr('fill', 'none')
      .attr('stroke-width', (d) => d.strokeWidth)
      .attr('class', 'edge')
      .attr('marker-end', (d) => graphUtils.showArrow(d)))
    // wider clickable line
    .call((e) => e.append('path')
      .attr('stroke', 'transparent')
      .attr('fill', 'none')
      .attr('stroke-width', 10)
      .attr('class', (d) => `edgeTransparent edge-${d.id}`)
      .attr('id', (d) => `edge${d.id}`)
      .call(() => e.append('text')
        .attr('class', 'edgeText')
        .attr('pointer-events', 'none')
        .style('text-anchor', 'middle')
        .attr('dy', (d) => -d.strokeWidth)
        .append('textPath')
          .attr('pointer-events', 'none')
          .attr('xlink:href', (d) => `#edge${d.id}`)
          .attr('startOffset', '50%')
          .text((d) => (d.predicate ? d.predicate.map((p) => strings.displayPredicate(p)).join(', ') : '')))
      .on('click', (event, d) => {
        if (edit.active !== d.id) {
          event.stopPropagation();
          d3.selectAll('.deleteRect,.deleteLabel,.editRect,.editLabel')
            .style('display', 'none');
          d3.selectAll(`.${d.id}`)
            .style('display', 'inherit')
            .raise();
          edit.active = d.id;
          d3.select(`#${d.id}`).raise();
          highlighter.clearAllEdges();
          highlighter.clearAllNodes();
          highlighter.highlightTextEditorEdge(d.id);
          highlighter.highlightGraphEdge(d.id);
        } else {
          edit.active = '';
        }
      })
      .on('mouseover', (event, d) => {
        const { id } = d;
        d3.selectAll(`#${id} > .source, #${id} > .target`)
          .transition()
          .duration(500)
          .style('opacity', 1);
        if (edit.active === id || !edit.active) {
          highlighter.highlightTextEditorEdge(id);
          highlighter.highlightGraphEdge(id);
        }
      })
      .on('mouseout', (event, d) => {
        const { id } = d;
        d3.selectAll(`#${id} > .source, #${id} > .target`)
          .transition()
          .duration(1000)
          .style('opacity', 0);
        if (edit.active !== id || !edit.active) {
          highlighter.clearTextEditorEdge(id);
          highlighter.clearGraphEdge(id);
        }
      })
      .call((eLabel) => eLabel.append('title')
        .text((d) => (d.predicate ? d.predicate.map((p) => strings.displayPredicate(p)).join(', ') : ''))))
    // source edge end circle
    .call((e) => e.append('circle')
      .attr('r', 5)
      .attr('fill', '#B5D3E3')
      // .attr('fill', 'transparent')
      .attr('stroke', '#999')
      .attr('stroke-width', 1)
      .style('opacity', 0)
      .style('cursor', 'pointer')
      // class is how we grab the attached node later
      .attr('class', 'source')
      .on('mouseover', graphUtils.show)
      .on('mouseout', graphUtils.hide)
      .call(dragUtils.dragEdgeEnd(e, simulation, width, height, nodeRadius, dispatch)))
    // target edge end circle
    .call((e) => e.append('circle')
      .attr('r', 5)
      .attr('fill', '#B5D3E3')
      // .attr('fill', 'transparent')
      .attr('stroke', '#999')
      .attr('stroke-width', 1)
      .style('opacity', 0)
      .style('cursor', 'pointer')
      // class is how we grab the attached node later
      .attr('class', 'target')
      .on('mouseover', graphUtils.show)
      .on('mouseout', graphUtils.hide)
      .call(dragUtils.dragEdgeEnd(e, simulation, width, height, nodeRadius, dispatch)))
    .call((e) => e.append('rect')
      .attr('x', (d) => graphUtils.getEdgeMiddle(d).x - 50)
      .attr('y', (d) => graphUtils.getEdgeMiddle(d).y - 50)
      .attr('width', 50)
      .attr('height', 25)
      .attr('stroke', 'black')
      .attr('fill', 'white')
      .style('display', 'none')
      .attr('class', (d) => `${d.id} deleteRect`)
      .on('click', (event, d) => {
        const { id } = d;
        edit.active = '';
        dispatch.call('delete', null, id);
      }))
    .call((e) => e.append('text')
      .style('pointer-events', 'none')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .attr('class', (d) => `${d.id} deleteLabel`)
      .style('display', 'none')
      .text('delete'))
    .call((e) => e.append('rect')
      .attr('x', (d) => graphUtils.getEdgeMiddle(d).x)
      .attr('y', (d) => graphUtils.getEdgeMiddle(d).y - 50)
      .attr('width', 50)
      .attr('height', 25)
      .attr('stroke', 'black')
      .attr('fill', 'white')
      .style('display', 'none')
      .attr('class', (d) => `${d.id} editRect`)
      .on('click', (event, d) => {
        const { id } = d;
        const edgeAnchor = d3.select(`#${id} > .source`).node();
        edit.active = '';
        openEdgeEditor(id, edgeAnchor);
      }))
    .call((e) => e.append('text')
      .style('pointer-events', 'none')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .attr('class', (d) => `${d.id} editLabel`)
      .style('display', 'none')
      .text('edit'));
}

function update(edge) {
  return edge
    .call((e) => e.select('title')
      .text((d) => (d.predicate ? d.predicate.map((p) => strings.displayPredicate(p)).join(', ') : '')))
    .call((e) => e.select('.edge')
      // .attr('stroke-width', (d) => d.strokeWidth)
      .attr('marker-end', (d) => graphUtils.showArrow(d)))
    .call((e) => e.select('text')
      .select('textPath')
        .text((d) => (d.predicate ? d.predicate.map((p) => strings.displayPredicate(p)).join(', ') : '')));
    //   .attr('dy', (d) => -d.strokeWidth));
}

function exit(edge) {
  return edge.remove();
}

export default {
  enter,
  update,
  exit,
};
