import React, { useEffect, useCallback } from 'react';
import _ from 'lodash';

import API from '@/API';

import {
  Form, Col, Glyphicon, Badge, Button,
} from 'react-bootstrap';
import { FaSpinner } from 'react-icons/fa';
import { Multiselect, DropdownList } from 'react-widgets';

import entityNameDisplay from '@/utils/entityNameDisplay';
import usePageStatus from '@/utils/usePageStatus';

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

  async function fetchPredicates() {
    if (!edge.sourceId || !edge.targetId) {
      return;
    }
    let sourceNode =
        panelStore.query_graph.nodes[edge.sourceId];
    let targetNode =
        panelStore.query_graph.nodes[edge.targetId];
      // Including name in the node breaks the API call
      // So we make a copy and remove it
    sourceNode = { ...sourceNode };
    targetNode = { ...targetNode };
    delete sourceNode.name;
    delete targetNode.name;
    const response = await API.ranker.predicateLookup(sourceNode, targetNode);
    if (response.status === 'error') {
      predicateStatus.setFailure('Failed to contact predicate lookup server. Please try again later');
    }
    edge.updatePredicateList(
      Object.keys(response).map((name) => ({
        name,
        degree: response[name],
      })),
    );
  }

  useEffect(() => { fetchPredicates(); }, [edge.sourceId, edge.targetId]);

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

  const validNodeSelectionList =
    Object.entries(panelStore.query_graph.nodes).map(
      ([id, node]) => ({
        ...node,
        name: node.name || entityNameDisplay(node.type),
        id,
      }),
    ).filter((n) => !n.deleted);

  // Determine default message for predicate selection component
  let predicateInputMsg = 'Choose optional predicate(s)...';
  if (!edge.predicatesReady) {
    predicateInputMsg = 'Loading...';
  } else if (edge.disablePredicates) {
    predicateInputMsg = 'Source and/or Target Nodes need to be specified...';
  }
  const disabledSwitch = edge.sourceId === null || edge.targetId === null;

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
          onClick={edge.switchSourceTarget}
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
            readOnly={!edge.predicatesReady || edge.disablePredicates}
            busy={!edge.predicatesReady}
            data={edge.predicateList}
            itemComponent={listItem}
            busySpinner={<FaSpinner className="icon-spin" />}
            placeholder={predicateInputMsg}
            textField={(value) => value.name || value}
            value={edge.predicate}
            valueField={(value) => value.name || value}
            onChange={handlePredicateUpdate}
            containerClassName={edge.isValidPredicate() ? 'valid' : 'invalid'}
            messages={{
              emptyList: 'No predicates were found',
            }}
          />
        </Col>
      )}
    </Form>
  );
}
