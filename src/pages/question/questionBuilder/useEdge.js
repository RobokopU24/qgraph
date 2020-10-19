import { useState, useEffect } from 'react';

export default function useEdgePanels() {
  const [id, setId] = useState(null);
  const [sourceId, setSourceId] = useState(null);
  const [targetId, setTargetId] = useState(null);
  const [predicate, setPredicate] = useState([]);
  const [targetNodeList, setTargetNodeList] = useState([]);
  const [connectionsCountReady, setConnectionsCountReady] = useState(false);

  const [broken, setBroken] = useState(false);

  const [predicatesReady, setPredicatesReady] = useState(false); // True when requesting end-point for predicates for source/target pairing
  const [predicateList, setPredicateList] = useState([]);

  function updateSourceId(newSourceId) {
    setSourceId(newSourceId);
    setTargetId(null);
    setPredicatesReady(false);
  }

  function updateTargetId(newTargetId) {
    setTargetId(newTargetId);
    setPredicatesReady(false);
  }

  function switchSourceTarget() {
    setSourceId(targetId);
    setTargetId(sourceId);
    setPredicatesReady(false);
  }

  function updatePredicateList(newPredicateList) {
    setPredicateList(newPredicateList);
    setPredicatesReady(true);
  }

  function reset() {
    setId(null);
    setSourceId(null);
    setTargetId(null);
    setPredicate([]);
    setTargetNodeList([]);
    setConnectionsCountReady(false);
    setBroken(false);
    setPredicatesReady(false);
    updatePredicateList([]);
  }

  function initialize(seed) {
    reset();
    setId(seed.id || null);
    setSourceId(seed.source_id || null);
    setTargetId(seed.target_id || null);
    if (seed.type) {
      setPredicate(seed.type.map(
        (p_name) => ({ name: p_name }),
      ));
    }
  }

  function isValidPredicate() {
    return predicate.every((p) => predicateList.includes(p));
  }

  return {
    id,
    sourceId,
    updateSourceId,
    targetId,
    updateTargetId,
    predicateList,
    predicatesReady,
    updatePredicateList,
    predicate,
    setPredicate,
    reset,
    initialize,
    targetNodeList,
    isValidPredicate,
    switchSourceTarget,
  };
}
