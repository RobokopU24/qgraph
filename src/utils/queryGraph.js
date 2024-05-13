import _ from 'lodash';
import stringUtils from './strings';

/**
 * Create a new query graph object
 */
function getEmptyGraph() {
  return {
    nodes: {},
    edges: {},
  };
}

/**
 * Convert an array of objects with "id" properties
 * to an object
 * @param {array} array - a list of objects that each have an ID property
 */
function arrayWithIdsToObj(array) {
  const object = {};

  array.forEach((item) => {
    object[item.id] = { ...item };
    delete object[item.id].id;
  });

  return object;
}

/**
 * Make the input an array
 * @param {(string|array)} value - input to make into array
 * @throws {TypeError}
 * @returns {(array|null)} array of the value or null
 */
function makeArray(value) {
  if (Array.isArray(value)) {
    // return copy of array
    return [...value];
  }
  if (typeof value === 'string') {
    return [value];
  }
  if (value === null || value === undefined) {
    return value;
  }
  throw TypeError('Unexpected input. Should be either an array or string.');
}

/**
 * Remove empty arrays
 * @param {object} obj - object to prune
 * @param {string} property - property of object to prune
*/
function pruneEmptyArray(obj, property) {
  if (obj[property] && Array.isArray(obj[property]) && obj[property].length === 0) {
    delete obj[property];
  }
}

/**
 * Convert an old Reasoner standard query graph to the current TRAPI version format
 * @param {object} qGraph - a query graph in an older format
 * @returns {object} a query graph in the current TRAPI format
 */
function toCurrentTRAPI(qGraph) {
  const query_graph = _.cloneDeep(qGraph);
  // convert arrays to objects
  if (Array.isArray(qGraph.nodes)) {
    query_graph.nodes = arrayWithIdsToObj(qGraph.nodes);
  } else {
    query_graph.nodes = qGraph.nodes;
  }
  if (Array.isArray(qGraph.edges)) {
    query_graph.edges = arrayWithIdsToObj(qGraph.edges);
  } else {
    query_graph.edges = qGraph.edges;
  }

  // convert outdated node properties
  Object.values(query_graph.nodes).forEach((node) => {
    if (node.curie) {
      node.ids = node.curie;
      delete node.curie;
    } else if (node.id) {
      node.ids = node.id;
      delete node.id;
    }
    if (node.ids) {
      node.ids = makeArray(node.ids);
    }

    if (node.type) {
      node.categories = node.type;
      delete node.type;
    } else if (node.category) {
      node.categories = node.category;
      delete node.category;
    }
    if (node.categories) {
      node.categories = makeArray(node.categories);
    }

    if (typeof node.set === 'boolean') {
      node.is_set = node.set;
      delete node.set;
    }
    if (!node.name) {
      node.name =
        (node.ids && node.ids.length && node.ids.join(', ')) ||
        (node.categories && node.categories.length && stringUtils.displayCategory(node.categories)) ||
        '';
    }
  });

  // convert outdated edge properties
  Object.values(query_graph.edges).forEach((edge) => {
    if (edge.source_id) {
      edge.subject = edge.source_id;
      delete edge.source_id;
    }
    if (edge.target_id) {
      edge.object = edge.target_id;
      delete edge.target_id;
    }
    if (edge.predicate) {
      edge.predicates = edge.predicate;
      delete edge.predicate;
    }
    if (edge.predicates) {
      edge.predicates = makeArray(edge.predicates);
    }
  });
  return query_graph;
}

/**
 * Remove any empty node categories or ids or edge predicates
 * @param {obj} q_graph - query graph
 * @returns query graph
 */
function prune(q_graph) {
  const clonedQueryGraph = _.cloneDeep(q_graph);
  Object.keys(clonedQueryGraph.nodes).forEach((n) => {
    delete clonedQueryGraph.nodes[n].taxa;
    pruneEmptyArray(clonedQueryGraph.nodes[n], 'categories');
    pruneEmptyArray(clonedQueryGraph.nodes[n], 'ids');
  });
  Object.keys(clonedQueryGraph.edges).forEach((e) => {
    pruneEmptyArray(clonedQueryGraph.edges[e], 'predicates');
  });
  return clonedQueryGraph;
}

/**
 * Get label for query graph node ids
 * @param {object} node - query graph node
 * @returns {string} human-readable id label
 */
function getTableHeaderLabel(node) {
  if (node.ids && Array.isArray(node.ids)) {
    return node.ids.join(', ');
  }
  return node.ids;
}

/**
 * Convert nodes and edges objects to lists for d3
 * @param {obj} query_graph
 * @returns {obj} query graph with node and edge lists
 */
function getNodeAndEdgeListsForDisplay(query_graph) {
  const nodes = Object.entries(query_graph.nodes).map(([nodeId, obj]) => {
    let { name } = obj;
    if (!obj.name) {
      name = obj.ids && obj.ids.length ? obj.ids.join(', ') : stringUtils.displayCategory(obj.categories);
    }
    if (!name) {
      name = 'Something';
    }
    return {
      id: nodeId,
      name,
      categories: obj.categories,
      is_set: obj.is_set,
    };
  });
  const edges = Object.entries(query_graph.edges).map(([edgeId, obj]) => (
    {
      id: edgeId,
      predicates: obj.predicates,
      // source and target are specifically for d3
      source: obj.subject,
      target: obj.object,
    }
  ));
  return { nodes, edges };
}

export default {
  getEmptyGraph,
  toCurrentTRAPI,
  prune,
  getNodeAndEdgeListsForDisplay,
  getTableHeaderLabel,
};
