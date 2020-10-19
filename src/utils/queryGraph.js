/*
   * Load the internal query_graph from a list representation
   * where nodes and edges are lists with an internal "id" property
   */
function fromListRepresentation(listRepresentation) {
  const newQueryGraph = { nodes: {}, edges: {} };

  listRepresentation.nodes.forEach((node) => {
    newQueryGraph.nodes[node.id] = { ...node, id: undefined };
  });

  listRepresentation.edges.forEach((edge) => {
    newQueryGraph.edges[edge.id] = { ...edge, id: undefined };
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

export default {
  fromListRepresentation,
  toListRepresentation,
};
