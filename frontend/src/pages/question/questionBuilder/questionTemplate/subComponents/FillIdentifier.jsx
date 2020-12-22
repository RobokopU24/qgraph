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

/**
 * Types coming in from node normalizer are formatted like:
 * 'biolink:Disease' and KGs are going to expect just 'disease' as
 * the node type, so we need to convert the incoming type
 * @param {string} type string we want to convert to standard format
 */
function ingestNodeType(type) {
  let normalizedType = type;
  if (type.indexOf(':') > -1) {
    [, normalizedType] = type.split(':'); // grab the second item, the type
    const splitRegex = new RegExp(/(?<=[a-z])[A-Z]|[A-Z](?=[a-z])/g);
    const splitByCapital = normalizedType.replaceAll(splitRegex, (match, ind) => {
      if (ind !== 0) {
        return `_${match.toLowerCase()}`;
      }
      return match.toLowerCase();
    });
    normalizedType = splitByCapital;
  }
  return normalizedType;
}

export default function FillIdentifier({
  onSelect, type, focus, clearFocus,
}) {
  const displayAlert = useContext(AlertContext);

  const [curies, updateCuries] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const [selection, updateSelection] = useState({ curie: [] });

  async function fetchCuries(newSearchTerm) {
    // Get list of curies that match this search term
    const response = await API.nameResolver.entityLookup(newSearchTerm, 1000);
    if (response.status === 'error') {
      displayAlert('error',
        'Failed to contact name resolver to search curies. Please try again later.');
      updateCuries([]);
      setLoading(false);
      return;
    }
    const curieResponse = Object.keys(response);

    // Pass curies to nodeNormalizer to get type information and
    // a better curie identifier
    const normalizationResponse = await API.nodeNormalization.getNormalizedNodesPost({ curies: curieResponse });

    if (normalizationResponse.status === 'error') {
      displayAlert('error',
        'Failed to contact node normalizer to search curies. Please try again later.');
      updateCuries([]);
      setLoading(false);
      return;
    }

    // Sometimes the nodeNormalizer returns null responses
    // so we use a filter to remove those
    const newCuries = Object.values(normalizationResponse).filter((c) => c).map((c) => ({
      name: c.id.label || c.id.identifier,
      type: ingestNodeType(c.type[0]),
      curie: c.id.identifier,
    })).filter((c) => c.type.includes(type));
    // Filter out curies based on type
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
    setSearchTerm(value.name);
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
