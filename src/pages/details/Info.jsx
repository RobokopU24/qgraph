import { useAuth0 } from '@auth0/auth0-react';

import React, {
  useState,
  useEffect,
  useContext,
  useMemo,
} from 'react';
import {
  useRouteMatch,
  useHistory,
} from 'react-router-dom';

import ShowEdges from './ShowEdges';
import ShowEdgesSummary from './ShowEdgesSummary';
import ShowNode from './ShowNode';
import ShowNodeProperties from './ShowNodeProperties';

import {
  Grid,
  Row,
  Col,
} from 'react-bootstrap';

import API from '~/API';

export default function Info() {
  const match = useRouteMatch(
    '/details/:details_id',
  );

  const [nodeData, setNodeData] =
    useState([]);

  const nodeId = useMemo(
    () =>
      match && match.params.details_id,
    [match],
  );

  async function fetchNodeInfo() {
    const nodeResponse =
      await API.details.getNodeDetails(
        nodeId,
      );
    setNodeData(nodeResponse);
  }

  useEffect(() => {
    fetchNodeInfo();
  }, []);

  return (
    <Grid
      style={{ marginBottom: '50px' }}>
      <ShowNode node={nodeData} />
      <ShowNodeProperties
        properties={
          nodeData.properties
        }></ShowNodeProperties>
      <ShowEdgesSummary
        node={nodeData}
        nodeId={
          nodeId
        }></ShowEdgesSummary>
      <ShowEdges
        node={nodeData}
        nodeId={nodeId}></ShowEdges>
    </Grid>
  );
}
