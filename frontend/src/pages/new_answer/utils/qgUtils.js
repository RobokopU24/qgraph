import * as d3 from 'd3';
import stringUtils from '~/utils/stringUtils';
import queryGraphUtils from '~/utils/queryGraphUtils';

/**
 * Make lists of nodes and edges for d3
 * @param {obj} q_graph query graph object
 * @param {obj} q_graph.nodes node objects
 * @param {obj} q_graph.edges edge objects
 */
function makeDisplay(q_graph) {
  const query_graph = queryGraphUtils.ingest(q_graph);
  const nodes = Object.entries(query_graph.nodes).map(([nId, obj]) => {
    let { name } = obj;
    if (!obj.name) {
      name = obj.id ? obj.id : stringUtils.displayCategory(obj.category);
    }
    if (!name) {
      name = 'Any';
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

function dragNode(simulation) {
  function dragStart(e, d) {
    if (!e.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(e, d) {
    d.fx = e.x;
    d.fy = e.y;
  }

  function dragEnd(e, d) {
    if (!e.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  return d3.drag()
    .on('start', dragStart)
    .on('drag', dragged)
    .on('end', dragEnd);
}

export default {
  makeDisplay,
  dragNode,
};
