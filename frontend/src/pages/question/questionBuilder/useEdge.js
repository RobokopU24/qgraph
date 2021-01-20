import { useState } from 'react';

export default function useEdgePanels() {
  const [sourceId, setSourceId] = useState(null);
  const [targetId, setTargetId] = useState(null);
  const [predicate, setPredicate] = useState([]);

  const [isValidPredicate, setIsValidPredicate] = useState(false);
  const [isValid, setIsValid] = useState(false);

  function updateSourceId(newSourceId) {
    setSourceId(newSourceId);
    setTargetId(null);
  }

  function updateTargetId(newTargetId) {
    setTargetId(newTargetId);
  }

  function switchSourceTarget() {
    const target = sourceId;
    const source = targetId;
    setSourceId(source);
    setTargetId(target);
    return { source, target };
  }

  function reset() {
    setSourceId(null);
    setTargetId(null);
    setPredicate([]);
  }

  function initialize(seed) {
    reset();
    setSourceId(seed.source_id || null);
    setTargetId(seed.target_id || null);
    if (seed.type) {
      setPredicate(seed.type.map(
        (p_name) => ({ name: p_name }),
      ));
    }
  }

  return {
    sourceId,
    updateSourceId,
    targetId,
    updateTargetId,

    predicate,
    setPredicate,

    isValid,
    setIsValid,
    isValidPredicate,
    setIsValidPredicate,

    reset,
    initialize,
    switchSourceTarget,
  };
}
