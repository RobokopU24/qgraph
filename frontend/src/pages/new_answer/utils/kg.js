import * as d3 from 'd3';
import _ from 'lodash';

import stringUtils from '~/utils/strings';

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
  const radius = Math.sqrt(Math.max(circumference / 2, 10)) * 10;
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

function removeNamedThing(categories) {
  const categoriesWithoutNamedThing = [...categories];
  const namedThingIndex = categories.indexOf('biolink:NamedThing');
  if (namedThingIndex > -1) {
    categoriesWithoutNamedThing.splice(namedThingIndex, 1);
  }
  return categoriesWithoutNamedThing;
}

function getRankedCategories(hierarchies, category) {
  const rankedCategories = category.sort((a, b) => {
    const aLength = (hierarchies[a] && hierarchies[a].length) || 0;
    const bLength = (hierarchies[b] && hierarchies[b].length) || 0;
    return bLength - aLength;
  });
  return rankedCategories;
}

function getFullDisplay(message) {
  let { nodes, edges } = message.knowledge_graph;
  nodes = Object.entries(nodes).map(([nodeId, nodeProps]) => {
    const node = {};
    node.id = nodeId;
    node.name = nodeProps.name;
    node.category = nodeProps.category;
    if (node.category && !Array.isArray(node.category)) {
      node.category = [node.category];
    }
    return node;
  });
  edges = Object.entries(edges).map(([edgeId, edgeProps]) => {
    const edge = {};
    edge.id = edgeId;
    edge.source = edgeProps.subject;
    edge.target = edgeProps.object;
    edge.predicate = edgeProps.predicate;
    if (edge.predicate && !Array.isArray(edge.predicate)) {
      edge.predicate = [edge.predicate];
    }
    return edge;
  });
  return { nodes, edges };
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
  getFullDisplay,
  getRankedCategories,
  removeNamedThing,
  getNodeNums,
  getNodeRadius,
  dragNode,
};
