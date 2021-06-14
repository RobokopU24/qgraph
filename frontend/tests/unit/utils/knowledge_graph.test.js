import kgUtils from '~/utils/knowledgeGraph';

import test_message from './test_message.json';
import hierarchies from './hierarchies.json';

describe('Knowledge Graph Utils', () => {
  it('makes full node and edge lists', () => {
    const { nodes, edges } = kgUtils.getFullDisplay(test_message.message);
    expect(nodes[0].id).toBe('1');
    expect(edges[0].target).toBe('2');
  });
  it('makes bubble graph nodes', () => {
    const nodes = kgUtils.makeDisplayNodes(test_message.message, hierarchies);
    expect(nodes[0].id).toBe('1');
    expect(nodes[1].count).toBe(1);
  });
  it('gets a node radius', () => {
    const getRadius = kgUtils.getNodeRadius(200, 200, 2, 1);
    expect(Math.round(getRadius(1))).toBe(56);
  });
});
