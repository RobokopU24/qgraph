import stringUtils from '~/utils/strings';
import queryGraphUtils from '~/utils/queryGraph';

/**
 * Make lists of nodes and edges for d3
 * @param {obj} q_graph query graph object
 * @param {obj} q_graph.nodes node objects
 * @param {obj} q_graph.edges edge objects
 */
function makeDisplay(q_graph) {
  const query_graph = queryGraphUtils.standardize(q_graph);
  const nodes = Object.entries(query_graph.nodes).map(([nId, obj]) => {
    let { name } = obj;
    if (!obj.name) {
      name = obj.id ? obj.id : stringUtils.displayCategory(obj.category);
    }
    if (!name) {
      name = 'Something';
    }
    if (!Array.isArray(obj.category)) {
      obj.category = [obj.category];
    }
    return {
      id: nId,
      name,
      category: obj.category,
    };
  });
  const edges = Object.entries(query_graph.edges).map(([eId, obj]) => (
    {
      id: eId,
      predicate: obj.predicate,
      source: obj.subject,
      target: obj.object,
    }
  ));
  return { nodes, edges };
}

export default {
  makeDisplay,
};
