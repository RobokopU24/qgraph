import React, {
  useEffect, useRef, useCallback, useContext
} from 'react';
import {
  FormControl, Button, Badge, InputGroup, Glyphicon,
} from 'react-bootstrap';

import _ from 'lodash';

import { AutoSizer, List } from 'react-virtualized';
import shortid from 'shortid';

import AlertContext from '@/context/alert';
import API from '@/API';

import entityNameDisplay from '@/utils/entityNameDisplay';
import curieUrls from '@/utils/curieUrls';
import biolinkUtils from '@/utils/biolink';
import getNodeTypeColorMap from '../../../utils/colorUtils';
import NodeProperties from './NodeProperties';

/**
 * Node Panel
 * @param {Object} panelStore panel custom hook
 */
export default function NodePanel({ panelStore, biolink }) {
  const input = useRef(null);
  const { node } = panelStore;

  const displayAlert = useContext(AlertContext);

  useEffect(() => {
    input.current.focus();
  }, []);

  function handleSelect(entry) {
    panelStore.toggleUnsavedChanges(true);
    panelStore.node.select(entry);
  }

  function rowRenderer({
    index,
    key,
    style,
  }) {
    const { filteredConcepts, curies } = node;
    const isConcept = index < filteredConcepts.length;
    let name = '';
    let entry = {};
    let degree;
    let links = '';
    let curie = '';
    let type = '';
    let colorStripes = [];
    let typeColor = '';
    if (isConcept) {
      name = filteredConcepts[index].name;
      entry = filteredConcepts[index];
      ({ type } = filteredConcepts[index]); // this is a string
      const typeColorMap = getNodeTypeColorMap();
      typeColor = typeColorMap(type);
    } else {
      const i = index - filteredConcepts.length;
      entry = curies[i];

      ({
        degree, type, name, curie,
      } = entry);
      const urls = curieUrls(curie);
      links = (
        <span>
          {urls.map((u) => (
            <a target="_blank" rel="noreferrer" href={u.url} alt={u.name} key={shortid.generate()} style={{ paddingRight: '3px' }}><img src={u.iconUrl} alt={u.name} height={16} width={16} /></a>
          ))}
        </span>
      );
      if (Array.isArray(type)) {
        type = type.filter((t) => t !== 'named_thing');
        const typeColorMap = getNodeTypeColorMap(type);
        colorStripes = type.map((t) => (
          <div
            title={t}
            style={{
              backgroundColor: typeColorMap(t),
              height: '100%',
              width: '5px',
            }}
            key={shortid.generate()}
          />
        ));
      }
    }

    const fullColor = typeof type === 'string';

    return (
      <div
        key={key}
        style={{ ...style, backgroundColor: typeColor }}
        className="nodePanelSelector"
        id={index === filteredConcepts.length - 1 && curies.length > 0 ? 'lastConcept' : ''}
      >
        {!fullColor && (
          <div className="colorStripesContainer">
            {colorStripes}
          </div>
        )}
        <div className="curieName">
          <div title={entityNameDisplay(name)}>{entityNameDisplay(name)}</div>
        </div>
        <div className="curieDetails">
          {curie}
          <Badge>{degree}</Badge>
          {links}
          <Button
            onClick={() => handleSelect(entry)}
          >
            Select
          </Button>
        </div>
      </div>
    );
  }

  function updateConceptList() {
    const spacesToSnakeCase = (str) => str.replaceAll(' ', '_').toLowerCase();
    const setify = (name) => `Set of ${name}s`;

    if (!biolink) {
      return;
    }
    const validConcepts = biolinkUtils.getValidConcepts(biolink);
    const conceptsFormatted = Object.keys(validConcepts).map(
      (identifier) => ({
        type: spacesToSnakeCase(identifier),
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
      (c, i) => [c, conceptsSetified[i]] ).flat();

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
  const rowHeight = 50;
  const nRows = node.filteredConcepts.length + node.curies.length;
  const isEmpty = nRows === 0;
  const height = Math.min(rowHeight * nRows, 225);
  return (
    <>
      <h4 style={{ color: '#CCCCCC' }}>NODE TYPE</h4>
      <div id="nodeSelectorContainer">
        <InputGroup>
          <FormControl
            type="text"
            className="curieSelectorInput"
            placeholder="Start typing to search."
            value={node.searchTerm}
            inputRef={(ref) => { input.current = ref; }}
            onChange={(e) => updateSearchTerm(e.target.value)}
          />
          {!showOptions && node.curie.length > 0 && (
            <InputGroup.Addon>
              {node.curie[0]}
            </InputGroup.Addon>
          )}
          <InputGroup.Addon
            onClick={rightButtonFunction}
            style={{ background: '#fff', cursor: 'pointer' }}
          >
            {rightButtonContents}
          </InputGroup.Addon>
        </InputGroup>
        {showOptions && (
          <div style={{ margin: '0px 10px' }}>
            {!isEmpty && !node.loading ? (
              <AutoSizer disableHeight defaultWidth={100}>
                {({ width }) => (
                  <List
                    style={{
                      border: 'none',
                      marginTop: '0px',
                      outline: 'none',
                    }}
                    height={height}
                    overscanRowCount={10}
                    rowCount={nRows}
                    rowHeight={rowHeight}
                    rowRenderer={rowRenderer}
                    width={width}
                  />
                )}
              </AutoSizer>
            ) : (
              <div
                className="nodePanelSelector"
                style={{ padding: '10px', color: '#ccc' }}
              >
                <span>
                  {node.loading ? 'Loading...' : 'No results found.'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
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