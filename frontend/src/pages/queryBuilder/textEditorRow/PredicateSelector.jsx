import React, { useMemo, useContext, useEffect } from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';

import BiolinkContext from '~/context/biolink';
import QueryBuilderContext from '~/context/queryBuilder';
import strings from '~/utils/strings';
import highlighter from '~/utils/d3/highlighter';

/**
 * Get first node category from list
 * @param {array|undefined} category array of node categories
 * @returns first node category or biolink:NamedThing
 */
function getCategory(category) {
  return (Array.isArray(category) && category.length && category[0]) || 'biolink:NamedThing';
}

export default function PredicateSelector({ id }) {
  const biolink = useContext(BiolinkContext);
  const queryBuilder = useContext(QueryBuilderContext);
  const { query_graph, updateEdgePredicate } = queryBuilder;
  const edge = query_graph.edges[id];
  console.log(id);

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
      queryBuilder.updateEdgePredicate(id, keptPredicates);
    }
  }, [filteredPredicateList]);

  return (
    <Autocomplete
      options={filteredPredicateList}
      className={`textEditorSelector highlight-${id}`}
      value={edge.predicate || []}
      onChange={(e, value) => {
        updateEdgePredicate(id, value);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Predicate"
          variant="outlined"
          className="edgeDropdown"
          margin="dense"
          onFocus={() => {
            highlighter.highlightGraphEdge(id);
            highlighter.highlightTextEditorEdge(id);
          }}
          onBlur={() => {
            highlighter.clearGraphEdge(id);
            highlighter.clearTextEditorEdge(id);
          }}
          InputProps={{
            ...params.InputProps,
            classes: {
              root: `edgeSelector edgeSelector-${id}`,
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
