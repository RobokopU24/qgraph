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
function validateGraph(graph, graphType) {
  const errors = [];

  if (!graph || graph.constructor !== Object) {
    errors.push(`${graphType} is not a valid JSON object`);
    return errors;
  }

  // Check for nodes
  if (!graph.nodes) {
    errors.push(`${graphType} requires a "nodes" property`);
  } else if (Array.isArray(graph.nodes)) {
    errors.push(`${graphType} nodes should be an object`);
  } else {
    // Since every node has an id we can check if they are unique
    const nodeIds = new Set(Object.keys(graph.nodes));
    const hasUniqueNodeIds = nodeIds.size === Object.keys(graph.nodes).length;
    if (!hasUniqueNodeIds) {
      errors.push(`There are multiple ${graphType.toLowerCase()} nodes with the same ID`);
    }
  }

  // Check for edges
  if (!graph.edges) {
    errors.push(`${graphType} requires an "edges" property`);
  } else if (Array.isArray(graph.edges)) {
    errors.push(`${graphType} edges should be an object`);
  } else {
    // each edge should have a valid source and target id
    const edgesHaveIds = Object.keys(graph.edges).reduce((val, e) => val && graph.edges[e] && graph.edges[e].subject && graph.edges[e].object, true);
    if (!edgesHaveIds) {
      errors.push(`Each ${graphType.toLowerCase()} edge must have a valid "subject" and a "object" property`);
    }
  }

  return errors;
}

/**
 * Validate message results
 * Return a list of errors as soon as we find one
 * malformed result
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

    if (!('edge_bindings' in results[i])) {
      errors.push('No edge_bindings in result object');
    } else if (results[i].edge_bindings.constructor !== Object) {
      errors.push('Results edge_bindings is not a valid JSON object');
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
 */
function validateMessage(message) {
  if (!message || message.constructor !== Object) {
    return ['The uploaded message isn\'t a valid JSON object.'];
  }
  if (!('message' in message)) {
    return ['The uploaded message should have a parent property of "message".'];
  }

  let errors = validateGraph(message.message.query_graph, 'Query Graph');
  errors = [...errors, ...validateGraph(message.message.knowledge_graph, 'Knowledge Graph')];
  errors = [...errors, ...validateResults(message.message.results)];

  return errors;
}

export default {
  validateGraph,
  validateMessage,
};
