import React, {
  useEffect, useRef, useCallback, useContext,
} from 'react';

import {
  FormControl, Button, Badge, InputGroup,
} from 'react-bootstrap';
import shortid from 'shortid';

import { AutoSizer, List } from 'react-virtualized';

import entityNameDisplay from '@/utils/entityNameDisplay';
import getNodeTypeColorMap from '@/utils/colorUtils';
import curieUrls from '@/utils/curieUrls';

export default function CurieConceptSelector({
  concepts,
  curies,
  selection, handleSelect,
  searchTerm, updateSearchTerm,
  loading,
  rightButtonFunction, rightButtonContents,
}) {
  const input = useRef(null);

  function rowRenderer({
    index,
    key,
    style,
  }) {
    const isConcept = index < concepts.length;
    let name = '';
    let entry = {};
    let degree;
    let links = '';
    let curie = '';
    let type = '';
    let colorStripes = [];
    let typeColor = '';
    if (isConcept) {
      name = concepts[index].name;
      entry = concepts[index];
      ({ type } = concepts[index]); // this is a string
      const typeColorMap = getNodeTypeColorMap();
      typeColor = typeColorMap(type);
    } else {
      const i = index - concepts.length;
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
        id={index === concepts.length - 1 && curies.length > 0 ? 'lastConcept' : ''}
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

  const nRows = concepts.length + curies.length;
  const showOptions = searchTerm && !selection.type;
  const isEmpty = nRows === 0;

  const rowHeight = 50;
  const height = Math.min(rowHeight * nRows, 225);

  return (
    <>
      <div id="nodeSelectorContainer">
        <InputGroup>
          <FormControl
            type="text"
            className="curieSelectorInput"
            placeholder="Start typing to search."
            value={searchTerm}
            inputRef={(ref) => { input.current = ref; }}
            onChange={(e) => updateSearchTerm(e.target.value)}
          />
          {!showOptions && selection.curie.length > 0 && (
            <InputGroup.Addon>
              {selection.curie[0]}
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
            {!isEmpty && !loading ? (
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
                  {loading ? 'Loading...' : 'No results found.'}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
