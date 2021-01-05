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
import ConceptsContext from '@/context/concepts';
import entityNameDisplay from '@/utils/entityNameDisplay';
import biolinkUtils from '@/utils/biolink';

import CurieConceptSelector from '@/components/shared/curies/CurieConceptSelector';

/**
 * Types coming in from node normalizer are formatted like:
 * 'biolink:Disease' and KGs are going to expect just 'disease' as
 * the node type, so we need to convert the incoming type
 * @param {array} typesToIngest array of strings we want to convert to standard format
 */
function ingestNodeTypes(typesToIngest) {
  let types = typesToIngest;
  if (typeof types === 'string') {
    types = [types];
  }
  types = types.map((type) => {
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
  });
  return types;
}

/**
 * Node Panel
 * @param {Object} panelStore panel custom hook
 */
export default function NodePanel({ panelStore }) {
  const { node } = panelStore;

  const biolink = useContext(BiolinkContext);
  const concepts = useContext(ConceptsContext);

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
    const conceptsFormatted = concepts.map(
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
    if (newSearchTerm.length < 3) {
      node.setLoading(false);
      return;
    }
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
    const normalizationResponse = await API.nodeNormalization.getNormalizedNodesPost({ curies });

    if (normalizationResponse.status === 'error') {
      displayAlert('error',
        'Failed to contact node normalizer to search curies. You will still be able to select generic types. Please try again later');
      node.setLoading(false);
      return;
    }

    // Sometimes the nodeNormalizer returns null responses
    // so we use a filter to remove those
    node.updateCuries(
      Object.values(normalizationResponse).filter((c) => c).map((c) => ({
        name: c.id.label || c.id.identifier,
        type: ingestNodeTypes(c.type),
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
  const rightButtonFunction = showOptions ? node.reset : () => updateSearchTerm(node.searchTerm);
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
        focus
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
