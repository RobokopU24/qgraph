import _ from 'lodash';

function getEmptyGraph() {
  return {
    nodes: {},
    edges: {},
  };
}

/*
   * Load the internal query_graph from a list representation
   * where nodes and edges are lists with an internal "id" property
   */
function fromListRepresentation(listRepresentation) {
  const newQueryGraph = getEmptyGraph();

  listRepresentation.nodes.forEach((node) => {
    newQueryGraph.nodes[node.id] = { ...node };
    delete newQueryGraph.nodes[node.id].id;
  });

  listRepresentation.edges.forEach((edge) => {
    newQueryGraph.edges[edge.id] = { ...edge };
    delete newQueryGraph.edges[edge.id].id;
  });

  return newQueryGraph;
}

/*
   * Get a list based representation of the query_graph
   * where nodes and edges are lists with an internal "id" property
   */
function toListRepresentation(dictRepresentation = { nodes: {}, edges: {} }) {
  const listRepresentation = {};

  listRepresentation.nodes =
      Object.entries(dictRepresentation.nodes).map(
        ([id, node]) => ({ ...node, id }),
      );
  listRepresentation.edges =
      Object.entries(dictRepresentation.edges).map(
        ([id, edge]) => ({ ...edge, id }),
      );
  return listRepresentation;
}

function uploadNodePreprocessor(n) {
  // Convert curie to array if not given as array
  if (n.curie && !_.isArray(n.curie)) {
    n.curie = [n.curie];
  }
}

function uploadEdgePreprocessor(e) {
  // Convert type to array if not given as array
  if (e.type && !_.isArray(e.type)) {
    e.type = [e.type];
  }
}

export default {
  fromListRepresentation,
  toListRepresentation,
  getEmptyGraph,
  uploadNodePreprocessor,
  uploadEdgePreprocessor,
};
