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
 * @param {object} o a query graph node
 */
// function removeLabel(n) {
//   if (n.label) {
//     delete n.label;
//   }
// }

/**
 * Convert property that could be a string to an array if not given as array
 * @param {object} o object to modify
 * @param {object} property property to modify
 */
function standardizeArrayProperty(o, property) {
  if (o[property] && !_.isArray(o[property])) {
    o[property] = [o[property]];
  }
}

const standardizeCuries = (o) => standardizeArrayProperty(o, 'curie');
const standardizePredicate = (o) => standardizeArrayProperty(o, 'predicate');
const standardizeCategory = (o) => standardizeArrayProperty(o, 'category');

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
 * Remove empty category arrays
 * @param {object} e edge object with a category property
*/
function pruneCategories(e) {
  if (e.category && _.isArray(e.category) &&
      e.category.length === 0) {
    delete e.category;
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

    reasonerRepresentation.nodes.forEach(pruneCuries);
    reasonerRepresentation.nodes.forEach(pruneCategories);

    // reasonerRepresentation.nodes.forEach(removeLabel);
    reasonerRepresentation.edges.forEach(pruneCategories);
    return reasonerRepresentation;
  },
};

export default {
  getEmptyGraph,
  convert,
  standardizeCategory,
  standardizePredicate,
  standardizeCuries,
};
