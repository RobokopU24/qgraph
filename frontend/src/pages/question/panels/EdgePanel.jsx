import React, { useEffect, useMemo, useContext } from 'react';

import {
  Form, Col, Glyphicon, Badge, Button,
} from 'react-bootstrap';
import { FaSpinner } from 'react-icons/fa';
import { Multiselect, DropdownList } from 'react-widgets';

import strings from '@/utils/stringUtils';
import usePageStatus from '@/utils/usePageStatus';
import BiolinkContext from '@/context/biolink';

const listItem = ({ item }) => (
  <div className="listItem">
    {item.label}
    {item.degree !== undefined && (
      <Badge>{item.degree}</Badge>
    )}
  </div>
);

const predicateItem = ({ item }) => (
  <div className="listItem">
    {strings.displayPredicate(item.type)}
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
    return biolink.getEdgeTypes();
  }

  const predicateList = useMemo(getPredicateList, [biolink]) || [];

  // Filter predicates by the nodes given
  function getFilteredPredicateList() {
    if (!biolink) {
      return null;
    }
    if (!edge.sourceId || !edge.targetId) {
      return null;
    }
    const sourceNode = panelStore.query_graph.nodes[edge.sourceId];
    const targetNode = panelStore.query_graph.nodes[edge.targetId];

    if (!sourceNode.type || !targetNode.type) {
      return null;
    }

    const sourceNodeTypeHierarchy = biolink.hierarchies[sourceNode.type[0]];
    const targetNodeTypeHierarchy = biolink.hierarchies[targetNode.type[0]];

    if (!sourceNodeTypeHierarchy || !targetNodeTypeHierarchy) {
      return null;
    }

    return predicateList.filter(
      (p) => sourceNodeTypeHierarchy.includes(p.domain) &&
               targetNodeTypeHierarchy.includes(p.range),
    );
  }

  const filteredPredicateList = useMemo(getFilteredPredicateList, [edge.sourceId, edge.targetId, biolink, predicateList]) || [];

  function handleTargetIdUpdate(value) {
    edge.updateTargetId(value.id);
    panelStore.updateEdgePanelHeader(edge.sourceId, value.id);
    panelStore.toggleUnsavedChanges(true);
  }

  function handleSourceIdUpdate(value) {
    edge.updateSourceId(value.id);
    panelStore.updateEdgePanelHeader(value.id, edge.targetId);
    panelStore.toggleUnsavedChanges(true);
  }

  /**
   * Update edge with types
   * @param {Object[]} value list of selected type objects
   * @param {string} value.type predicate type
   * @param {string} value.domain predicate source node
   * @param {string} value.range predicate target node
   */
  function handlePredicateUpdate(value) {
    const types = value.map((v) => v.type);
    edge.setType(types);
    panelStore.toggleUnsavedChanges(true);
  }

  function handleSwitchSourceTarget() {
    // TODO: do this less hacky
    const { source, target } = edge.switchSourceTarget();
    panelStore.updateEdgePanelHeader(source, target);
    panelStore.toggleUnsavedChanges(true);
  }

  const validNodeSelectionList =
    Object.entries(panelStore.query_graph.nodes).map(
      ([id, node]) => ({
        ...node,
        label: `${id}: ${node.label || strings.displayType(node.type)}`,
        id,
      }),
    ).filter((n) => !n.deleted);

  const disablePredicates = !(edge.sourceId && edge.targetId);

  // Determine default message for predicate selection component
  let predicateInputMsg = 'Choose optional predicate(s)...';
  if (disablePredicates) {
    predicateInputMsg = 'Source and/or Target Nodes need to be specified...';
  }

  // Every predicate selected must match at least one
  // predicate in the filteredPredicateList
  const isValidPredicate = edge.type.every(
    (p) => filteredPredicateList.some((fp) => p === fp.type),
  );

  const isValid = edge.sourceId && edge.targetId && isValidPredicate;

  const disabledSwitch = edge.sourceId === null || edge.targetId === null;

  useEffect(() => {
  // Update edge in panelStore
    edge.setIsValid(isValid);
    edge.setIsValidPredicate(isValidPredicate);
  }, [edge.sourceId, edge.targetId, edge.predicate]);

  return (
    <Form horizontal>
      <Col sm={5}>
        <h4 style={{ color: '#CCCCCC' }}>SOURCE</h4>
        <DropdownList
          filter="contains"
          data={validNodeSelectionList}
          itemComponent={listItem}
          textField="label"
          valueField="id"
          value={edge.sourceId}
          onChange={handleSourceIdUpdate}
          containerClassName={
            validNodeSelectionList.find((n) => n.id === edge.sourceId)
              ? 'valid' : 'invalid'
          }
        />
      </Col>
      <Col sm={2} id="nodesSwitch">
        <Button
          onClick={() => handleSwitchSourceTarget()}
          id="nodeSwitchButton"
          disabled={disabledSwitch}
        >
          <Glyphicon glyph="transfer" />
        </Button>
      </Col>
      <Col sm={5}>
        <h4 style={{ color: '#CCCCCC' }}>TARGET</h4>
        <DropdownList
          filter="contains"
          data={validNodeSelectionList.filter((n) => n.id !== edge.sourceId)}
          busySpinner={<FaSpinner className="icon-spin" />}
          itemComponent={listItem}
          textField="label"
          valueField="id"
          value={edge.targetId}
          onChange={handleTargetIdUpdate}
          containerClassName={
            validNodeSelectionList.find((n) => n.id === edge.targetId)
              ? 'valid' : 'invalid'
          }
        />
      </Col>

      <predicateStatus.Display />
      { predicateStatus.displayPage && (
        <Col sm={12} style={{ marginTop: '40px' }}>
          <h4 style={{ color: '#CCCCCC' }}>PREDICATES</h4>
          <Multiselect
            filter="contains"
            allowCreate={false}
            readOnly={disablePredicates}
            data={filteredPredicateList}
            itemComponent={predicateItem}
            busySpinner={<FaSpinner className="icon-spin" />}
            placeholder={predicateInputMsg}
            textField={(value) => strings.displayPredicate(value.type)}
            value={edge.type}
            valueField="type"
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
