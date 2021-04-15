import { useState, useContext } from 'react';

import strings from '~/utils/strings';
import BiolinkContext from '~/context/biolink';

export default function useNodePanels() {
  const [category, setCategory] = useState('');
  const [name, setName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [id, setId] = useState([]);
  const [is_set, setSet] = useState(false);
  const [concepts, setConcepts] = useState([]);
  const [filteredConcepts, setFilteredConcepts] = useState([]);
  const [ids, updateIDs] = useState([]);
  const [loading, setLoading] = useState(false);

  const { concepts: biolinkConcepts } = useContext(BiolinkContext);

  function reset() {
    setCategory('');
    setName('');
    setSearchTerm('');
    setId([]);
    setSet(false);
    setFilteredConcepts([]);
    updateIDs([]);
    setLoading(false);
  }

  function initialize(seed) {
    reset();
    setCategory(seed.category || '');
    setName(seed.name || strings.displayCategory(seed.category) || '');
    setSearchTerm(seed.name || strings.displayCategory(seed.category) || '');
    setSet(seed.is_set || false);
    setId(seed.id || []);
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
    if (entry.id) {
      setId([entry.id]);
    }
    if (entry.is_set) {
      setSet(true);
    }
    setCategory(conceptListToString(entry.category));
  }

  function clearSelection() {
    setCategory('');
    setName('');
    setSet(false);
    setId([]);
  }

  function updateFilteredConcepts(value) {
    // Convert name to lowercase before searching
    const newFilteredConcepts = concepts
      .filter(
        (concept) => concept.name.toLowerCase().includes(value.toLowerCase()),
      );
    setFilteredConcepts(newFilteredConcepts);
  }

  const isValid = !!category || !!id.length;

  return {
    name,
    clearSelection,
    updateIDs,
    updateFilteredConcepts,
    setConcepts,
    setLoading,
    setSearchTerm,
    filteredConcepts,
    id,
    ids,
    searchTerm,
    category,
    is_set,
    initialize,
    reset,
    select,
    loading,
    isValid,
  };
}
