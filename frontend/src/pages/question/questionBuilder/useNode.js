import { useState, useContext } from 'react';

import entityNameDisplay from '@/utils/entityNameDisplay';
import ConceptsContext from '@/context/concepts';

export default function useNodePanels() {
  const [id, setId] = useState(null);
  const [type, setType] = useState('');
  const [name, setName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [curie, setCurie] = useState([]);
  const [set, setSet] = useState(false);
  const [concepts, setConcepts] = useState([]);
  const [filteredConcepts, setFilteredConcepts] = useState([]);
  const [curies, updateCuries] = useState([]);
  const [loading, setLoading] = useState(false);

  const biolinkConcepts = useContext(ConceptsContext);

  function reset() {
    setId(null);
    setType('');
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
    setId(seed.id || null);
    setType(seed.type || '');
    setName(seed.name || seed.type || '');
    setSearchTerm(seed.name || seed.type || '');
    setSet(seed.set || false);
    setCurie(seed.curie || []);
  }

  /*
   * Convert a list of types to a single type
   * by picking the first one in the list (that is not named_thing)
  */
  function conceptListToString(curieTypes) {
    const specificConcepts = biolinkConcepts.filter((t) => t !== 'named_thing');
    const curieType = specificConcepts.find((concept) => curieTypes.includes(concept));
    return curieType || '';
  }

  function select(entry) {
    setSearchTerm(entityNameDisplay(entry.name));
    setName(entityNameDisplay(entry.name));
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

  const isValid = !!id || !!type;

  return {
    name,
    clearSelection,
    updateCuries,
    updateFilteredConcepts,
    setConcepts,
    setLoading,
    setSearchTerm,
    id,
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
