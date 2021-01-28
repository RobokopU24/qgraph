/**
 * A Reasoner API Standard Message
 * @typedef {Object} Message
 * @property {Object} knowledge_graph a graph containing nodes and edges
 * @property {Object} query_graph a graph containing nodes and edges
 * @property {Array} results an array of results
 */

/*
 * Simple graph validity checks
 * Returns list of errors
*/
function validateGraph(graph) {
  const errors = [];

  if (!graph || graph.constructor !== Object) {
    errors.push('Graph is not a valid Javascript object');
    return errors;
  }

  // Check for nodes
  if (!graph.nodes) {
    errors.push('A query graph requires a "nodes" property.');
  } else {
    if (Array.isArray(graph.nodes)) {
      errors.push('Nodes should be an object.');
    }
    // Since every node has an id we can check if they are unique
    const nodeIds = new Set(Object.keys(graph.nodes));
    const hasUniqueNodeIds = nodeIds.size === Object.keys(graph.nodes).length;
    if (!hasUniqueNodeIds) {
      errors.push('There are multiple nodes with the same ID.');
    }
  }

  // Check for edges
  if (!graph.edges) {
    errors.push('A query graph requires an "edges" property.');
  } else {
    if (Array.isArray(graph.edges)) {
      errors.push('Edges should be an object.');
    }
    // each edge should have a valid source and target id
    const edgesHaveIds = Object.keys(graph.edges).reduce((val, e) => val && graph.edges[e] && graph.edges[e].subject && graph.edges[e].object, true);
    if (!edgesHaveIds) {
      errors.push('Each edge must have a valid "subject" and a "object" property.');
    }
  }

  return errors;
}

/*
 * Validate a single instance of a result
*/
function validateResult(r) {
  if (!('node_bindings' in r)) {
    return 'No node_bindings in result object';
  }
  if (!('edge_bindings' in r)) {
    return 'No edge_bindings in result object';
  }

  if (!Array.isArray(r.node_bindings)) {
    return 'Node bindings must be array';
  }
  if (!Array.isArray(r.edge_bindings)) {
    return 'Node bindings must be array';
  }
  return null;
}

/**
 * Simple verification that a message is formatted correctly
 * Returns a list of validation errors.
 */
function validateMessage(message) {
  const errors = [];
  if (!message || message.constructor !== Object) {
    errors.push("The uploaded message isn't a valid JSON object.");
    return errors;
  }

  errors.concat(validateGraph(message.knowledge_graph));
  errors.concat(validateGraph(message.query_graph));

  if (!Array.isArray(message.results)) {
    errors.push('Message results should be an array.');
    return errors;
  }

  const resultErrors = message.results.map(validateResult);
  // Add results errors if not null
  errors.concat(resultErrors.flat().filter((e) => !!e));

  return errors;
}

export default {
  validateGraph,
  validateMessage,
};
