import React, {
  useState,
  useEffect,
} from 'react';

import {
  Row,
  Col,
} from 'react-bootstrap';

import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import ShowPropertyValue from './ShowPropertyValue';

import API from '~/API';
import useBiolinkModel from '~/stores/useBiolinkModel';

import propertyFriendlyNames from './property-friendly-names.json';

export default function ShowEdges({
  node,
  nodeId,
}) {
  const biolink = useBiolinkModel();

  const pageSizeOptions = [
    10, 25, 50, 100, 1000,
  ];

  const [
    hasEdgesDataError,
    setHasEdgesDataError,
  ] = useState(false);

  const [
    selectedPredicate,
    setPredicateSelection,
  ] = useState('all');

  const [pageSize, setPageSize] =
    useState(10);
  const [hasNextPage, setHasNextPage] =
    useState(false);

  const [
    currentPageNumber,
    setCurrentPageNumber,
  ] = useState(0);

  const [edgeData, setEdgeData] =
    useState([]);

  // Load biolink on page load
  async function fetchBiolink() {
    const response =
      await API.biolink.getModelSpecification();
    if (response.status === 'error') {
      simpleSetAlert(
        'error',
        'Failed to contact server to download biolink model. You will not be able to select general nodes or predicates. Please try again later.',
      );
      return;
    }
    biolink.setBiolinkModel(response);
  }

  async function fetchEdges() {
    const edgeResponse =
      await API.details.getNodeEdges(
        nodeId,
        pageSize,
        currentPageNumber,
        selectedPredicate,
      );

    setHasNextPage(
      edgeResponse.length === pageSize,
    );

    if (
      edgeResponse.status === 'error'
    ) {
      setHasEdgesDataError(true);
      setEdgeData([]);
    } else {
      setHasEdgesDataError(false);
      setEdgeData(edgeResponse.edges);
    }
  }

  const handlePageSizeChange = (
    event,
  ) => {
    setCurrentPageNumber(0);
    setPageSize(event.target.value);
  };

  const handlePredicateChange = (
    event,
  ) => {
    setCurrentPageNumber(0);
    setPredicateSelection(
      event.target.value,
    );
  };

  useEffect(() => {
    fetchBiolink();
  }, []);

  useEffect(() => {
    fetchEdges();
  }, [
    currentPageNumber,
    pageSize,
    selectedPredicate,
  ]);

  const goOnPrevPage = () => {
    if (currentPageNumber < 1) return;
    setCurrentPageNumber(
      (prev) => prev - 1,
    );
  };

  const goOnNextPage = () => {
    setCurrentPageNumber(
      (prev) => prev + 1,
    );
  };

  const ShowEdgeInfo = ({ edge }) => {
    if (edge.edge.direction === '<')
      return (
        <Row>
          <Col md={3}>
            <a
              href={
                './' + edge.adj_node.id
              }>
              {edge.adj_node.name} (
              {edge.adj_node.id})
            </a>
          </Col>
          <Col md={3}>
            {propertyFriendlyNames[
              edge.edge.predicate
            ] ?? edge.edge.predicate}
          </Col>
          <Col md={3}>
            {node.name}
            {/* <ShowPropertyValue
              propertyValue={
                edge.adj_node.category
              }></ShowPropertyValue> */}
          </Col>
        </Row>
      );
    else
      return (
        <Row>
          <Col md={3}>
            {node.name}
            {/* {propertyFriendlyNames[
              edge.edge.predicate
            ] ?? edge.edge.predicate} */}
          </Col>
          <Col md={3}>
            {propertyFriendlyNames[
              edge.edge.predicate
            ] ?? edge.edge.predicate}
          </Col>
          <Col md={3}>
            <a
              href={
                './' + edge.adj_node.id
              }>
              {edge.adj_node.name} (
              {edge.adj_node.id})
            </a>
            {/*
            <ShowPropertyValue
              propertyValue={
                edge.adj_node.category
              }></ShowPropertyValue> */}
          </Col>
        </Row>
      );
  };

  return (
    <Row>
      {hasEdgesDataError ? (
        <Col>
          <h2>Edges</h2>
          <div>
            An error occurred while
            getting the edges
          </div>
        </Col>
      ) : (
        <Col>
          <h2>Edges</h2>
          <div>
            Filter by predicates:
            <Select
              labelId="select-filter-predicate"
              id="select-filter-predicate"
              value={selectedPredicate}
              label="Predicate"
              style={{
                marginLeft: '2rem',
              }}
              onChange={
                handlePredicateChange
              }>
              <MenuItem
                key="all"
                value={'all'}>
                All
              </MenuItem>
              {biolink.predicates
                .map((predicate) => ({
                  name:
                    propertyFriendlyNames[
                      predicate
                        .predicate
                    ] ??
                    predicate.predicate,
                  value:
                    predicate.predicate,
                }))
                .sort((a, b) =>
                  a.name > b.name
                    ? 1
                    : b.name > a.name
                    ? -1
                    : 0,
                )
                .map((predicate) => (
                  <MenuItem
                    key={
                      predicate.value
                    }
                    value={
                      predicate.value
                    }>
                    {predicate.name}
                  </MenuItem>
                ))}
            </Select>
          </div>
          {edgeData.length === 0 ? (
            <Row>
              <Col md={8}>
                No edges found for this
                node.
              </Col>
            </Row>
          ) : (
            edgeData.map(
              (edgeRow, index) => (
                <ShowEdgeInfo
                  key={index}
                  edge={edgeRow}
                />
              ),
            )
          )}

          <nav aria-label="edges pagination">
            <ul className="pagination justify-content-end">
              <li
                className="page-item px-2"
                style={{
                  marginLeft: '2rem',
                }}>
                Page Size:
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={pageSize}
                  label="Page Size"
                  onChange={
                    handlePageSizeChange
                  }>
                  {pageSizeOptions.map(
                    (pageSize) => (
                      <MenuItem
                        key={pageSize}
                        value={
                          pageSize
                        }>
                        {pageSize}
                      </MenuItem>
                    ),
                  )}
                </Select>
              </li>
              <li className="page-item disabled">
                Page:
                {currentPageNumber + 1}
              </li>
              {currentPageNumber > 0 ? (
                <li className="page-item">
                  <a
                    className="page-link"
                    href="#"
                    onClick={
                      goOnPrevPage
                    }>
                    Previous
                  </a>
                </li>
              ) : (
                <li className="page-item disabled">
                  <span className="page-link">
                    Previous
                  </span>
                </li>
              )}
              {hasNextPage ? (
                <li className="page-item">
                  <a
                    className="page-link"
                    href="#"
                    onClick={
                      goOnNextPage
                    }>
                    Next
                  </a>
                </li>
              ) : (
                <li className="page-item disabled">
                  <span className="page-link">
                    Next
                  </span>
                </li>
              )}
            </ul>
          </nav>
        </Col>
      )}
    </Row>
  );
}
