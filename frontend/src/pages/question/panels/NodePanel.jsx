import React, {
  useEffect, useCallback, useContext,
} from 'react';

import {
  Glyphicon,
} from 'react-bootstrap';

import _ from 'lodash';

import AlertContext from '@/context/alert';
import API from '@/API';

import BiolinkContext from '@/context/biolink';
import strings from '@/utils/stringUtils';

import CurieConceptSelector from '@/components/shared/curies/CurieConceptSelector';

/**
 * Node Panel
 * @param {Object} panelStore panel custom hook
 */
export default function NodePanel({ panelStore }) {
  const { node } = panelStore;

  const { concepts } = useContext(BiolinkContext);

  const displayAlert = useContext(AlertContext);

  function handleSelect(entry) {
    panelStore.toggleUnsavedChanges(true);
    panelStore.node.select(entry);
  }

  function updateConceptList() {
    const setify = (name) => `Set of ${name}s`;

    const conceptsFormatted = concepts.map(
      (identifier) => ({
        category: identifier,
        name: strings.displayCategory(identifier),
        is_set: false,
      }),
    );
    const conceptsSetified = conceptsFormatted.map((c) => ({
      ...c,
      name: setify(c.name),
      is_set: true,
    }));

    // Merge concepts with sets interleaved
    // so that they show up in the list in the
    // right order
    const combinedConcepts = conceptsFormatted.map(
      (c, i) => [c, conceptsSetified[i]],
    ).flat();

    node.setConcepts(combinedConcepts);
  }
  // When node panel mounts get concepts
  useEffect(() => { updateConceptList(); }, [concepts]);

  async function fetchCuries(newSearchTerm) {
    // search term needs to be at least 3 characters before we lookup
    if (newSearchTerm.length < 3) {
      node.setLoading(false);
      return;
    }
    // if search term has a colon, the user is inputing a specific id
    if (newSearchTerm.includes(':')) {
      node.updateIDs([{
        name: newSearchTerm,
        category: '',
        id: newSearchTerm,
      }]);
      node.setLoading(false);
      return;
    }
    // Get list of curies that match this search term
    const response = await API.nameResolver.entityLookup(newSearchTerm, 1000);
    if (response.status === 'error') {
      displayAlert('error',
        'Failed to contact name resolver to search curies. You will still be able to select generic categories. Please try again later');
      node.setLoading(false);
      return;
    }
    const curies = Object.keys(response);

    // If we didn't get anything back from name resolver
    if (!curies.length) {
      node.setLoading(false);
      return;
    }

    // Pass curies to nodeNormalizer to get category information and
    // a better curie identifier
    const normalizationResponse = await API.nodeNormalization.getNormalizedNodesPost({ curies });

    if (normalizationResponse.status === 'error') {
      displayAlert('error',
        'Failed to contact node normalizer to search curies. You will still be able to select generic categories. Please try again later');
      node.setLoading(false);
      return;
    }

    // Sometimes the nodeNormalizer returns null responses
    // so we use a filter to remove those
    node.updateIDs(
      Object.values(normalizationResponse).filter((c) => c).map((c) => ({
        name: strings.prettyDisplay(c.id.label) || c.id.identifier,
        category: c.type,
        id: c.id.identifier,
      })),
    );
    node.setLoading(false);
  }

  // Create a debounced version that persists on renders
  const fetchCuriesDebounced = useCallback(
    _.debounce(fetchCuries, 500),
    [],
  );

  async function updateSearchTerm(value) {
    // Clear existing selection
    node.clearSelection();
    // Clear existing curies
    node.updateIDs([]);
    // Update list of concepts
    node.updateFilteredConcepts(value);
    // Update search term
    node.setSearchTerm(value);

    node.setLoading(true);
    fetchCuriesDebounced(value);
  }

  const showOptions = node.searchTerm && !node.category;
  const rightButtonContents = showOptions ? (<Glyphicon glyph="remove" />) : (<Glyphicon glyph="triangle-bottom" />);
  const rightButtonFunction = showOptions ? node.reset : () => updateSearchTerm(node.searchTerm);
  return (
    <>
      <h4 style={{ color: '#CCCCCC' }}>NODE CATEGORY</h4>
      <CurieConceptSelector
        concepts={node.filteredConcepts}
        ids={node.ids}
        selection={node}
        handleSelect={handleSelect}
        searchTerm={node.searchTerm}
        updateSearchTerm={updateSearchTerm}
        rightButtonFunction={rightButtonFunction}
        rightButtonContents={rightButtonContents}
        loading={node.loading}
        focus
      />
      {/* {showConstraints && (
        <>
          {store.nodePropertyList[nodePanelState.category] && store.nodePropertyList[nodePanelState.category].length > 0 ? (
            <NodeProperties activePanel={nodePanelState} validProperties={store.nodePropertyList} />
          ) : (
            <p
              style={{
                position: 'absolute', bottom: 0, width: '100%', textAlign: 'center',
              }}
            >
              No constraints available for this category.
            </p>
          )}
        </>
      )} */}
    </>
  );
}
