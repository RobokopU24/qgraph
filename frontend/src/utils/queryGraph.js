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
 * Convert a list of objects with an "id" property
 * to a dictionary
 * @param {array} list - a list of node or edge objects that each have an ID property
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
 * @param {object} dict - dictionary with keys and values
 */
function dictToListWithIds(dict) {
  return Object.entries(dict).map(
    ([key, node]) => ({ ...node, key }),
  );
}

/**
 * Convert property that could be a string to an array if not given as array
 * @param {object} obj - object to modify
 * @param {string} property - property to modify
 */
function standardizeArrayProperty(obj, property) {
  if (obj[property] && !_.isArray(obj[property])) {
    obj[property] = [obj[property]];
  }
  if (obj[property] && property === 'ids') {
    obj.id = obj.ids;
    delete obj.ids;
  }
  if (obj[property] && property === 'categories') {
    obj.category = obj.categories;
    delete obj.categories;
  }
  if (obj[property] && property === 'predicates') {
    obj.predicate = obj.predicates;
    delete obj.predicates;
  }
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

const standardizeIDs = (o) => standardizeArrayProperty(o, 'ids');
const standardizePredicate = (o) => standardizeArrayProperty(o, 'predicates');
const standardizeCategory = (o) => standardizeArrayProperty(o, 'categories');

/**
 * Remove empty arrays
 * @param {object} obj - object to prune
 * @param {string} property - property of object to prune
*/
function pruneEmptyArray(obj, property) {
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
   * @param {object} q - a query graph containing lists of nodes and edges
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
   * @param {object} q - a query graph containing objects of nodes and edges
   * @returns {object} a query graph containing a list of nodes and edges
   */
  internalToReasoner(q) {
    const reasonerRepresentation = {};
    reasonerRepresentation.nodes = dictToListWithIds(q.nodes);
    reasonerRepresentation.edges = dictToListWithIds(q.edges);

    reasonerRepresentation.nodes.forEach((node) => {
      pruneEmptyArray(node, 'id');
      pruneEmptyArray(node, 'category');
      node.id = node.key;
      delete node.key;
    });

    reasonerRepresentation.edges.forEach((edge) => {
      pruneEmptyArray(edge, 'predicate');
      edge.id = edge.key;
      delete edge.key;
    });

    return reasonerRepresentation;
  },
};

/**
 * Find curve id regardless of node id order
 * @param {object[]} edgeCurves - list of edges with curve properties
 * @param {string} id - `{nodeId}--{nodeId}`
 * @returns {string} `{nodeId}--{nodeId}`
 */
function findCurveId(edgeCurves, id) {
  const [subject, object] = id.split('--');
  const curveId = Object.keys(edgeCurves).find((curve) => {
    const nodeIds = curve.split('--');
    if (nodeIds.indexOf(subject) > -1 && nodeIds.indexOf(object) > -1) {
      return true;
    }
    return false;
  });
  return curveId;
}

const edgeCurveProps = {
  get: (edgeCurves, id) => {
    const curveId = findCurveId(edgeCurves, id);
    let flip = false;
    if (curveId) {
      // n0--n1 != n1--n0
      // we need to flip in order to have all edges right side up
      if (curveId !== id) {
        flip = true;
      }
      // return existing edge curve props
      return { indices: edgeCurves[curveId], flip };
    }
    // return new edge curve props
    return { indices: [], flip };
  },
  set: (edgeCurves, id, val) => {
    const curveId = findCurveId(edgeCurves, id);
    if (curveId) {
      edgeCurves[curveId] = val;
    } else {
      edgeCurves[id] = val;
    }
    return true;
  },
};

/**
 * Add numEdges, index, and strokeWidth to edge objects
 *
 * **Must modify the existing edges array to keep the same reference for d3**
 * @param {object[]} edges - list of graph edges
 * @returns {object[]} list of edges with properties for d3 curves
 */
function addEdgeCurveProperties(edges) {
  const curveProps = new Proxy({}, edgeCurveProps);
  edges.forEach((e, i) => {
    const curve = curveProps[`${e.source.id}--${e.target.id}`];
    curve.indices.push(i);
    curveProps[`${e.source.id}--${e.target.id}`] = curve.indices;
  });
  edges.forEach((e, i) => {
    const curve = curveProps[`${e.source.id}--${e.target.id}`];
    e.numEdges = curve.indices.length;
    const edgeIndex = curve.indices.indexOf(i);
    e.index = edgeIndex;
    // if an even number of edges, move first middle edge to outside
    // to keep edges symmetrical
    if (curve.indices.length % 2 === 0 && edgeIndex === 0) {
      e.index = curve.indices.length - 1;
    }
    // if not the first index (0)
    if (edgeIndex) {
      // all even index should be one less and odd indices
      // should be flipped
      const edgeL = edgeIndex % 2;
      if (!edgeL) {
        e.index -= 1;
      } else {
        e.index = -e.index;
      }
    }
    // flip curve on any inverse edges
    if (curve.flip) {
      e.index = -e.index;
    }
    e.strokeWidth = '3';
  });
  return edges;
}

/**
 * Remove any empty node categories or ids or edge predicates
 * @param {obj} q_graph - query graph
 * @returns query graph
 */
function prune(q_graph) {
  const clonedQueryGraph = _.cloneDeep(q_graph);
  Object.keys(clonedQueryGraph.nodes).forEach((n) => {
    pruneEmptyArray(clonedQueryGraph.nodes[n], 'category');
    pruneEmptyArray(clonedQueryGraph.nodes[n], 'id');
    // if (clonedQueryGraph.nodes[n].id && clonedQueryGraph.nodes[n].category) {
    //   delete clonedQueryGraph.nodes[n].category;
    // }
    if (clonedQueryGraph.nodes[n].id) {
      clonedQueryGraph.nodes[n].ids = clonedQueryGraph.nodes[n].id;
      delete clonedQueryGraph.nodes[n].id;
    }
    if (clonedQueryGraph.nodes[n].category) {
      clonedQueryGraph.nodes[n].categories = clonedQueryGraph.nodes[n].category;
      delete clonedQueryGraph.nodes[n].category;
    }
  });
  Object.keys(clonedQueryGraph.edges).forEach((e) => {
    pruneEmptyArray(clonedQueryGraph.edges[e], 'predicate');
    if (clonedQueryGraph.edges[e].predicate) {
      clonedQueryGraph.edges[e].predicates = clonedQueryGraph.edges[e].predicate;
      delete clonedQueryGraph.edges[e].predicate;
    }
  });
  return clonedQueryGraph;
}

/**
 * Standardize properties in a valid query graph
 *
 * - wraps ids, categories, and predicates in arrays
 * - adds a 'name' property to nodes
 * @param {object} q_graph - query graph object
 * @returns {{}} query graph
 */
function standardize(q_graph) {
  const clonedQueryGraph = _.cloneDeep(q_graph);
  Object.keys(clonedQueryGraph.nodes).forEach((n) => {
    const node = clonedQueryGraph.nodes[n];
    standardizeIDs(node);
    standardizeCategory(node);
    if (!node.name) {
      node.name =
        (node.id && node.id.length && node.id.join(', ')) ||
        (node.category && node.category.length && stringUtils.displayCategory(node.category)) ||
        '';
    }
  });
  Object.keys(clonedQueryGraph.edges).forEach((e) => {
    standardizePredicate(clonedQueryGraph.edges[e]);
  });
  return clonedQueryGraph;
}

/**
 * Get label for query graph node ids
 * @param {object} node - query graph node
 * @returns {string} human-readable id label
 */
function getNodeIdLabel(node) {
  if (node.id && Array.isArray(node.id)) {
    return node.id.join(', ');
  }
  return node.id;
}

/**
 * Convert nodes and edges objects to lists for d3
 * @param {obj} q_graph
 * @returns {obj} query graph with node and edge lists
 */
function getNodeAndEdgeListsForDisplay(q_graph) {
  const query_graph = standardize(q_graph);
  const nodes = Object.entries(query_graph.nodes).map(([nodeId, obj]) => {
    let { name } = obj;
    if (!obj.name) {
      name = obj.id && obj.id.length ? obj.id.join(', ') : stringUtils.displayCategory(obj.category);
    }
    if (!name) {
      name = 'Something';
    }
    obj.category = makeArray(obj.category);
    return {
      id: nodeId,
      name,
      category: obj.category,
    };
  });
  const edges = Object.entries(query_graph.edges).map(([edgeId, obj]) => (
    {
      id: edgeId,
      predicate: obj.predicate,
      source: obj.subject,
      target: obj.object,
    }
  ));
  return { nodes, edges };
}

export default {
  getEmptyGraph,
  convert,
  standardizeCategory,
  standardizePredicate,
  standardizeIDs,
  addEdgeCurveProperties,
  prune,
  standardize,
  getNodeAndEdgeListsForDisplay,
  getNodeIdLabel,
};
