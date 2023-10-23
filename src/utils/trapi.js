/**
 * A Reasoner API Standard Message
 * @typedef {Object} Message
 * @property {Object} knowledge_graph - a graph containing nodes and edges
 * @property {Object} query_graph - a graph containing nodes and edges
 * @property {Array} results - an array of results
 */

/**
 * Simple graph validity checks
 * @param {object} graph - object containing nodes and edges
 * @param {string} graphName - name of graph for error messages
 * @returns list of errors
 */
function validateGraph(graph, graphName) {
  const errors = [];

  if (!graph || graph.constructor !== Object) {
    errors.push(`${graphName} is not a valid JSON object`);
    return errors;
  }

  // Check for nodes
  if (!graph.nodes) {
    errors.push(`${graphName} requires a "nodes" property`);
    return errors;
  }
  if (Array.isArray(graph.nodes)) {
    errors.push(`${graphName} nodes should be an object`);
    return errors;
  }
  // Since every node has an id we can check if they are unique
  const nodeIds = new Set(Object.keys(graph.nodes));
  const hasUniqueNodeIds = nodeIds.size === Object.keys(graph.nodes).length;
  if (!hasUniqueNodeIds) {
    errors.push(`There are multiple ${graphName.toLowerCase()} nodes with the same ID`);
  }

  // Check for edges
  if (!graph.edges) {
    errors.push(`${graphName} requires an "edges" property`);
    return errors;
  }
  if (Array.isArray(graph.edges)) {
    errors.push(`${graphName} edges should be an object`);
    return errors;
  }
  // each edge should have a valid source and target id
  const edgesHaveIds = Object.keys(graph.edges).reduce((val, e) => {
    const edge = graph.edges[e];
    return val && edge && edge.subject && edge.object && graph.nodes && graph.nodes[edge.subject] && graph.nodes[edge.object];
  }, true);
  if (!edgesHaveIds) {
    errors.push(`Each ${graphName.toLowerCase()} edge must have a valid "subject" and "object" property`);
  }

  return errors;
}

/**
 * Validate message results
 * Return a list of errors as soon as we find one
 * malformed result
 * @param {array} results - results array of a message
 */
function validateResults(results) {
  const errors = [];

  if (!Array.isArray(results)) {
    errors.push('Message results should be an array');
    return errors;
  }

  for (let i = 0; i < results.length; i += 1) {
    if (!('node_bindings' in results[i])) {
      errors.push('No node_bindings in result object');
    } else if (results[i].node_bindings.constructor !== Object) {
      errors.push('Results node_bindings is not a valid JSON object');
    }

    if (!('analyses' in results[i])) {
      errors.push('No analyses in result object');
    } else if (!Array.isArray(results[i].analyses)) {
      errors.push('Results analyses is not an array');
    }
    if (errors.length) {
      break;
    }
  }

  return errors;
}

/**
 * Simple verification that a message is formatted correctly
 * Returns a list of validation errors.
 * @param {Message} message - TRAPI message
 */
function validateMessage(message) {
  if (!message || message.constructor !== Object) {
    return ['The uploaded message isn\'t a valid JSON object.'];
  }
  if (!('message' in message)) {
    return ['The uploaded message should have a parent property of "message".'];
  }

  let errors = validateGraph(message.message.query_graph, 'Query Graph');
  // A knowledge_graph and results are not required in a trapi message
  if (message.message.knowledge_graph) {
    errors = [...errors, ...validateGraph(message.message.knowledge_graph, 'Knowledge Graph')];
  }
  if (message.message.results) {
    errors = [...errors, ...validateResults(message.message.results)];
  }

  return errors;
}

export default {
  validateGraph,
  validateMessage,
};
