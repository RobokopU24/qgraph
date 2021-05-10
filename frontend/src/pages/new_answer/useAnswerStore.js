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
    setSelectedResult({});
  }

  function selectRow(row, rowId) {
    if (rowId === selectedRowId) {
      setSelectedRowId('');
      setSelectedResult({});
    } else {
      const edges = {};
      Object.entries(row.edge_bindings).forEach(([key, value]) => {
        edges[key] = [];
        value.forEach((kgObject) => {
          edges[key].push(message.knowledge_graph.edges[kgObject.id]);
        });
      });
      const nodes = {};
      Object.entries(row.node_bindings).forEach(([key, value]) => {
        nodes[key] = [];
        value.forEach((kgObject) => {
          nodes[key].push(message.knowledge_graph.nodes[kgObject.id]);
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
