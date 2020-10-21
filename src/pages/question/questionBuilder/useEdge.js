import { useState, useEffect } from 'react';

export default function useEdgePanels() {
  const [id, setId] = useState(null);
  const [sourceId, setSourceId] = useState(null);
  const [targetId, setTargetId] = useState(null);
  const [predicate, setPredicate] = useState([]);
  const [targetNodeList, setTargetNodeList] = useState([]);
  const [connectionsCountReady, setConnectionsCountReady] = useState(false);

  const [broken, setBroken] = useState(false);

  const [predicateList, setPredicateList] = useState([]);
  const [filteredPredicateList, setFilteredPredicateList] = useState([]);

  function updateSourceId(newSourceId) {
    setSourceId(newSourceId);
    setTargetId(null);
  }

  function updateTargetId(newTargetId) {
    setTargetId(newTargetId);
  }

  function switchSourceTarget() {
    setSourceId(targetId);
    setTargetId(sourceId);
  }

  function reset() {
    setId(null);
    setSourceId(null);
    setTargetId(null);
    setPredicate([]);
    setTargetNodeList([]);
    setConnectionsCountReady(false);
    setBroken(false);
  }

  function updatePredicateList(newPredicateList) {
    setPredicateList(newPredicateList);

    // Reload selected predicates
    // Useful because when predicate is given as a seed
    // it will not have all of the info
    const reloadedPredicates = predicate.map(
      (existingPredicate) => newPredicateList.find((p) => p.name === existingPredicate.name),
    ).filter((v) => !!v);
    setPredicate(reloadedPredicates);
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

  const isValidPredicate = predicate.every((p) => filteredPredicateList.includes(p));

  const isValid = sourceId && targetId && isValidPredicate;

  return {
    id,

    sourceId,
    updateSourceId,
    targetId,
    updateTargetId,

    predicateList,
    updatePredicateList,
    filteredPredicateList,
    setFilteredPredicateList,

    predicate,
    setPredicate,

    isValidPredicate,
    reset,
    initialize,
    targetNodeList,
    isValid,
    switchSourceTarget,
  };
}
