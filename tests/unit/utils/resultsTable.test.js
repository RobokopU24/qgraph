import resultsUtils, { findStartingNode, sortNodes } from '~/utils/results';

import test_message from '&/test_message.json';
import query_graph from '&/query_graph.json';

describe('Results Table', () => {
  it('finds the root node', () => {
    expect(findStartingNode(test_message.message.query_graph)).toBe('n1');
  });
  it('sorts query graph nodes', () => {
    const sortedNodes = sortNodes(query_graph, '3');
    expect(sortedNodes).toStrictEqual(['3', '1', '2', '4']);
  });
  it('makes table headers correctly', () => {
    const tableHeaders = resultsUtils.makeTableHeaders(test_message.message, () => ['', '']);
    expect(tableHeaders.length).toBe(2);
    const [header1, header2] = tableHeaders;
    expect(header1.id).toBe('n1');
    expect(header2.id).toBe('n0');
  });
});
