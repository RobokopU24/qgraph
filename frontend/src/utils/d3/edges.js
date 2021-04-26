/* eslint-disable indent */
import * as d3 from 'd3';
import graphUtils from './graph';
import dragUtils from './drag';
import strings from '~/utils/strings';
import highlighter from './highlighter';

const rectSize = {
  w: 50,
  h: 25,
};

const deleteRectOffset = {
  x: -50,
  y: -50,
};
const deleteTextOffset = {
  x: -25,
  y: -37,
};
const editRectOffset = {
  x: 0,
  y: -50,
};
const editTextOffset = {
  x: 25,
  y: -37,
};

/**
 * Handle creation of edges
 * @param {obj} edge - d3 edge object
 */
function enter(edge) {
  return edge.append('g')
    .attr('id', (d) => d.id)
    .attr('class', 'edge')
    // visible line
    .call((e) => e.append('path')
      .attr('stroke', '#999')
      .attr('fill', 'none')
      .attr('stroke-width', (d) => d.strokeWidth)
      .attr('class', 'edgePath')
      .attr('marker-end', (d) => (graphUtils.shouldShowArrow(d) ? 'url(#arrow)' : '')))
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
      .attr('class', 'source edgeEnd')
      .on('mouseover', graphUtils.showElement)
      .on('mouseout', graphUtils.hideElement))
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
      .attr('class', 'target edgeEnd')
      .on('mouseover', graphUtils.showElement)
      .on('mouseout', graphUtils.hideElement))
    // edge button group
    .call((eg) => eg.append('g')
      .attr('class', 'edgeButtons')
      .call((e) => e.append('rect')
        .attr('transform', `translate(${deleteRectOffset.x},${deleteRectOffset.y})`)
        .attr('width', rectSize.w)
        .attr('height', rectSize.h)
        .attr('stroke', 'black')
        .attr('fill', 'white')
        .style('display', 'none')
        .attr('class', (d) => `${d.id} deleteRect`))
      .call((e) => e.append('text')
        .attr('dx', deleteTextOffset.x)
        .attr('dy', deleteTextOffset.y)
        .style('pointer-events', 'none')
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .attr('class', (d) => `${d.id} deleteLabel`)
        .style('display', 'none')
        .text('delete'))
      .call((e) => e.append('rect')
        .attr('transform', `translate(${editRectOffset.x},${editRectOffset.y})`)
        .attr('width', rectSize.w)
        .attr('height', rectSize.h)
        .attr('stroke', 'black')
        .attr('fill', 'white')
        .style('display', 'none')
        .attr('class', (d) => `${d.id} editRect`))
      .call((e) => e.append('text')
        .attr('dx', editTextOffset.x)
        .attr('dy', editTextOffset.y)
        .style('pointer-events', 'none')
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .attr('class', (d) => `${d.id} editLabel`)
        .style('display', 'none')
        .text('edit')));
}

/**
 * Update an edge label, arrow, and tooltip
 * @param {object} edge - d3 edge object
 */
function update(edge) {
  return edge
    .call((e) => e.select('title')
      .text((d) => (d.predicate ? d.predicate.map((p) => strings.displayPredicate(p)).join(', ') : '')))
    .call((e) => e.select('.edgePath')
      // .attr('stroke-width', (d) => d.strokeWidth)
      .attr('marker-end', (d) => (graphUtils.shouldShowArrow(d) ? 'url(#arrow)' : '')))
    .call((e) => e.select('text')
      .select('textPath')
        .text((d) => (d.predicate ? d.predicate.map((p) => strings.displayPredicate(p)).join(', ') : '')));
    //   .attr('dy', (d) => -d.strokeWidth));
}

/**
 * Remove and edge
 * @param {object} edge - d3 edge object
 */
function exit(edge) {
  return edge.remove();
}

/**
 * Add click listener to edge
 * @param {string} editId - current edit id
 * @param {function} setEditId - set current edit id
 */
function attachEdgeClick(editId, setEditId) {
  d3.selectAll('.edgeTransparent')
    .on('click', (event, d) => {
      if (editId !== d.id) {
        event.stopPropagation();
        d3.selectAll('.deleteRect,.deleteLabel,.editRect,.editLabel')
          .style('display', 'none');
        d3.selectAll(`.${d.id}`)
          .style('display', 'inherit')
          .raise();
        setEditId(d.id);
        d3.select(`#${d.id}`).raise();
        highlighter.clearAllEdges();
        highlighter.clearAllNodes();
        highlighter.highlightTextEditorEdge(d.id);
        highlighter.highlightGraphEdge(d.id);
      } else {
        setEditId('');
      }
    });
}

/**
 * Attach delete function to button
 * @param {function} deleteEdge - delete an edge
 * @param {function} setEditId - set current edit id
 */
function attachDeleteClick(deleteEdge, setEditId) {
  d3.selectAll('.edgeButtons > .deleteRect')
    .on('click', (event, d) => {
      const { id } = d;
      setEditId('');
      deleteEdge(id);
    });
}

/**
 * Attach listener to edit button
 * @param {function} openEditor - open the edge editor
 * @param {function} setEditId - set current edit id
 */
function attachEditClick(openEditor, setEditId) {
  d3.selectAll('.edgeButtons > .editRect')
    .on('click', (event, d) => {
      const { id } = d;
      const edgeAnchor = d3.select(`#${id} > .source`).node();
      setEditId('');
      openEditor(id, edgeAnchor, 'editEdge');
    });
}

/**
 * Attach hover functionality to edge
 * @param {string} editId - current edit id
 */
function attachMouseHover(editId) {
  d3.selectAll('.edgeTransparent')
    .on('mouseover', (event, d) => {
      const { id } = d;
      d3.selectAll(`#${id} > .source, #${id} > .target`)
        .transition()
        .duration(500)
        .style('opacity', 1);
      if (editId === id || !editId) {
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
      if (editId !== id || !editId) {
        highlighter.clearTextEditorEdge(id);
        highlighter.clearGraphEdge(id);
      }
    });
}

/**
 * Attach drag handlers to edge ends
 * @param {object} simulation - d3 simulation
 * @param {integer} width - width of svg
 * @param {integer} height - height of svg
 * @param {integer} nodeRadius - radius of node circles
 * @param {function} updateEdge - update edge in query graph
 */
function attachDrag(simulation, width, height, nodeRadius, updateEdge) {
  d3.selectAll('.edge')
    .call((e) => e.selectAll('.edgeEnd')
      .call(dragUtils.dragEdgeEnd(e, simulation, width, height, nodeRadius, updateEdge)));
}

/**
 * Remove all hover edge effects
 */
function removeMouseHover() {
  d3.selectAll('.edgeTransparent')
    .on('mouseover', null)
    .on('mouseout', null);
}

/**
 * Remove all edge click listeners
 */
function removeClicks() {
  d3.selectAll('.edgeTransparent')
    .on('click', null);
}

export default {
  enter,
  update,
  exit,

  attachEdgeClick,
  attachDeleteClick,
  attachEditClick,
  attachMouseHover,
  attachDrag,

  removeClicks,
  removeMouseHover,
};
