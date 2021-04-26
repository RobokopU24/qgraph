import React, { useMemo, useContext, useEffect } from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';

import BiolinkContext from '~/context/biolink';
import QueryBuilderContext from '~/context/queryBuilder';
import strings from '~/utils/strings';
import highlighter from '~/utils/d3/highlighter';

/**
 * Get a list of categories
 * @param {array|undefined} categories array of node categories
 * @returns list of categories or biolink:NamedThing
 */
function getCategories(categories) {
  return (Array.isArray(categories) && categories.length && categories) || ['biolink:NamedThing'];
}

export default function PredicateSelector({ id }) {
  const biolink = useContext(BiolinkContext);
  const queryBuilder = useContext(QueryBuilderContext);
  const { query_graph, updateEdgePredicate } = queryBuilder;
  const edge = query_graph.edges[id];

  /**
   * Get list of valid predicates from selected node categories
   * @returns {string[]|null} list of valid predicates
   */
  function getFilteredPredicateList() {
    if (!biolink || !biolink.concepts.length) {
      return null;
    }
    const subjectNode = query_graph.nodes[edge.subject];
    const objectNode = query_graph.nodes[edge.object];

    // get list of categories from each node
    const subjectCategories = getCategories(subjectNode.category);
    const objectCategories = getCategories(objectNode.category);

    // get hierarchies of all involved node categories
    const subjectNodeCategoryHierarchy = subjectCategories.flatMap((subjectCategory) => biolink.hierarchies[subjectCategory]);
    const objectNodeCategoryHierarchy = objectCategories.flatMap((objectCategory) => biolink.hierarchies[objectCategory]);

    // if we get categories back that aren't in the biolink model
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
      // recompute if node categories change
      JSON.stringify(query_graph.nodes[edge.subject].category),
      JSON.stringify(query_graph.nodes[edge.object].category),
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
