import { useState, useContext } from 'react';

import strings from '@/utils/stringUtils';
import BiolinkContext from '@/context/biolink';

export default function useNodePanels() {
  const [type, setType] = useState('');
  const [label, setLabel] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [curie, setCurie] = useState([]);
  const [set, setSet] = useState(false);
  const [concepts, setConcepts] = useState([]);
  const [filteredConcepts, setFilteredConcepts] = useState([]);
  const [curies, updateCuries] = useState([]);
  const [loading, setLoading] = useState(false);

  const { concepts: biolinkConcepts } = useContext(BiolinkContext);

  function reset() {
    setType('');
    setLabel('');
    setSearchTerm('');
    setCurie([]);
    setSet(false);
    setFilteredConcepts([]);
    updateCuries([]);
    setLoading(false);
  }

  function initialize(seed) {
    reset();
    setType(seed.type || '');
    setLabel(seed.label || strings.displayType(seed.type) || '');
    setSearchTerm(seed.label || strings.displayType(seed.type) || '');
    setSet(seed.set || false);
    setCurie(seed.curie || []);
  }

  /**
   * Convert a list of types to a single type
   * by picking the first one in the list
   * @param {array} curieTypes array of types for picked node
   * @returns {string} single type string
   */
  function conceptListToString(curieTypes) {
    let curieType = strings.toArray(curieTypes);
    // Use the first type in the list of types of the node
    curieType = curieType.find((concept) => biolinkConcepts.includes(concept));
    return curieType || '';
  }

  function select(entry) {
    setSearchTerm(entry.label);
    setLabel(entry.label);
    if (entry.curie) {
      setCurie([entry.curie]);
    }
    if (entry.set) {
      setSet(true);
    }
    setType(conceptListToString(entry.type));
  }

  function clearSelection() {
    setType('');
    setLabel('');
    setSet(false);
    setCurie([]);
  }

  function updateFilteredConcepts(value) {
    // Convert name to lowercase before searching
    const newFilteredConcepts = concepts
      .filter(
        (concept) => concept.label.toLowerCase().includes(value.toLowerCase()),
      );
    setFilteredConcepts(newFilteredConcepts);
  }

  const isValid = !!type || !!curie.length;

  return {
    label,
    clearSelection,
    updateCuries,
    updateFilteredConcepts,
    setConcepts,
    setLoading,
    setSearchTerm,
    filteredConcepts,
    curie,
    curies,
    searchTerm,
    type,
    set,
    initialize,
    reset,
    select,
    loading,
    isValid,
  };
}
