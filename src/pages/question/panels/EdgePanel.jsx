import React, { useEffect, useCallback, useContext } from 'react';
import _ from 'lodash';

import API from '@/API';
import AlertContext from '@/context/alert';

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

  const displayAlert = useContext(AlertContext);

  async function fetchPredicateList() {
    const spacesToSnakeCase = (str) => str && str.replaceAll(' ', '_').toLowerCase();

    const response = await API.biolink.getModelSpecification();
    if (response.status === 'error') {
      displayAlert('error',
        'Failed to contact server to download biolink model. You will not be able to select predicates. Please try again later');
      return;
    }
    const biolink = response;
    const predicatesFormatted = Object.entries(biolink.slots).map(
      ([identifier, predicate]) => ({
        name: spacesToSnakeCase(identifier),
        domain: spacesToSnakeCase(predicate.domain),
        range: spacesToSnakeCase(predicate.range),
      }),
    );
    edge.updatePredicateList(predicatesFormatted);
  }

  // When edge panel mounts get predicates
  useEffect(() => { fetchPredicateList(); }, []);

  function updateFilteredPredicates() {
    if (!edge.sourceId || !edge.targetId) {
      return;
    }
    const sourceNode = panelStore.query_graph.nodes[edge.sourceId];
    const targetNode = panelStore.query_graph.nodes[edge.targetId];

    if (!sourceNode.type || !targetNode.type) {
      return;
    }

    edge.setFilteredPredicateList(
      edge.predicateList.filter(
        (p) => p.domain === sourceNode.type && p.range === targetNode.type,
      ),
    );
  }

  useEffect(updateFilteredPredicates, [edge.sourceId, edge.targetId]);

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
    edge.switchSourceTarget();
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

  const disablePredicates = !(edge.sourceId && edge.targetId);

  // Determine default message for predicate selection component
  let predicateInputMsg = 'Choose optional predicate(s)...';
  if (disablePredicates) {
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
            data={edge.filteredPredicateList}
            itemComponent={listItem}
            busySpinner={<FaSpinner className="icon-spin" />}
            placeholder={predicateInputMsg}
            textField={(value) => value.name || value}
            value={edge.predicate}
            valueField={(value) => value.name || value}
            onChange={handlePredicateUpdate}
            containerClassName={edge.isValidPredicate ? 'valid' : 'invalid'}
            messages={{
              emptyList: 'No predicates were found',
            }}
          />
        </Col>
      )}
    </Form>
  );
}
