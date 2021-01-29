import { useState } from 'react';

export default function useEdgePanels() {
  const [subject, setSubject] = useState(null);
  const [object, setObject] = useState(null);
  const [predicate, setPredicate] = useState([]);

  const [isValidPredicate, setIsValidPredicate] = useState(false);
  const [isValid, setIsValid] = useState(false);

  function updateSubject(newSubject) {
    setSubject(newSubject);
    setObject(null);
  }

  function updateObject(newObject) {
    setObject(newObject);
  }

  function switchSourceTarget() {
    const target = subject;
    const source = object;
    setSubject(source);
    setObject(target);
    setPredicate([]);
    return { source, target };
  }

  function reset() {
    setSubject(null);
    setObject(null);
    setPredicate([]);
  }

  function initialize(seed) {
    reset();
    setSubject(seed.subject || null);
    setObject(seed.object || null);
    if (seed.predicate) {
      if (!Array.isArray(seed.predicate)) {
        seed.predicate = [seed.predicate];
      }
      setPredicate(seed.predicate);
    } else {
      setPredicate([]);
    }
  }

  return {
    subject,
    updateSubject,
    object,
    updateObject,

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
