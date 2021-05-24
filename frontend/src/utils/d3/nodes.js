/* eslint-disable indent, no-use-before-define, func-names, no-return-assign */
import * as d3 from 'd3';
import graphUtils from './graph';
import dragUtils from './drag';
import highlighter from './highlighter';

const rectSize = {
  w: 50,
  h: 25,
};

const deleteRectOffset = {
  x: -54,
  y: -90,
};
const deleteTextOffset = {
  x: (deleteRectOffset.x + (deleteRectOffset.x + rectSize.w)) / 2,
  y: (deleteRectOffset.y + (deleteRectOffset.y + rectSize.h)) / 2,
};
const editRectOffset = {
  x: 4,
  y: -90,
};
const editTextOffset = {
  x: (editRectOffset.x + (editRectOffset.x + rectSize.w)) / 2,
  y: (editRectOffset.y + (editRectOffset.y + rectSize.h)) / 2,
};

/**
 * Handle creation of nodes
 * @param {obj} node - d3 node object
 * @param {obj} args - object of node properties
 */
function enter(node, args) {
  const {
    nodeRadius,
    colorMap,
  } = args;
  return node.append('g')
    .attr('class', 'node')
    .attr('id', (d) => d.id)
    // create node circle
    .call((nodeCircle) => nodeCircle.append('circle')
      .attr('class', (d) => `nodeCircle node-${d.id}`)
      .attr('r', nodeRadius)
      .attr('fill', (d) => colorMap((d.category && d.category[0]) || 'unknown'))
      .style('cursor', 'pointer')
      .call((n) => n.append('title')
        .text((d) => {
          let title = d.id;
          if (d.name) {
            title += `: ${d.name}`;
          }
          return title;
        })))
    // create node label
    .call((nodeLabel) => nodeLabel.append('text')
      .attr('class', 'nodeLabel')
      .style('pointer-events', 'none')
      .attr('text-anchor', 'middle')
      .style('font-weight', 600)
      .attr('alignment-baseline', 'middle')
      .text((d) => {
        const { name } = d;
        return name || 'Something';
      })
      .each(graphUtils.ellipsisOverflow))
    // create delete button
    .call((nodeDelete) => nodeDelete.append('rect')
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('transform', `translate(${deleteRectOffset.x},${deleteRectOffset.y})`)
      .attr('width', rectSize.w)
      .attr('height', rectSize.h)
      .attr('stroke', 'black')
      .attr('fill', 'white')
      .style('filter', 'url(#buttonShadow)')
      .style('display', 'none')
      .attr('class', (d) => `${d.id} deleteRect`))
    // add delete button label
    .call((nodeDeleteLabel) => nodeDeleteLabel.append('text')
      .attr('dx', deleteTextOffset.x)
      .attr('dy', deleteTextOffset.y)
      .style('pointer-events', 'none')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('class', (d) => `${d.id} deleteLabel`)
      .style('display', 'none')
      .text('delete'))
    // create edit button
    .call((nodeEdit) => nodeEdit.append('rect')
      .attr('rx', 5)
      .attr('ry', 5)
      .attr('transform', `translate(${editRectOffset.x},${editRectOffset.y})`)
      .attr('width', rectSize.w)
      .attr('height', rectSize.h)
      .attr('stroke', 'black')
      .attr('fill', 'white')
      .style('filter', 'url(#buttonShadow)')
      .style('display', 'none')
      .attr('class', (d) => `${d.id} editRect`))
    // add edit button label
    .call((nodeEditLabel) => nodeEditLabel.append('text')
      .attr('dx', editTextOffset.x)
      .attr('dy', editTextOffset.y)
      .style('pointer-events', 'none')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('class', (d) => `${d.id} editLabel`)
      .style('display', 'none')
      .text('edit'));
}

/**
 * Handle node updates
 * @param {obj} node - d3 node object
 * @param {obj} args - node circle properties
 */
function update(node, args) {
  const { colorMap } = args;
  return node
    .call((n) => n.select('.nodeCircle')
      .attr('fill', (d) => colorMap((d.category && d.category[0]) || 'unknown')))
      .style('filter', (d) => (d.is_set ? 'url(#setShadow)' : ''))
      .call((nodeCircle) => nodeCircle.select('title')
        .text((d) => {
          let title = d.id;
          if (d.name) {
            title += `: ${d.name}`;
          }
          return title;
        }))
    .call((l) => l.select('.nodeLabel')
      .text((d) => {
        const { name } = d;
        return name || 'Something';
      })
      .each(graphUtils.ellipsisOverflow));
}

/**
 * Handle node deletion
 * @param {obj} node - d3 node object
 */
function exit(node) {
  return node
    .transition()
    .ease(d3.easeCircle)
    .duration(1000)
    .attr('transform', (d) => `translate(${d.x},-40)`)
    .call((e) => e.select('circle')
      .attr('fill', 'red'))
    .remove();
}

/**
 * Set node circle click listener to be able to add an edge
 * @param {function} addNodeToConnection - add node to edge connection
 */
function attachConnectionClick(addNodeToConnection) {
  d3.selectAll('.nodeCircle')
    .on('click', function (e, d) {
      e.stopPropagation();
      d3.select(this)
        .attr('stroke', '#e0dfdf')
        .attr('stroke-width', '5');
      addNodeToConnection(d.id);
    });
}

/**
 * Set node click listener to show or hide buttons
 * @param {string} clickedId - current clicked id
 * @param {function} setClickedId - set current clicked id
 */
function attachNodeClick(clickedId, setClickedId) {
  d3.selectAll('.nodeCircle')
    .on('click', (e, d) => {
      const { id } = d;
      // raise node to front of other nodes
      d3.select('#nodeContainer').raise();
      d3.select(`#${id}`).raise();
      if (clickedId !== id) {
        e.stopPropagation();
        d3.selectAll('.deleteRect,.deleteLabel,.editRect,.editLabel')
          .style('display', 'none');
        // open node selector
        d3.selectAll(`.${id}`)
          .style('display', 'inherit')
          .raise();
        setClickedId(id);
        highlighter.clearAllNodes();
        highlighter.clearAllEdges();
        highlighter.highlightTextEditorNode(d.id);
        highlighter.highlightGraphNode(d.id);
      } else {
        // svg listener will hide buttons
        setClickedId('');
        d3.select('#edgeContainer').raise();
      }
    });
}

function clickNode(id) {
  d3.select(`.nodeCircle.node-${id}`)
    .dispatch('click');
}

/**
 * Attach delete function to button
 * @param {function} deleteNode - delete node from graph
 * @param {function} setClickedId - set current clicked id
 */
function attachDeleteClick(deleteNode, setClickedId) {
  d3.selectAll('.deleteRect')
    .on('click', (e, d) => {
      const { id } = d;
      d3.select('#edgeContainer').raise();
      setClickedId('');
      deleteNode(id);
    });
}

/**
 * Attach edit function to button
 * @param {function} openNodeEditor - open the node editor
 * @param {string} setClickedId - set current clicked id
 */
function attachEditClick(openEditor, setClickedId) {
  d3.selectAll('.editRect')
    .on('click', (e, d) => {
      const { id } = d;
      const nodeAnchor = d3.select(`#${id} > .nodeCircle`).node();
      d3.select('#edgeContainer').raise();
      setClickedId('');
      openEditor(id, nodeAnchor, 'editNode');
    });
}

/**
 * Show and hide node border on hover
 * @param {string} clickedId - current edit id
 */
function attachMouseHover(clickedId) {
  d3.selectAll('.nodeCircle')
    .on('mouseover', (e, d) => {
      if ((clickedId === d.id || !clickedId)) {
        highlighter.highlightTextEditorNode(d.id);
        highlighter.highlightGraphNode(d.id);
      }
    })
    .on('mouseout', (e, d) => {
      if ((clickedId !== d.id || !clickedId)) {
        highlighter.clearTextEditorNode(d.id);
        highlighter.clearGraphNode(d.id);
      }
    });
}

/**
 * Attach drag handler to nodes
 * @param {obj} simulation - d3 simulation
 * @param {int} width - width of the svg
 * @param {int} height - height of the svg
 * @param {int} nodeRadius - radius of node circles
 */
function attachDrag(simulation, width, height, nodeRadius) {
  d3.selectAll('.node')
    .call(dragUtils.dragNode(simulation, width, height, nodeRadius));
}

/**
 * Remove all click listeners from nodes
 */
function removeClicks() {
  d3.selectAll('.nodeCircle')
    .on('click', null);
}

/**
 * Clear out all node hover listeners
 */
function removeMouseHover() {
  d3.selectAll('.nodeCircle')
    .on('mouseover', null)
    .on('mouseout', null);
}

/**
 * Remove node border after 2 seconds
 */
function removeBorder() {
  d3.selectAll('.nodeCircle')
    .transition()
    .delay(2000)
    .duration(1000)
    .attr('stroke-width', '0');
}

export default {
  enter,
  update,
  exit,

  attachConnectionClick,
  attachNodeClick,
  attachEditClick,
  attachDeleteClick,
  attachMouseHover,
  attachDrag,

  removeClicks,
  removeMouseHover,
  removeBorder,

  clickNode,
};
