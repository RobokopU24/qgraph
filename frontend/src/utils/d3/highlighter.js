import * as d3 from 'd3';

const orangeHighlight = 'rgb(255, 172, 30)';
const opaqueOrangeHighlight = 'rgba(255, 172, 30, 0.4)';

function highlightTextEditorNode(nodeId) {
  d3.selectAll(`.nodeSelector-${nodeId} > fieldset`)
    .style('border-width', '3px')
    .style('border-color', orangeHighlight);
  d3.selectAll(`.highlight-${nodeId}:not(.referenceNode) > .nodeDropdown`)
    .style('background-color', opaqueOrangeHighlight);
}

function clearTextEditorNode(nodeId) {
  d3.selectAll(`.nodeSelector-${nodeId} > fieldset`)
    .style('border-width', null)
    .style('border-color', null);
  d3.selectAll(`.highlight-${nodeId}:not(.referenceNode) > .nodeDropdown`)
    .style('background-color', null);
}

function highlightGraphNode(nodeId) {
  d3.selectAll(`.node-${nodeId}`)
    .attr('stroke-width', '3px')
    .attr('stroke', orangeHighlight);
}

function clearGraphNode(nodeId) {
  d3.selectAll(`.node-${nodeId}`)
    .attr('stroke-width', '0px');
}

function clearAllNodes() {
  d3.selectAll('.nodeCircle')
    .attr('stroke-width', '0px');
  d3.selectAll('.nodeDropdown')
    .style('background-color', null);
  d3.selectAll('.nodeSelector > fieldset')
    .style('border-width', null)
    .style('border-color', null);
}

function highlightTextEditorEdge(edgeId) {
  d3.selectAll(`.edgeSelector-${edgeId} > fieldset`)
    .style('border-width', '3px')
    .style('border-color', orangeHighlight);
  d3.selectAll(`.highlight-${edgeId} > .edgeDropdown`)
    .style('background-color', opaqueOrangeHighlight);
}

function clearTextEditorEdge(edgeId) {
  d3.selectAll(`.edgeSelector-${edgeId} > fieldset`)
    .style('border-width', null)
    .style('border-color', null);
  d3.selectAll(`.highlight-${edgeId} > .edgeDropdown`)
    .style('background-color', null);
}

function highlightGraphEdge(edgeId) {
  d3.selectAll(`.edge-${edgeId}`)
    .attr('stroke', opaqueOrangeHighlight);
}

function clearGraphEdge(edgeId) {
  d3.selectAll(`.edge-${edgeId}`)
    .attr('stroke', 'transparent');
}

function clearAllEdges() {
  d3.selectAll('.edgeTransparent')
    .attr('stroke', 'transparent');
  d3.selectAll('.edgeSelector > fieldset')
    .style('border-width', null)
    .style('border-color', null);
  d3.selectAll('.edgeDropdown')
    .style('background-color', null);
}

export default {
  highlightTextEditorNode,
  highlightGraphNode,
  clearTextEditorNode,
  clearGraphNode,
  clearAllNodes,

  highlightTextEditorEdge,
  highlightGraphEdge,
  clearTextEditorEdge,
  clearGraphEdge,
  clearAllEdges,
};
