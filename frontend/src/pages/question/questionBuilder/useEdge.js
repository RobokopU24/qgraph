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

  /**
   * Switch edge subject and object properties
   */
  function switchSubjectObject() {
    const newObject = subject;
    const newSubject = object;
    setSubject(newSubject);
    setObject(newObject);
    setPredicate([]);
    return { newSubject, newObject };
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
    switchSubjectObject,
  };
}
