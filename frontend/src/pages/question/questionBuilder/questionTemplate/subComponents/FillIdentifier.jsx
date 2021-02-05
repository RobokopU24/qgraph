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
  onSelect, category,
}) {
  const displayAlert = useContext(AlertContext);

  const [ids, updateIDs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const [selection, updateSelection] = useState({ id: [] });

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
    const newIDs = Object.values(normalizationResponse).filter((c) => c).map((c) => ({
      name: c.id.label || c.id.identifier,
      category: c.type,
      id: c.id.identifier,
    })).filter((c) => c.category.includes(category));
    // Filter out curies based on category
    updateIDs(newIDs);
    setLoading(false);
  }

  // Create a debounced version that persists on renders
  const fetchCuriesDebounced = useCallback(
    _.debounce(fetchCuries, 500),
    [],
  );

  async function updateSearchTerm(value) {
    // Clear existing selection
    updateSelection({ id: [] });
    // Clear existing curies
    updateIDs([]);
    // Update search term
    setSearchTerm(value);

    setLoading(true);
    fetchCuriesDebounced(value);
  }

  function handleSelect(value) {
    value.id = [value.id];
    updateSelection(value);
    setSearchTerm(value.name);
    onSelect(value);
  }

  function clearSelection() {
    updateSelection({ id: [] });
    updateSearchTerm('');
    onSelect({});
  }

  const rightButtonContents = searchTerm && selection.id.length === 0 ? (<Glyphicon glyph="remove" />) : (<Glyphicon glyph="triangle-bottom" />);
  const rightButtonFunction = searchTerm && selection.id.length === 0 ? clearSelection : () => updateSearchTerm(searchTerm);

  return (
    <CurieConceptSelector
      concepts={[]}
      ids={ids}
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
