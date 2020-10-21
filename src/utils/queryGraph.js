import _ from 'lodash';

function getEmptyGraph() {
  return {
    nodes: {},
    edges: {},
  };
}

/*
 * Convert a list of objects with an "id" property
 * to a dictionary
 */
function listWithIdsToDict(list) {
  const ret = {};

  list.forEach((node) => {
    ret[node.id] = { ...node };
    delete ret[node.id].id;
  });

  return ret;
}

/*
 * Convert a dictionary of key-value pairs to a list of objects
 * with an internal "id" property
 */
function dictToListWithIds(dict) {
  return Object.entries(dict).map(
    ([id, node]) => ({ ...node, id }),
  );
}

/*
 * Convert curie to array if not given as array
 */
function standardizeCuries(n) {
  if (n.curie && !_.isArray(n.curie)) {
    n.curie = [n.curie];
  }
}

/*
 * Convert type to array if not given as array
 */
function standardizeType(e) {
  // Convert type to array if not given as array
  if (e.type && !_.isArray(e.type)) {
    e.type = [e.type];
  }
}

/*
 * Remove empty curie arrays
*/
function pruneCuries(n) {
  if (n.curie && _.isArray(n.curie) &&
      n.curie.length === 0) {
    delete n.curie;
  }
}

/*
 * Remove empty type arrays
*/
function pruneTypes(e) {
  if (e.type && _.isArray(e.type) &&
      e.type.length === 0) {
    delete e.type;
  }
}

/*
 * Conversion utilities between
 * different query graph representations
 */
const convert = {
  reasonerToInternal(q) {
    const internalRepresentation = {};
    internalRepresentation.nodes = listWithIdsToDict(q.nodes);
    internalRepresentation.edges = listWithIdsToDict(q.edges);
    Object.values(internalRepresentation.nodes).forEach(standardizeCuries);
    Object.values(internalRepresentation.edges).forEach(standardizeType);
    return internalRepresentation;
  },
  internalToReasoner(q) {
    const reasonerRepresentation = {};
    reasonerRepresentation.nodes = dictToListWithIds(q.nodes);
    reasonerRepresentation.edges = dictToListWithIds(q.edges);
    reasonerRepresentation.nodes.forEach(pruneCuries);
    reasonerRepresentation.edges.forEach(pruneTypes);
    return reasonerRepresentation;
  },
};

export default {
  getEmptyGraph,
  convert,
};
