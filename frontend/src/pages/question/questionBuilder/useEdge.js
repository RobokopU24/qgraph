import { useState } from 'react';

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
    // Reload selected predicates from the list
    // Useful because when predicate is given as a seed
    // it will not have all of the info
    //
    const reloadedPredicates = predicate.map(
      (existingPredicate) => newPredicateList.find((p) => p.name === existingPredicate.name),
    ).filter((v) => !!v);
    setPredicateList(newPredicateList);
    setPredicate(reloadedPredicates);
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

  const isValidPredicate = predicate.every((p) => predicateList.includes(p));

  const isValid = sourceId && targetId && isValidPredicate;

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
    isValidPredicate,
    reset,
    initialize,
    targetNodeList,
    isValid,
    switchSourceTarget,
  };
}
