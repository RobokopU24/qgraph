import React, {
  useEffect, useRef, useCallback, useContext,
} from 'react';

import {
  Glyphicon,
} from 'react-bootstrap';

import _ from 'lodash';

import AlertContext from '@/context/alert';
import API from '@/API';

import BiolinkContext from '@/context/biolink';
import entityNameDisplay from '@/utils/entityNameDisplay';
import biolinkUtils from '@/utils/biolink';

import CurieConceptSelector from '@/components/shared/curies/CurieConceptSelector';

/**
 * Node Panel
 * @param {Object} panelStore panel custom hook
 */
export default function NodePanel({ panelStore }) {
  const { node } = panelStore;

  const biolink = useContext(BiolinkContext);

  const displayAlert = useContext(AlertContext);

  function handleSelect(entry) {
    panelStore.toggleUnsavedChanges(true);
    panelStore.node.select(entry);
  }

  function updateConceptList() {
    const setify = (name) => `Set of ${name}s`;

    if (!biolink) {
      return;
    }
    const validConcepts = biolinkUtils.getValidConcepts(biolink);
    const conceptsFormatted = Object.keys(validConcepts).map(
      (identifier) => ({
        type: biolinkUtils.snakeCase(identifier),
        name: entityNameDisplay(identifier),
        set: false,
      }),
    );
    const conceptsSetified = conceptsFormatted.map((c) => ({
      ...c,
      name: setify(c.name),
      set: true,
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
  useEffect(() => { updateConceptList(); }, [biolink]);

  async function fetchCuries(newSearchTerm) {
    // Get and update list of curies
    const response = await API.ranker.entityLookup(newSearchTerm);
    if (response.status === 'error' || !_.isArray(response)) {
      displayAlert('error',
        'Failed to contact server to search curies. You will still be able to select generic types. Please try again later');
    } else {
      node.updateCuries(response);
    }
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
    node.updateCuries([]);
    // Update list of concepts
    node.updateFilteredConcepts(value);
    // Update search term
    node.setSearchTerm(value);

    node.setLoading(true);
    fetchCuriesDebounced(value);
  }

  const showOptions = node.searchTerm && !node.type;
  const showConstraints = node.regular || node.set;
  const rightButtonContents = showOptions ? (<Glyphicon glyph="remove" />) : (<Glyphicon glyph="triangle-bottom" />);
  const rightButtonFunction = showOptions ? node.reset : node.reSearch;
  return (
    <>
      <h4 style={{ color: '#CCCCCC' }}>NODE TYPE</h4>
      <CurieConceptSelector
        concepts={node.filteredConcepts}
        curies={node.curies}
        selection={node}
        handleSelect={handleSelect}
        searchTerm={node.searchTerm}
        updateSearchTerm={updateSearchTerm}
        rightButtonFunction={rightButtonFunction}
        rightButtonContents={rightButtonContents}
        loading={node.loading}
      />
      {/* {showConstraints && (
        <>
          {store.nodePropertyList[nodePanelState.type] && store.nodePropertyList[nodePanelState.type].length > 0 ? (
            <NodeProperties activePanel={nodePanelState} validProperties={store.nodePropertyList} />
          ) : (
            <p
              style={{
                position: 'absolute', bottom: 0, width: '100%', textAlign: 'center',
              }}
            >
              No constraints available for this type.
            </p>
          )}
        </>
      )} */}
    </>
  );
}
