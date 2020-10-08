import { useState } from 'react';
import _ from 'lodash';

import API from '@/API';

import entityNameDisplay from '../../../utils/entityNameDisplay';
import config from '../../../config.json';

const setify = (type) => `set of ${type}s`;
const conceptsWithSets = [];
config.concepts.forEach((concept) => {
  conceptsWithSets.push({ label: concept, type: concept, set: false });
  conceptsWithSets.push({ label: setify(concept), type: concept, set: true });
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
  const [conceptsWithSets, setConceptsWithSets] = useState([]);
  const [filteredConcepts, updateFilteredConcepts] = useState([]);
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
    setConceptsWithSets([]);
    updateFilteredConcepts([]);
    updateCuries([]);
    setLoading(false);
  }

  function initialize(seed) {
    reset();
    console.log('seed', seed);
    setId(seed.id || null);
    setType(seed.type || '');
    setName(seed.name || seed.type || '');
    setSearchTerm(seed.name || seed.type || '');
    setSet(seed.set || false);
    setCurie(seed.curie || []);
  }

  function select(entry) {
    setSearchTerm(entityNameDisplay(entry.curie));
    const mostGenericType = entry.type.find((t) => t !== 'named_thing');
    setType(mostGenericType);
  }

  async function updateSearchTerm(value) {
    updateFilteredConcepts([]);
    updateCuries([]);
    setLoading(true);
    setSearchTerm(value);

    if (curie.length) {
      setCurie([]);
    }
    if (type) {
      setType('');
    }

    const response = await API.ranker.entityLookup(value);
    await new Promise((r) => setTimeout(r, 2000));
    updateCuries(response);
    setLoading(false);
  }

  return {
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
    updateSearchTerm,
    loading,
  };
}
