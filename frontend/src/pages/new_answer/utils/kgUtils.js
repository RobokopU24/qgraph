import * as d3 from 'd3';
import _ from 'lodash';

import stringUtils from '~/utils/stringUtils';

function getNodeNums(results) {
  const counts = {};
  results.forEach((result) => {
    const qgKeys = Object.keys(result.node_bindings);
    qgKeys.forEach((qgKey) => {
      if (!Array.isArray(result.node_bindings[qgKey])) {
        result.node_bindings[qgKey] = [result.node_bindings[qgKey]];
      }
      result.node_bindings[qgKey].forEach((idObj) => {
        if (!(idObj.id in counts)) {
          counts[idObj.id] = 0;
        }
        counts[idObj.id] += 1;
      });
    });
  });
  counts.total = Object.values(counts).reduce((a, b) => a + b);
  return counts;
}

function getNodeRadius(num, total, width) {
  const area = width * 0.8;
  const circumference = (num / total) * area;
  const radius = Math.max(circumference / 2, 10);
  return radius;
}

function makeDisplayNodes(message) {
  const displayNodes = {};
  message.results.forEach((result) => {
    Object.entries(result.node_bindings).forEach(([qgId, kgObjects]) => {
      kgObjects.forEach((kgObj) => {
        let displayNode = displayNodes[kgObj.id];
        if (!displayNode) {
          displayNode = _.cloneDeep(kgObj);
          displayNode.category = stringUtils.toArray(message.query_graph.nodes[qgId].category || message.knowledge_graph.nodes[displayNode.id].category);
          displayNode.name = message.knowledge_graph.nodes[displayNode.id].name;
          displayNode.count = 1;
        } else {
          displayNode.count += 1;
        }
        displayNodes[kgObj.id] = displayNode;
      });
    });
  });
  return Object.values(displayNodes);
}

function dragNode(simulation) {
  function dragStart(e, d) {
    if (!e.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(e, d) {
    d.fx = e.x;
    d.fy = e.y;
  }

  function dragEnd(e, d) {
    if (!e.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  return d3.drag()
    .on('start', dragStart)
    .on('drag', dragged)
    .on('end', dragEnd);
}

export default {
  makeDisplayNodes,
  getNodeNums,
  getNodeRadius,
  dragNode,
};
