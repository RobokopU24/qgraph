import React, { useMemo, useContext, useEffect } from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';

import BiolinkContext from '~/context/biolink';
import strings from '~/utils/stringUtils';
import highlighter from '../utils/highlighter';

/**
 * Get first node category from list
 * @param {array|undefined} category array of node categories
 * @returns first node category or biolink:NamedThing
 */
function getCategory(category) {
  return (Array.isArray(category) && category.length && category[0]) || 'biolink:NamedThing';
}

export default function PredicateSelector({ queryBuilder, edgeId }) {
  const biolink = useContext(BiolinkContext);
  const { query_graph, updateEdgePredicate } = queryBuilder;
  const edge = query_graph.edges[edgeId];

  // Filter predicates by the nodes given
  function getFilteredPredicateList() {
    if (!biolink || !biolink.concepts.length) {
      return null;
    }
    if (!edge.subject || !edge.object) {
      return null;
    }
    const subjectNode = query_graph.nodes[edge.subject];
    const objectNode = query_graph.nodes[edge.object];

    const subjectCategory = getCategory(subjectNode.category);
    const objectCategory = getCategory(objectNode.category);

    const subjectNodeCategoryHierarchy = biolink.hierarchies[subjectCategory];
    const objectNodeCategoryHierarchy = biolink.hierarchies[objectCategory];

    if (!subjectNodeCategoryHierarchy || !objectNodeCategoryHierarchy) {
      return null;
    }

    return biolink.predicates.filter(
      (p) => subjectNodeCategoryHierarchy.includes(p.domain) &&
             objectNodeCategoryHierarchy.includes(p.range),
    ).map((p) => p.predicate);
  }

  const filteredPredicateList = useMemo(
    getFilteredPredicateList,
    [
      getCategory(query_graph.nodes[edge.subject].category),
      getCategory(query_graph.nodes[edge.object].category),
      biolink,
    ],
  ) || [];

  useEffect(() => {
    if (filteredPredicateList.length) {
      const keptPredicates = (edge.predicate && edge.predicate.filter((p) => filteredPredicateList.indexOf(p) > -1)) || [];
      queryBuilder.updateEdgePredicate(edgeId, keptPredicates);
    }
  }, [filteredPredicateList]);

  return (
    <Autocomplete
      options={filteredPredicateList}
      className={`textEditorSelector highlight-${edgeId}`}
      value={edge.predicate || []}
      onChange={(e, value) => {
        updateEdgePredicate(edgeId, value);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Predicate"
          variant="outlined"
          className="edgeDropdown"
          margin="dense"
          onFocus={() => {
            highlighter.highlightGraphEdge(edgeId);
            highlighter.highlightTextEditorEdge(edgeId);
          }}
          onBlur={() => {
            highlighter.clearGraphEdge(edgeId);
            highlighter.clearTextEditorEdge(edgeId);
          }}
          InputProps={{
            ...params.InputProps,
            classes: {
              root: `edgeSelector edgeSelector-${edgeId}`,
            },
          }}
        />
      )}
      getOptionLabel={(opt) => strings.displayPredicate(opt)}
      clearOnBlur={false}
      multiple
      limitTags={1}
      disableCloseOnSelect
      size="small"
    />
  );
}
