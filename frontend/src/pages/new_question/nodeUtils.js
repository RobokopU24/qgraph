/* eslint-disable indent, no-use-before-define, func-names, no-return-assign */
import * as d3 from 'd3';
import graphUtils from './graphUtils';
import dragUtils from './dragUtils';

let showEdit = '';
const dispatch = d3.dispatch('delete');

/**
 * Handle creation of nodes
 * @param {obj} node d3 node object
 * @param {obj} simulation d3 force simulation
 * @param {func} chooseNode function to select two nodes to connect
 * @param {func} openNodeEditor function to open node editor
 * @param {obj} args object of mutable arguments
 */
function enter(node, simulation, chooseNode, openNodeEditor, args) {
  const {
    width, height, nodeRadius,
    colorMap, deleteNode,
  } = args;
  dispatch.on('delete', deleteNode);
  return node.append('g')
    .attr('class', 'node')
    .attr('id', (d) => d.id)
    .call(dragUtils.dragNode(simulation, width, height, nodeRadius))
    // create node circle
    .call((nodeCircle) => nodeCircle.append('circle')
      .attr('class', 'nodeCircle')
      .attr('r', nodeRadius)
      // .attr('stroke', '#999')
      // .attr('stroke-width', 2)
      .attr('fill', (d) => colorMap((d.category && d.category[0]) || 'unknown'))
      .style('cursor', 'pointer')
      .on('click', function (e, d) {
        const { id } = d;
        // raise node to front of other nodes
        d3.select(`#${id}`).raise();
        // only if we're currently making a connection
        if (args.connectTerms) {
          d3.select(this)
            .attr('stroke', '#e0dfdf')
            .attr('stroke-width', '5');
          chooseNode(id);
        } else if (showEdit !== id) {
          d3.selectAll('.nodeDelete,.nodeDeleteLabel,.nodeEdit,.nodeEditLabel')
            .style('display', 'none');
          // open node selector
          d3.selectAll(`.${id}`)
            .style('display', 'inherit')
            .raise();
          showEdit = id;
        } else {
          d3.selectAll(`.${id}`)
            .style('display', 'none');
          showEdit = '';
        }
      })
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
        return name || 'Any';
      })
      .each(graphUtils.ellipseOverflow))
    .call((nodeDelete) => nodeDelete.append('rect')
      .attr('x', (d) => d.x - 50)
      .attr('y', (d) => d.y - 90)
      .attr('width', 50)
      .attr('height', 25)
      .attr('stroke', 'black')
      .attr('fill', 'white')
      .style('display', 'none')
      .attr('class', (d) => `${d.id} nodeDelete`)
      .on('click', (e, d) => {
        const { id } = d;
        d3.selectAll(`.${id}`)
          .style('display', 'none');
        showEdit = '';
        dispatch.call('delete', null, d.id);
      }))
    .call((nodeDeleteLabel) => nodeDeleteLabel.append('text')
      .style('pointer-events', 'none')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .attr('class', (d) => `${d.id} nodeDeleteLabel`)
      .style('display', 'none')
      .text('delete'))
    .call((nodeEdit) => nodeEdit.append('rect')
      .attr('x', (d) => d.x)
      .attr('y', (d) => d.y - 90)
      .attr('width', 50)
      .attr('height', 25)
      .attr('stroke', 'black')
      .attr('fill', 'white')
      .style('display', 'none')
      .attr('class', (d) => `${d.id} nodeEdit`)
      .on('click', (e, d) => {
        const { id } = d;
        const nodeAnchor = d3.select(`#${id} > .nodeCircle`).node();
        openNodeEditor(id, nodeAnchor);
        d3.selectAll(`.${id}`)
          .style('display', 'none');
        showEdit = '';
      }))
    .call((nodeEditLabel) => nodeEditLabel.append('text')
      .style('pointer-events', 'none')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'middle')
      .attr('class', (d) => `${d.id} nodeEditLabel`)
      .style('display', 'none')
      .text('edit'));
}

/**
 * Handle node updates
 * @param {obj} node d3 node object
 * @param {func} colorMap function to get node background color
 */
function update(node, colorMap) {
  return node
    .call((n) => n.select('.nodeCircle')
      .attr('fill', (d) => colorMap((d.category && d.category[0]) || 'unknown')))
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
        return name || 'Any';
      })
      .each(graphUtils.ellipseOverflow));
}

/**
 * Handle node deletion
 * @param {obj} node d3 node object
 */
function exit(node) {
  return node
    .call((nodeCircle) => nodeCircle.select('.nodeCircle')
      .transition()
      .ease(d3.easeCircle)
      .duration(1000)
      .attr('fill', 'red')
      .attr('cy', -40)
      .remove())
    .call((nodeLabel) => nodeLabel.select('.nodeLabel')
      .transition()
      .ease(d3.easeCircle)
      .duration(1000)
      .attr('y', -40)
      .remove())
    .call((n) => n.transition()
      .duration(1000)
      .remove());
}

export default {
  enter,
  update,
  exit,
};
