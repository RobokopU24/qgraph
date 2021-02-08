import React, { useEffect, useMemo, useContext } from 'react';

import {
  Form, Col, Glyphicon, Badge, Button,
} from 'react-bootstrap';
import { FaSpinner } from 'react-icons/fa';
import { Multiselect, DropdownList } from 'react-widgets';

import strings from '~/utils/stringUtils';
import usePageStatus from '~/utils/usePageStatus';
import BiolinkContext from '~/context/biolink';

const listItem = ({ item }) => (
  <div className="listItem">
    {item.name}
    {item.degree !== undefined && (
      <Badge>{item.degree}</Badge>
    )}
  </div>
);

const predicateItem = ({ item }) => (
  <div className="listItem">
    {strings.displayPredicate(item.predicate)}
  </div>
);

export default function EdgePanel(props) {
  const predicateStatus = usePageStatus(false);
  const { panelStore } = props;
  const { edge } = panelStore;

  const biolink = useContext(BiolinkContext);

  // Build a list of formatted predicates
  function getPredicateList() {
    if (!biolink) {
      return null;
    }
    return biolink.getEdgePredicates();
  }

  const predicateList = useMemo(getPredicateList, [biolink]) || [];

  // Filter predicates by the nodes given
  function getFilteredPredicateList() {
    if (!biolink) {
      return null;
    }
    if (!edge.subject || !edge.object) {
      return null;
    }
    const subjectNode = panelStore.query_graph.nodes[edge.subject];
    const objectNode = panelStore.query_graph.nodes[edge.object];

    if (!subjectNode.category || !objectNode.category) {
      return null;
    }

    const subjectNodeCategoryHierarchy = biolink.hierarchies[subjectNode.category[0]];
    const objectNodeCategoryHierarchy = biolink.hierarchies[objectNode.category[0]];

    if (!subjectNodeCategoryHierarchy || !objectNodeCategoryHierarchy) {
      return null;
    }

    return predicateList.filter(
      (p) => subjectNodeCategoryHierarchy.includes(p.domain) &&
             objectNodeCategoryHierarchy.includes(p.range),
    );
  }

  const filteredPredicateList = useMemo(getFilteredPredicateList, [edge.subject, edge.object, biolink, predicateList]) || [];

  /**
   * Update object node of edge
   * @param {object} value node object
   */
  function handleObjectUpdate(value) {
    edge.updateObject(value.key);
    panelStore.updateEdgePanelHeader(edge.subject, value.key);
    panelStore.toggleUnsavedChanges(true);
  }

  /**
   * Update subject node of edge
   * @param {object} value node object
   */
  function handleSubjectUpdate(value) {
    edge.updateSubject(value.key);
    panelStore.updateEdgePanelHeader(value.key, edge.object);
    panelStore.toggleUnsavedChanges(true);
  }

  /**
   * Update edge with predicates
   * @param {Object[]} value list of selected predicate objects
   * @param {string} value.predicate predicate predicate
   * @param {string} value.domain predicate source node
   * @param {string} value.range predicate target node
   */
  function handlePredicateUpdate(value) {
    const predicates = value.map((v) => v.predicate);
    edge.setPredicate(predicates);
    panelStore.toggleUnsavedChanges(true);
  }

  function handleSwitchSubjectObject() {
    // TODO: do this less hacky
    const { newSubject, newObject } = edge.switchSubjectObject();
    panelStore.updateEdgePanelHeader(newSubject, newObject);
    panelStore.toggleUnsavedChanges(true);
  }

  const validNodeSelectionList =
    Object.entries(panelStore.query_graph.nodes).map(
      ([key, node]) => ({
        ...node,
        name: `${key}: ${node.name || strings.displayCategory(node.category)}`,
        key,
      }),
    ).filter((n) => !n.deleted);

  const disablePredicates = !(edge.subject && edge.object);

  // Determine default message for predicate selection component
  let predicateInputMsg = 'Choose optional predicate(s)...';
  if (disablePredicates) {
    predicateInputMsg = 'Source and/or Target Nodes need to be specified...';
  }

  // Every predicate selected must match at least one
  // predicate in the filteredPredicateList
  const isValidPredicate = edge.predicate.every(
    (p) => filteredPredicateList.some((fp) => p === fp.predicate),
  );

  const isValid = edge.subject && edge.object && isValidPredicate;

  const disabledSwitch = edge.subject === null || edge.object === null;

  useEffect(() => {
  // Update edge in panelStore
    edge.setIsValid(isValid);
    edge.setIsValidPredicate(isValidPredicate);
  }, [edge.subject, edge.object, edge.predicate]);

  return (
    <Form horizontal>
      <Col sm={5}>
        <h4 style={{ color: '#CCCCCC' }}>SUBJECT</h4>
        <DropdownList
          filter="contains"
          data={validNodeSelectionList}
          itemComponent={listItem}
          textField="name"
          valueField="key"
          value={edge.subject}
          onChange={handleSubjectUpdate}
          containerClassName={
            validNodeSelectionList.find((n) => n.key === edge.subject)
              ? 'valid' : 'invalid'
          }
        />
      </Col>
      <Col sm={2} id="nodesSwitch">
        <Button
          onClick={() => handleSwitchSubjectObject()}
          id="nodeSwitchButton"
          disabled={disabledSwitch}
        >
          <Glyphicon glyph="transfer" />
        </Button>
      </Col>
      <Col sm={5}>
        <h4 style={{ color: '#CCCCCC' }}>OBJECT</h4>
        <DropdownList
          filter="contains"
          data={validNodeSelectionList.filter((n) => n.key !== edge.subject)}
          busySpinner={<FaSpinner className="icon-spin" />}
          itemComponent={listItem}
          textField="name"
          valueField="key"
          value={edge.object}
          onChange={handleObjectUpdate}
          containerClassName={
            validNodeSelectionList.find((n) => n.key === edge.object)
              ? 'valid' : 'invalid'
          }
        />
      </Col>

      <predicateStatus.Display />
      { predicateStatus.displayPage && (
        <Col sm={12} style={{ marginTop: '40px' }}>
          <h4 style={{ color: '#CCCCCC' }}>PREDICATE</h4>
          <Multiselect
            filter="contains"
            allowCreate={false}
            readOnly={disablePredicates}
            data={filteredPredicateList}
            itemComponent={predicateItem}
            busySpinner={<FaSpinner className="icon-spin" />}
            placeholder={predicateInputMsg}
            textField={(value) => strings.displayPredicate(value.predicate)}
            value={edge.predicate}
            valueField="predicate"
            onChange={handlePredicateUpdate}
            containerClassName={isValidPredicate ? 'valid' : 'invalid'}
            messages={{
              emptyList: 'No predicates were found',
            }}
          />
        </Col>
      )}
    </Form>
  );
}
