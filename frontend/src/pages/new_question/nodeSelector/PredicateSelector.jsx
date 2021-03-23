import React, { useMemo, useContext } from 'react';
import _ from 'lodash';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';

import BiolinkContext from '~/context/biolink';
import strings from '~/utils/stringUtils';

export default function PredicateSelector({ queryBuilder, edgeId }) {
  const biolink = useContext(BiolinkContext);
  const { query_graph, updateEdgePredicate } = queryBuilder;
  const edge = query_graph.edges[edgeId];

  // Build a list of formatted predicates
  function getPredicateList() {
    if (!biolink || !biolink.concepts.length) {
      return null;
    }
    return biolink.getEdgePredicates();
  }

  const predicateList = useMemo(getPredicateList, [biolink]) || [];

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

    // if (!subjectNode.category || !objectNode.category) {
    //   return null;
    // }
    const subjectCategory = (Array.isArray(subjectNode.category) && subjectNode.category.length && subjectNode.category[0]) || 'biolink:NamedThing';
    const objectCategory = (Array.isArray(objectNode.category) && objectNode.category.length && objectNode.category[0]) || 'biolink:NamedThing';

    const subjectNodeCategoryHierarchy = biolink.hierarchies[subjectCategory];
    const objectNodeCategoryHierarchy = biolink.hierarchies[objectCategory];

    if (!subjectNodeCategoryHierarchy || !objectNodeCategoryHierarchy) {
      return null;
    }

    return predicateList.filter(
      (p) => subjectNodeCategoryHierarchy.includes(p.domain) &&
             objectNodeCategoryHierarchy.includes(p.range),
    ).map((p) => p.predicate);
  }

  const filteredPredicateList = useMemo(
    getFilteredPredicateList,
    [
      query_graph.nodes[edge.subject],
      query_graph.nodes[edge.object],
      biolink,
      predicateList,
    ],
  ) || [];

  // const disabledSelect = useMemo(() => (
  //   query_graph.nodes[edge.subject].category.length === 0 ||
  //   query_graph.nodes[edge.object].category.length === 0
  // ), [query_graph.nodes[edge.subject], query_graph.nodes[edge.object]]);

  return (
    <Autocomplete
      options={filteredPredicateList}
      className="predicateSelector"
      value={edge.predicate || []}
      onChange={(e, value) => {
        updateEdgePredicate(edgeId, value);
      }}
      renderInput={(params) => <TextField {...params} label="Predicate" variant="outlined" />}
      getOptionLabel={(opt) => strings.displayPredicate(opt)}
      clearOnBlur={false}
      multiple
      limitTags={1}
      // disabled={disabledSelect}
      disableCloseOnSelect
      size="small"
    />
  );
}
