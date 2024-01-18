import { useState, useMemo, useContext } from 'react';

import BiolinkContext from '~/context/biolink';
import kgUtils from '~/utils/knowledgeGraph';
import resultsUtils from '~/utils/results';
import stringUtils from '~/utils/strings';

/**
 * Main answer page store
 *
 * Stores current TRAPI message
 */
export default function useAnswerStore() {
  const [message, setMessage] = useState({});
  const [kgNodes, setKgNodes] = useState([]);
  const [selectedResult, setSelectedResult] = useState({});
  const [selectedRowId, setSelectedRowId] = useState('');
  const [metaData, setMetaData] = useState({});
  const [resultJSON, setResultJSON] = useState({});
  const { colorMap, hierarchies } = useContext(BiolinkContext);

  /**
   * Reset all answer explorer state
   */
  function resetAnswerExplorer() {
    setSelectedResult({});
    setSelectedRowId('');
    setMetaData({});
    setResultJSON({});
  }

  /**
   * Takes a TRAPI message and average the analysis scores for each
   * result, and places that average in a new key called `score` on
   * each result object.
   * @param {object} msg - TRAPI message
   */
  function averageAnalysesScores(msg) {
    const resultsWithScore = msg.results.map((result) => {
      // get average score of all analyses
      const score = result.analyses.reduce((sum, analysis) => sum + analysis.score, 0) / result.analyses.length;
      return {
        ...result,
        score,
      };
    });

    return {
      ...msg,
      results: resultsWithScore,
    };
  }

  /**
   * Initialize the answer store with a message
   *
   * Stores the message, makes the nodes for a bubble chart,
   * and resets any results table info
   * @param {object} msg - TRAPI message
   */
  function initialize(msg, updateDisplayState) {
    setMessage(averageAnalysesScores(msg));
    if (msg.knowledge_graph && msg.results) {
      setKgNodes(kgUtils.makeDisplayNodes(msg, hierarchies));
      updateDisplayState({ type: 'toggle', payload: { component: 'kg', show: true } });
      updateDisplayState({ type: 'toggle', payload: { component: 'results', show: true } });
    } else {
      // if knowledge_graph and results are undefined, then disable those components
      updateDisplayState({ type: 'disable', payload: { component: 'kg' } });
      updateDisplayState({ type: 'disable', payload: { component: 'results' } });
    }
    resetAnswerExplorer();
  }

  function reset() {
    setMessage({});
    setKgNodes([]);
    resetAnswerExplorer();
  }

  /**
   * Get metadata of result when selected in the results table
   * @param {object} row - result object from message that was selected
   * @param {string} rowId - the internal row id
   */
  function selectRow(row, rowId) {
    if (rowId === selectedRowId) {
      resetAnswerExplorer();
    } else {
      const publications = {};
      const nodes = {};
      const nodesJSON = {};
      Object.entries(row.node_bindings).forEach(([qg_id, value]) => {
        // any lone node in a node binding will get an infinite score
        // and automatically not be pruned
        const kgIdLength = value.length;
        // add all results nodes to json display
        value.forEach((kgObject) => {
          const kgNode = message.knowledge_graph.nodes[kgObject.id];
          nodesJSON[kgObject.id] = kgNode || 'Unknown';
          if (kgNode) {
            let { categories } = kgNode;
            if (categories && !Array.isArray(categories)) {
              categories = [categories];
            }
            categories = kgUtils.getRankedCategories(hierarchies, categories);
            const graphNode = {
              id: kgObject.id,
              name: kgNode.name || kgObject.id || categories[0],
              categories,
              qg_id,
              is_set: false,
              score: kgIdLength > 1 ? 0 : Infinity,
            };
            nodes[kgObject.id] = graphNode;
          }
        });
      });

      const edges = {};
      const edgesJSON = {};
      row.analyses.forEach((analysis) => {
        Object.values(analysis.edge_bindings).forEach((edgeBindings) => {
          edgeBindings.forEach((binding) => {
            const kgEdge = message.knowledge_graph.edges[binding.id];
            console.log('--- TRYING TO WRITE STUFF FOR EDGE ID: ' + binding.id);
            console.log(JSON.stringify(kgEdge, null, 2));
            edgesJSON[binding.id] = kgEdge || 'Unknown';
            if (kgEdge) {
              const graphEdge = {
                id: binding.id,
                source: kgEdge.subject,
                target: kgEdge.object,
                predicate: kgEdge.predicate,
              };
              edges[binding.id] = graphEdge;
              if (kgEdge.subject in nodes) {
                nodes[kgEdge.subject].score += 1;
              }
              if (kgEdge.object in nodes) {
                nodes[kgEdge.object].score += 1;
              }
              const subjectNode = message.knowledge_graph.nodes[kgEdge.subject];
              const objectNode = message.knowledge_graph.nodes[kgEdge.object];
              const edgeKey = `${subjectNode.name || kgEdge.subject} ${stringUtils.displayPredicate(kgEdge.predicate)} ${objectNode.name || kgEdge.object}`;
              publications[edgeKey] = resultsUtils.getPublications(kgEdge);
              console.log(publications[edgeKey]);
              // "edge": {
              //   "subject": "PUBCHEM.COMPOUND:6018",
              //   "object": "MONDO:0007739",
              //   "predicate": "biolink:treats",
              //   "publications": ["PMC:4557792", "PMID:29920125", "PMID:30136594", "PMID:19050408", "PMID:28742396", "PMID:19381278", "PMID:22621818", "PMID:2901681"],
              //   "sentences": "Valbenazine is a modified metabolite of the vesicular monoamine transporter 2 (VMAT-2) inhibitor tetrabenazine, which is approved for the treatment of the hyperkinetic movement disorder, Huntington's disease.|NA|This deuterated form of the drug tetrabenazine is indicated for the treatment of chorea associated with Huntington's disease as well as tardive dyskinesia.|NA|For example, in 2008 the FDA approved the synthetic VMAT2 inhibitor tetrabenazine (TBZ) for treatment of chorea associated with Huntington?s disease.|NA"
              // }
              if (publications[edgeKey].length > 0) {
                // Create the edge json object, and send to the gpt.
                const thisEdgeJson = {
                  nodes: nodesJSON,
                  edge: {
                    subject: kgEdge.subject,
                    object: kgEdge.object,
                    predicate: kgEdge.predicate,
                    publications: publications[edgeKey],
                    sentences: resultsUtils.getSentences(kgEdge),
                  },
                };
                console.log('Found one ore more publication!');
                console.log(JSON.stringify(thisEdgeJson, null, 2));
                // Add a metadata object to the edgeJSON as GPT Summary
              }
            }
          });
        });
      });
      setSelectedResult({ nodes, edges });
      setSelectedRowId(rowId);
      setMetaData(publications);
      // TODO: If there are more than one publications, call chatgpt endpoint here?
      console.log('*** NODES :::');
      console.log(JSON.stringify(nodes, null, 2));
      console.log('*** EDGES :::');
      console.log(JSON.stringify(edgesJSON, null, 2));
      // store full result JSON
      setResultJSON({ knowledge_graph: { nodes: nodesJSON, edges: edgesJSON }, result: row });
    }
  }

  /**
   * Compute table header list when message changes
   */
  const tableHeaders = useMemo(() => {
    if (message.query_graph && message.knowledge_graph && message.results) {
      return resultsUtils.makeTableHeaders(message, colorMap);
    }
    return [];
  }, [message, colorMap]);

  /**
   * Show prune slider when there are sets with more than 3 nodes in them
   */
  const showNodePruneSlider = useMemo(() => (
    Object.keys(resultJSON).length &&
    Object.values(resultJSON.result.node_bindings).some((kgIdList) => kgIdList.length > 3)
  ), [resultJSON]);

  const numQgNodes = useMemo(() => tableHeaders.length, [tableHeaders]);

  return {
    initialize,
    reset,
    message,

    kgNodes,

    tableHeaders,
    selectedResult,
    selectedRowId,
    resultJSON,
    selectRow,
    showNodePruneSlider,
    numQgNodes,

    metaData,
  };
}
