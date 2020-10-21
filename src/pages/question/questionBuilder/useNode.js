import { useState } from 'react';

import _ from 'lodash';

import config from '@/config.json';
import entityNameDisplay from '@/utils/entityNameDisplay';

const setify = (type) => `set of ${type}s`;
const conceptsWithSets = [];
config.concepts.forEach((concept) => {
  conceptsWithSets.push({ name: concept, type: concept, set: false });
  conceptsWithSets.push({ name: setify(concept), type: concept, set: true });
});

export default function useNodePanels() {
  const [id, setId] = useState(null);
  const [type, setType] = useState('');
  const [name, setName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [curie, setCurie] = useState([]);
  const [properties, setProperties] = useState([]);
  const [curieEnabled, setCurieEnabled] = useState(false);
  const [set, setSet] = useState(false);
  const [regular, setRegular] = useState(false);
  // const [conceptsWithSets, setConceptsWithSets] = useState([]);
  const [filteredConcepts, setFilteredConcepts] = useState([]);
  const [curies, updateCuries] = useState([]);
  const [loading, setLoading] = useState(false);

  function reset() {
    setId(null);
    setType('');
    setName('');
    setSearchTerm('');
    setCurie([]);
    setProperties([]);
    setCurieEnabled(false);
    setSet(false);
    setRegular(false);
    // setConceptsWithSets([]);
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
    const specificConcepts = config.concepts.filter((t) => t !== 'named_thing');
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
    setCurie([]);
  }

  function updateFilteredConcepts(value) {
    const newFilteredConcepts = conceptsWithSets.filter(
      (concept) => concept.name.includes(value.toLowerCase()),
    );
    setFilteredConcepts(newFilteredConcepts);
  }

  const isValid = !!id || !!type;

  return {
    name,
    clearSelection,
    updateCuries,
    updateFilteredConcepts,
    setLoading,
    setSearchTerm,
    id,
    filteredConcepts,
    curie,
    curies,
    searchTerm,
    type,
    regular,
    set,
    initialize,
    reset,
    select,
    loading,
    isValid,
  };
}
