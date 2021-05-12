import { useState, useMemo, useContext } from 'react';

import BiolinkContext from '~/context/biolink';
import kgUtils from './utils/kg';
import resultsUtils from './utils/results';

export default function useAnswerStore() {
  const [message, setMessage] = useState({});
  const [kgNodes, setKgNodes] = useState([]);
  const [selectedResult, setSelectedResult] = useState({});
  const [selectedRowId, setSelectedRowId] = useState('');
  const { colorMap, hierarchies } = useContext(BiolinkContext);

  function initialize(msg) {
    setMessage(msg);
    setKgNodes(kgUtils.makeDisplayNodes(msg, hierarchies));
    // reset answer explorer
    setSelectedResult({});
    setSelectedRowId('');
  }

  function selectRow(row, rowId) {
    if (rowId === selectedRowId) {
      setSelectedRowId('');
      setSelectedResult({});
    } else {
      const edges = [];
      Object.values(row.edge_bindings).forEach((value) => {
        value.forEach((kgObject) => {
          const kgEdge = message.knowledge_graph.edges[kgObject.id];
          if (kgEdge.predicate && !Array.isArray(kgEdge.predicate)) {
            kgEdge.predicate = [kgEdge.predicate];
          }
          kgEdge.source = kgEdge.subject;
          kgEdge.target = kgEdge.object;
          kgEdge.id = kgObject.id;
          edges.push(kgEdge);
        });
      });
      const nodes = [];
      Object.values(row.node_bindings).forEach((value) => {
        value.forEach((kgObject) => {
          const kgNode = message.knowledge_graph.nodes[kgObject.id];
          let categories = kgNode.category;
          categories = kgUtils.removeNamedThing(categories);
          categories = kgUtils.getRankedCategories(hierarchies, categories);
          kgNode.category = categories;
          kgNode.id = kgObject.id;
          nodes.push(kgNode);
        });
      });
      setSelectedResult({ nodes, edges });
      setSelectedRowId(rowId);
    }
  }

  const tableHeaders = useMemo(() => {
    if (message.query_graph) {
      return resultsUtils.makeTableHeaders(message, colorMap);
    }
    return [];
  }, [message]);

  return {
    initialize,
    message,

    kgNodes,

    tableHeaders,
    selectedResult,
    selectedRowId,
    selectRow,
  };
}
