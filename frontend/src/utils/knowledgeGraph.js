import _ from 'lodash';

/**
 * Calculate the radius node circles
 * @param {integer} width - width of container
 * @param {integer} height - height of container
 * @param {integer} numQNodes - number of query graph nodes
 * @param {integer} numResults - total number of results
 * @returns {function} function that takes a number and returns a radius
 */
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

/**
 * Rank categories based on how specific they are
 * @param {object} hierarchies - all biolink hierarchies
 * @param {array} categories - list of categories of a specific node
 * @returns {string[]} list of ranked categories
 */
function getRankedCategories(hierarchies, categories) {
  const rankedCategories = categories.sort((a, b) => {
    const aLength = (hierarchies[a] && hierarchies[a].length) || 0;
    const bLength = (hierarchies[b] && hierarchies[b].length) || 0;
    return aLength - bLength;
  });
  return rankedCategories;
}

/**
 * Make a list of nodes for bubble graph display
 * @param {object} message - TRAPI message
 * @param {object} hierarchies - all biolink hierarchies
 * @returns {object[]} list of node objects for display
 */
function makeDisplayNodes(message, hierarchies) {
  const displayNodes = {};
  message.results.forEach((result) => {
    Object.values(result.node_bindings).forEach((kgObjects) => {
      kgObjects.forEach((kgObj) => {
        let displayNode = displayNodes[kgObj.id];
        if (!displayNode) {
          displayNode = _.cloneDeep(kgObj);
          let { categories } = message.knowledge_graph.nodes[displayNode.id];
          if (categories && !Array.isArray(categories)) {
            categories = [categories];
          }
          categories = getRankedCategories(hierarchies, categories);
          displayNode.categories = categories;
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

/**
 * Get nodes and edges to display in full knowledge graph
 * @param {object} message - TRAPI message
 * @returns {{ nodes: object[], edges: object[] }} lists of nodes and edges for display
 */
function getFullDisplay(message) {
  let { nodes, edges } = message.knowledge_graph;
  nodes = Object.entries(nodes).map(([nodeId, nodeProps]) => {
    const node = {};
    node.id = nodeId;
    node.name = nodeProps.name;
    node.categories = nodeProps.categories;
    if (node.categories && !Array.isArray(node.categories)) {
      node.categories = [node.categories];
    }
    return node;
  });
  edges = Object.entries(edges).map(([edgeId, edgeProps]) => {
    const edge = {};
    edge.id = edgeId;
    edge.source = edgeProps.subject;
    edge.target = edgeProps.object;
    edge.predicates = edgeProps.predicates;
    if (edge.predicates && !Array.isArray(edge.predicates)) {
      edge.predicates = [edge.predicates];
    }
    return edge;
  });
  return { nodes, edges };
}

export default {
  makeDisplayNodes,
  getFullDisplay,
  getRankedCategories,
  getNodeRadius,
};
