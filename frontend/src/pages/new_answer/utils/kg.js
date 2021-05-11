import * as d3 from 'd3';
import _ from 'lodash';

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

function getNodeRadius(width, height, numQNodes, numResults) {
  const totalArea = width * height * 0.5;
  return (num) => {
    const numerator = totalArea * num;
    const circleArea = numerator / numResults / numQNodes;
    let radius = Math.sqrt(circleArea / Math.PI);
    // cap radius at 90% of height
    radius = Math.min(radius, ((height / 2) * 0.9));
    return radius;
  };
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

function makeDisplayNodes(message, hierarchies) {
  const displayNodes = {};
  message.results.forEach((result) => {
    Object.values(result.node_bindings).forEach((kgObjects) => {
      kgObjects.forEach((kgObj) => {
        let displayNode = displayNodes[kgObj.id];
        if (!displayNode) {
          displayNode = _.cloneDeep(kgObj);
          let categories = message.knowledge_graph.nodes[displayNode.id].category;
          categories = removeNamedThing(categories);
          categories = getRankedCategories(hierarchies, categories);
          displayNode.category = categories;
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
