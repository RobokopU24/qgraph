import React, {
  useContext, useState, useCallback,
} from 'react';
import _ from 'lodash';
import {
  Glyphicon,
} from 'react-bootstrap';

import API from '@/API';
import AlertContext from '@/context/alert';
import CurieConceptSelector from '@/components/shared/curies/CurieConceptSelector';

export default function FillIdentifier({
  onSelect, category, focus, clearFocus,
}) {
  const displayAlert = useContext(AlertContext);

  const [curies, updateCuries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const [selection, updateSelection] = useState({ curie: [] });

  async function fetchCuries(newSearchTerm) {
    if (newSearchTerm.length < 3) {
      setLoading(false);
      return;
    }
    // Get list of curies that match this search term
    const response = await API.nameResolver.entityLookup(newSearchTerm, 1000);
    if (response.status === 'error') {
      displayAlert('error',
        'Failed to contact name resolver to search curies. Please try again later.');
      setLoading(false);
      return;
    }
    const curieResponse = Object.keys(response);

    // Pass curies to nodeNormalizer to get category information and
    // a better curie identifier
    const normalizationResponse = await API.nodeNormalization.getNormalizedNodesPost({ curies: curieResponse });

    if (normalizationResponse.status === 'error') {
      displayAlert('error',
        'Failed to contact node normalizer to search curies. Please try again later.');
      setLoading(false);
      return;
    }

    // Sometimes the nodeNormalizer returns null responses
    // so we use a filter to remove those
    const newCuries = Object.values(normalizationResponse).filter((c) => c).map((c) => ({
      label: c.id.label || c.id.identifier,
      category: c.category,
      curie: c.id.identifier,
    })).filter((c) => c.category.includes(category));
    // Filter out curies based on category
    updateCuries(newCuries);
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
    setSearchTerm(value.label);
    onSelect(value);
  }

  function clearSelection() {
    updateSelection({ curie: [] });
    updateSearchTerm('');
    onSelect({});
  }

  const rightButtonContents = searchTerm && selection.curie.length === 0 ? (<Glyphicon glyph="remove" />) : (<Glyphicon glyph="triangle-bottom" />);
  const rightButtonFunction = searchTerm && selection.curie.length === 0 ? clearSelection : () => updateSearchTerm(searchTerm);

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
