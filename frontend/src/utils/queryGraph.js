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
    ([id, node]) => ({ ...node, id }),
  );
}

/**
 * Remove internal label property
 * @param {object} n a query graph node
 */
// function removeLabel(n) {
//   if (n.label) {
//     delete n.label;
//   }
// }

/**
 * Convert curie to array if not given as array
 * @param {object} n node object with a curie property
 */
function standardizeCuries(n) {
  if (n.curie && !_.isArray(n.curie)) {
    n.curie = [n.curie];
  }
}

/**
 * Convert type to array if not given as array
 * @param {object} e edge object with a type property
 */
function standardizeType(e) {
  // Convert type to array if not given as array
  if (e.type && !_.isArray(e.type)) {
    e.type = [e.type];
  }
}

/**
 * Remove empty curie arrays
 * @param {object} n node object with a curie property
*/
function pruneCuries(n) {
  if (n.curie && _.isArray(n.curie) &&
      n.curie.length === 0) {
    delete n.curie;
  }
}

/**
 * Remove empty type arrays
 * @param {object} e edge object with a type property
*/
function pruneTypes(e) {
  if (e.type && _.isArray(e.type) &&
      e.type.length === 0) {
    delete e.type;
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

    Object.values(internalRepresentation.nodes).forEach(standardizeCuries);
    Object.values(internalRepresentation.nodes).forEach(standardizeType);

    Object.values(internalRepresentation.edges).forEach(standardizeType);
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

    reasonerRepresentation.nodes.forEach(pruneCuries);
    reasonerRepresentation.nodes.forEach(pruneTypes);

    // reasonerRepresentation.nodes.forEach(removeLabel);
    reasonerRepresentation.edges.forEach(pruneTypes);
    return reasonerRepresentation;
  },
};

export default {
  getEmptyGraph,
  convert,
  standardizeType,
};
