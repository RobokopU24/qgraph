import { useState, useContext } from 'react';

import strings from '@/utils/stringUtils';
import BiolinkContext from '@/context/biolink';

export default function useNodePanels() {
  const [category, setCategory] = useState('');
  const [name, setName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [curie, setCurie] = useState([]);
  const [set, setSet] = useState(false);
  const [concepts, setConcepts] = useState([]);
  const [filteredConcepts, setFilteredConcepts] = useState([]);
  const [curies, updateCuries] = useState([]);
  const [loading, setLoading] = useState(false);

  const { concepts: biolinkConcepts } = useContext(BiolinkContext);

  function reset() {
    setCategory('');
    setName('');
    setSearchTerm('');
    setCurie([]);
    setSet(false);
    setFilteredConcepts([]);
    updateCuries([]);
    setLoading(false);
  }

  function initialize(seed) {
    reset();
    setCategory(seed.category || '');
    setName(seed.name || strings.displayCategory(seed.category) || '');
    setSearchTerm(seed.name || strings.displayCategory(seed.category) || '');
    setSet(seed.set || false);
    setCurie(seed.curie || []);
  }

  /**
   * Convert a list of categories to a single category
   * by picking the first one in the list
   * @param {array} curieCategories array of categories for picked node
   * @returns {string} single category string
   */
  function conceptListToString(curieCategories) {
    let curieCategory = strings.toArray(curieCategories);
    // Use the first category in the list of categories of the node
    curieCategory = curieCategory.find((concept) => biolinkConcepts.includes(concept));
    return curieCategory || '';
  }

  function select(entry) {
    setSearchTerm(entry.name);
    setName(entry.name);
    if (entry.curie) {
      setCurie([entry.curie]);
    }
    if (entry.set) {
      setSet(true);
    }
    setCategory(conceptListToString(entry.category));
  }

  function clearSelection() {
    setCategory('');
    setName('');
    setSet(false);
    setCurie([]);
  }

  function updateFilteredConcepts(value) {
    // Convert name to lowercase before searching
    const newFilteredConcepts = concepts
      .filter(
        (concept) => concept.name.toLowerCase().includes(value.toLowerCase()),
      );
    setFilteredConcepts(newFilteredConcepts);
  }

  const isValid = !!category || !!curie.length;

  return {
    name,
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
    category,
    set,
    initialize,
    reset,
    select,
    loading,
    isValid,
  };
}
