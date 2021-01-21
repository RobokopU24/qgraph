import { useState } from 'react';

import strings from '@/utils/stringUtils';

export default function useEdgePanels() {
  const [sourceId, setSourceId] = useState(null);
  const [targetId, setTargetId] = useState(null);
  const [type, setType] = useState([]);

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
    setType([]);
    return { source, target };
  }

  function reset() {
    setSourceId(null);
    setTargetId(null);
    setType([]);
  }

  function initialize(seed) {
    reset();
    setSourceId(seed.source_id || null);
    setTargetId(seed.target_id || null);
    if (seed.type) {
      if (!Array.isArray(seed.type)) {
        seed.type = [seed.type];
      }
      setType(seed.type.map(
        (t) => (
          {
            label: t.label || strings.displayPredicate(t),
            type: t,
          }
        ),
      ));
    } else {
      setType([]);
    }
  }

  return {
    sourceId,
    updateSourceId,
    targetId,
    updateTargetId,

    type,
    setType,

    isValid,
    setIsValid,
    isValidPredicate,
    setIsValidPredicate,

    reset,
    initialize,
    switchSourceTarget,
  };
}
