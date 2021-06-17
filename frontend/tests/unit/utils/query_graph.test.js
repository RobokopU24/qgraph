import qgUtils from '~/utils/queryGraph';

import test_message from '&/test_message.json';

describe('Answer Page Query Graph Utils', () => {
  it('makes node and edge lists', () => {
    const { nodes, edges } = qgUtils.getNodeAndEdgeListsForDisplay(test_message.message.query_graph);
    expect(nodes[0].id).toBe('n1');
    expect(nodes[1].name).toBe('Gene');
    expect(edges.length).toBe(1);
    expect(edges[0].source).toBe('n0');
  });
  it('handles an unspecified node', () => {
    const { nodes, edges } = qgUtils.getNodeAndEdgeListsForDisplay({
      nodes: {
        n0: {},
      },
      edges: {},
    });
    expect(edges.length).toBe(0);
    expect(nodes[0].name).toBe('Something');
  });
});
