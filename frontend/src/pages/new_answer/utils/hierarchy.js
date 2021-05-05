import queryBuilderUtils from '~/utils/queryBuilder';

function getQGNodeHierarchy(message) {
  const { query_graph } = message;
  const qgNodeIds = Object.keys(query_graph.nodes);
  const qgEdgeIds = Object.keys(query_graph.edges);
  const rootNode = queryBuilderUtils.findRootNode(query_graph);
  console.log(rootNode);
  const hierarchy = {
    name: rootNode,
    children: [],
  };
  const remainingEdges = qgEdgeIds;
  let currentChildren = hierarchy.children;
  let currentNode = rootNode;
  while (remainingEdges.length) {
    const attachedEdges = qgEdgeIds.filter((edgeId) => {
      const { subject, object } = query_graph.edges[edgeId];
      return subject === currentNode || object === currentNode;
    });
    for (let i = 0; i < attachedEdges.length; i += 1) {
      const { subject, object } = query_graph.edges[attachedEdges[i]];
      if (subject !== currentNode) {
        // add node to hierarchy list
        currentChildren.push(subject);
      } else if (object !== currentNode) {
        // add node to hierarchy list
        currentChildren.push(object);
      }
      // remove edge from remaining list
      remainingEdges.splice(remainingEdges.indexOf(attachedEdges[i]), 1);
    }
    // choose the next current children
    // choose the next current node
  }
}

export default {
  getQGNodeHierarchy,
};
