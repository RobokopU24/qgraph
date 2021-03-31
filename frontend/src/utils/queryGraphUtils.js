import _ from 'lodash';

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
 * Convert a list of objects with an "id" property
 * to a dictionary
 * @param {array} list a list of node or edge objects that each have an ID property
 */
function listWithIdsToDict(list) {
  const ret = {};

  list.forEach((node) => {
    ret[node.id] = { ...node };
    delete ret[node.id].id;
  });

  return ret;
}

/**
 * Convert a dictionary of key-value pairs to a list of objects
 * with an internal "id" property
 * @param {object} dict dictionary with keys and values
 */
function dictToListWithIds(dict) {
  return Object.entries(dict).map(
    ([key, node]) => ({ ...node, key }),
  );
}

/**
 * Convert property that could be a string to an array if not given as array
 * @param {object} obj object to modify
 * @param {string} property property to modify
 */
function standardizeArrayProperty(obj, property) {
  if (obj[property] && !_.isArray(obj[property])) {
    obj[property] = [obj[property]];
  }
}

const standardizeIDs = (o) => standardizeArrayProperty(o, 'id');
const standardizePredicate = (o) => standardizeArrayProperty(o, 'predicate');
const standardizeCategory = (o) => standardizeArrayProperty(o, 'category');

/**
 * Remove empty arrays
 * @param {object} obj object to prune
 * @param {string} property property of object to prune
*/
function pruneEmptyArrays(obj, property) {
  if (obj[property] && _.isArray(obj[property]) &&
      obj[property].length === 0) {
    delete obj[property];
  }
}

/**
 * Conversion utilities between
 * different query graph representations
 */
const convert = {
  /**
   * Convert an old Reasoner standard query graph to a newer internal representation
   * @param {object} q a query graph containing lists of nodes and edges
   * @returns {object} a query graph containing objects of nodes and edges
   */
  reasonerToInternal(q) {
    const internalRepresentation = {};
    internalRepresentation.nodes = listWithIdsToDict(q.nodes);
    internalRepresentation.edges = listWithIdsToDict(q.edges);

    Object.values(internalRepresentation.nodes).forEach(standardizeIDs);
    Object.values(internalRepresentation.nodes).forEach(standardizeCategory);

    Object.values(internalRepresentation.edges).forEach(standardizeCategory);
    return internalRepresentation;
  },
  /**
   * Convert a newer internal representation to the older Reasoner standard query graph
   * @param {object} q a query graph containing objects of nodes and edges
   * @returns {object} a query graph containing a list of nodes and edges
   */
  internalToReasoner(q) {
    const reasonerRepresentation = {};
    reasonerRepresentation.nodes = dictToListWithIds(q.nodes);
    reasonerRepresentation.edges = dictToListWithIds(q.edges);

    reasonerRepresentation.nodes.forEach((node) => {
      pruneEmptyArrays(node, 'id');
      pruneEmptyArrays(node, 'category');
      node.id = node.key;
      delete node.key;
    });

    reasonerRepresentation.edges.forEach((edge) => {
      pruneEmptyArrays(edge, 'predicate');
      edge.id = edge.key;
      delete edge.key;
    });

    return reasonerRepresentation;
  },
};

/**
 * Remove any empty node categories or ids or edge predicates
 * @param {obj} q_graph query graph
 * @returns query graph
 */
function prune(q_graph) {
  const clonedQueryGraph = _.cloneDeep(q_graph);
  Object.keys(clonedQueryGraph.nodes).forEach((n) => {
    pruneEmptyArrays(clonedQueryGraph.nodes[n], 'category');
    pruneEmptyArrays(clonedQueryGraph.nodes[n], 'id');
    if (clonedQueryGraph.nodes[n].id && clonedQueryGraph.nodes[n].category) {
      delete clonedQueryGraph.nodes[n].category;
    }
  });
  Object.keys(clonedQueryGraph.edges).forEach((e) => {
    pruneEmptyArrays(clonedQueryGraph.edges[e], 'predicate');
  });
  return clonedQueryGraph;
}

export default {
  getEmptyGraph,
  convert,
  standardizeCategory,
  standardizePredicate,
  standardizeIDs,
  prune,
};
