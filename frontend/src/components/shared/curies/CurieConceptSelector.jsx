import React, { useEffect, useRef } from 'react';

import {
  FormControl, Button, Badge, InputGroup,
} from 'react-bootstrap';
import shortid from 'shortid';

import { AutoSizer, List } from 'react-virtualized';

import getNodeCategoryColorMap from '@/utils/colorUtils';
import curieUrls from '@/utils/curieUrls';

export default function CurieConceptSelector({
  concepts,
  ids,
  selection, handleSelect,
  searchTerm, updateSearchTerm,
  loading,
  rightButtonFunction, rightButtonContents,
  focus,
}) {
  const inputRef = useRef();

  useEffect(() => {
    if (focus) {
      inputRef.current.focus();
    }
  }, []);

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
    let id = '';
    let category = '';
    let colorStripes = [];
    let categoryColor = '';
    if (isConcept) {
      name = concepts[index].name;
      entry = concepts[index];
      ({ category } = concepts[index]); // this is a string
      const categoryColorMap = getNodeCategoryColorMap();
      categoryColor = categoryColorMap(category);
    } else {
      const i = index - concepts.length;
      entry = ids[i];

      ({
        degree, category, name, id,
      } = entry);
      const urls = curieUrls(id);
      links = (
        <span>
          {urls.map((u) => (
            <a target="_blank" rel="noreferrer" href={u.url} alt={u.name} key={shortid.generate()} style={{ paddingRight: '3px' }}><img src={u.iconUrl} alt={u.name} height={16} width={16} /></a>
          ))}
        </span>
      );
      if (!Array.isArray(category)) {
        category = [category];
      }
      category = category.filter((t) => t !== 'biolink:NamedThing');
      const categoryColorMap = getNodeCategoryColorMap(category);
      colorStripes = category.map((t) => (
        <div
          title={t}
          style={{
            backgroundColor: categoryColorMap(t),
            height: '100%',
            width: '5px',
          }}
          key={shortid.generate()}
        />
      ));
    }

    const fullColor = typeof category === 'string';

    return (
      <div
        key={key}
        style={{ ...style, backgroundColor: categoryColor }}
        className="nodePanelSelector"
        id={index === concepts.length - 1 && ids.length > 0 ? 'lastConcept' : ''}
      >
        {!fullColor && (
          <div className="colorStripesContainer">
            {colorStripes}
          </div>
        )}
        <div className="curieName">
          <div title={name}>{name}</div>
        </div>
        <div className="curieDetails">
          {id}
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

  const nRows = concepts.length + ids.length;
  const showOptions = searchTerm && !selection.category && !selection.id.length;
  const showSelectedId = !showOptions && !!selection.id.length;
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
            inputRef={(ref) => { inputRef.current = ref; }}
            onChange={(e) => updateSearchTerm(e.target.value)}
          />
          {showSelectedId && (
            <InputGroup.Addon>
              {selection.id[0]}
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
