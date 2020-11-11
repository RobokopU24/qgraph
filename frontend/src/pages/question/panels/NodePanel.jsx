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

  const inputRef = useRef(null);

  // Focus selector text box on load
  useEffect(() => {
    inputRef.current.focus();
  });

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
    // Get list of curies that match this search term
    const response = await API.nameResolver.entityLookup(newSearchTerm, 1000);
    if (response.status === 'error') {
      displayAlert('error',
        'Failed to contact name resolver to search curies. You will still be able to select generic types. Please try again later');
      node.setLoading(false);
      return;
    }
    const curies = Object.keys(response);

    // Pass curies to nodeNormalizer to get type information and
    // a better curie identifier
    //
    // Right now curies are in the URL so we need to split it so we don't
    // hit maximum URL length of the server

    // Based on experimentation, the max URL length is around 7000 characters
    // Higher values are faster, so we want to set this as high as possible
    const maxUrlLength = 7000;

    // Iterate over each curie chunking based on the length that the URL will be
    const curiesChunked = [[]];
    curies.forEach((c) => {
      const existingArray = curiesChunked[curiesChunked.length - 1];
      const existingLength = existingArray.join('&curie=').length;
      const newLength = existingLength + c.length + '&curie='.length;
      if (newLength < maxUrlLength) {
        existingArray.push(c);
      } else {
        curiesChunked.push([c]);
      }
    });

    const normalizationAPICallResponses = await Promise.all(
      curiesChunked.map((cs) => API.nodeNormalization.getNormalizedNodes(cs)),
    );

    // Fail if there are any errors
    const nodeNormalizerError = normalizationAPICallResponses.find(
      (r) => !_.isObject(r) || r.status === 'error',
    );

    if (nodeNormalizerError) {
      displayAlert('error',
        'Failed to contact node normalizer to search curies. You will still be able to select generic types. Please try again later');
      node.setLoading(false);
      return;
    }

    const curiesWithInfo = {};
    normalizationAPICallResponses.forEach((r) => Object.assign(curiesWithInfo, r));

    // Sometimes the nodeNormalizer returns null responses
    // so we use a filter to remove those
    node.updateCuries(
      Object.values(curiesWithInfo).filter((c) => c).map((c) => ({
        name: c.id.label || c.id.identifier,
        type: c.type[0],
        curie: c.id.identifier,
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
    node.updateCuries([]);
    // Update list of concepts
    node.updateFilteredConcepts(value);
    // Update search term
    node.setSearchTerm(value);

    node.setLoading(true);
    fetchCuriesDebounced(value);
  }

  const showOptions = node.searchTerm && !node.type;
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
        ref={inputRef}
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
