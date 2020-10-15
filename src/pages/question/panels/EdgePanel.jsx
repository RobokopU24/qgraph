import React, { useEffect, useCallback } from 'react';
import _ from 'lodash';

import API from '@/API';
import {
  Form, Col, Glyphicon, Badge, Button,
} from 'react-bootstrap';
import { FaSpinner } from 'react-icons/fa';
import { Multiselect, DropdownList } from 'react-widgets';

const listItem = ({ item }) => (
  <div className="listItem">
    {item.name}
    {item.degree !== undefined && (
      <Badge>{item.degree}</Badge>
    )}
  </div>
);

export default function EdgePanel(props) {
  const { panelStore } = props;
  const { edge } = panelStore;

  async function fetchPredicates(sourceNode, targetNode) {
    console.log('nodes', sourceNode, targetNode);
    const response = await API.ranker.predicateLookup(sourceNode, targetNode);
    console.log('response', response);
    edge.updatePredicateList(
      Object.keys(response).map((name) => ({
        name,
        degree: response[name],
      })),
    );
  }

  function handleTargetIdUpdate(value) {
    const newTargetId = value.id;
    edge.updateTargetId(newTargetId);
    if (newTargetId !== null && edge.sourceId !== null) {
      let sourceNode =
        panelStore.query_graph.nodes.find((n) => n.id === edge.sourceId);
      let targetNode =
        panelStore.query_graph.nodes.find((n) => n.id === newTargetId);
      // Including name in the node breaks the API call
      sourceNode = { ...sourceNode };
      targetNode = { ...targetNode };
      delete sourceNode.name;
      delete targetNode.name;
      fetchPredicates(sourceNode, targetNode);
    }
  }

  const validNodeSelectionList =
    panelStore.query_graph.nodes.filter((n) => !n.deleted);
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
          onChange={(value) => edge.updateSourceId(value.id)}
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
          onChange={(value) => edge.setPredicate(value)}
          containerClassName={edge.isValidPredicate ? 'valid' : 'invalid'}
          messages={{
            emptyList: 'No predicates were found',
          }}
        />
      </Col>
    </Form>
  );
}
