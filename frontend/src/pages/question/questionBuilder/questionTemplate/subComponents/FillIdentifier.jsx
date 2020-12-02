import React, {
  useContext, useState, useCallback,
} from 'react';

import _ from 'lodash';

import {
  Glyphicon,
} from 'react-bootstrap';

import API from '@/API';
import CurieConceptSelector from '@/components/shared/curies/CurieConceptSelector';

import AlertContext from '@/context/alert';

export default function FillIdentifier({
  onSelect, type, focus, clearFocus,
}) {
  const displayAlert = useContext(AlertContext);

  const [curies, updateCuries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const [selection, updateSelection] = useState({ curie: [] });

  async function fetchCuries(newSearchTerm) {
    // Get and update list of curies
    const response = await API.ranker.entityLookup(newSearchTerm);
    if (response.status === 'error' || !_.isArray(response)) {
      displayAlert('error',
        'Failed to contact server to search curies. You will still be able to select generic types. Please try again later');
    } else {
      // Filter out curies based on type
      updateCuries(
        response.filter((c) => c.type.includes(type)),
      );
    }
    setLoading(false);
  }

  // Create a debounced version that persists on renders
  const fetchCuriesDebounced = useCallback(
    _.debounce(fetchCuries, 500),
    [],
  );

  async function updateSearchTerm(value) {
    // Clear existing selection
    updateSelection({ curie: [] });
    // Clear existing curies
    updateCuries([]);
    // Update search term
    setSearchTerm(value);

    setLoading(true);
    fetchCuriesDebounced(value);
  }

  function handleSelect(value) {
    value.curie = [value.curie];
    updateSelection(value);
    setSearchTerm(value.name);
    onSelect(value);
  }

  function rightButtonFunction() {
    updateSelection({ curie: [] });
    updateSearchTerm('');
    onSelect({});
  }

  const rightButtonContents = selection.curie.length > 0 ? (<Glyphicon glyph="remove" />) : (<Glyphicon glyph="triangle-bottom" />);

  return (
    <CurieConceptSelector
      focus={focus}
      clearFocus={clearFocus}
      concepts={[]}
      curies={curies}
      selection={selection}
      handleSelect={handleSelect}
      searchTerm={searchTerm}
      updateSearchTerm={updateSearchTerm}
      rightButtonFunction={rightButtonFunction}
      rightButtonContents={rightButtonContents}
      loading={loading}
    />
  );
}
