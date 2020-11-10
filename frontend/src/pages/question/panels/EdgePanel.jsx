import React, { useEffect, useMemo, useContext } from 'react';

import {
  Form, Col, Glyphicon, Badge, Button,
} from 'react-bootstrap';
import { FaSpinner } from 'react-icons/fa';
import { Multiselect, DropdownList } from 'react-widgets';

import entityNameDisplay from '@/utils/entityNameDisplay';
import usePageStatus from '@/utils/usePageStatus';
import biolinkUtils from '@/utils/biolink';
import BiolinkContext from '@/context/biolink';

const listItem = ({ item }) => (
  <div className="listItem">
    {item.name}
    {item.degree !== undefined && (
      <Badge>{item.degree}</Badge>
    )}
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
    return Object.entries(biolink.slots).map(
      ([identifier, predicate]) => ({
        name: biolinkUtils.snakeCase(identifier),
        domain: biolinkUtils.snakeCase(predicate.domain),
        range: biolinkUtils.snakeCase(predicate.range),
      }),
    );
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

    const sourceNodeTypeHierarchy = biolinkUtils.getHierarchy(biolink, sourceNode.type[0]);
    const targetNodeTypeHierarchy = biolinkUtils.getHierarchy(biolink, targetNode.type[0]);

    return predicateList.filter(
      (p) => sourceNodeTypeHierarchy.includes(p.domain) &&
               targetNodeTypeHierarchy.includes(p.range),
    );
  }

  const filteredPredicateList = useMemo(getFilteredPredicateList, [edge.sourceId, edge.targetId]) || [];

  function handleTargetIdUpdate(value) {
    edge.updateTargetId(value.id);
    panelStore.toggleUnsavedChanges(true);
  }

  function handleSourceIdUpdate(value) {
    edge.updateSourceId(value.id);
    panelStore.toggleUnsavedChanges(true);
  }

  function handlePredicateUpdate(value) {
    edge.setPredicate(value);
    panelStore.toggleUnsavedChanges(true);
  }

  function handleSwitchSourceTarget() {
    // TODO: do this less hacky
    const { source, target, id } = edge.switchSourceTarget();
    panelStore.updateEdgePanelHeader(source, target, id);
    panelStore.toggleUnsavedChanges(true);
  }

  const validNodeSelectionList =
    Object.entries(panelStore.query_graph.nodes).map(
      ([id, node]) => ({
        ...node,
        name: `${id}: ${node.name || entityNameDisplay(node.type)}`,
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
  const isValidPredicate = edge.predicate.every(
    (p) => filteredPredicateList.some((fp) => p.name === fp.name),
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
          textField="name"
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
          textField="name"
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
            itemComponent={listItem}
            busySpinner={<FaSpinner className="icon-spin" />}
            placeholder={predicateInputMsg}
            textField={(value) => value.name || value}
            value={edge.predicate}
            valueField={(value) => value.name || value}
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
