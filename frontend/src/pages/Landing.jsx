import React from 'react';
import { Link } from 'react-router-dom';
import {
  Grid, Jumbotron, ButtonToolbar, Button, ListGroup,
  ListGroupItem, Glyphicon, Col, Row,
} from 'react-bootstrap';

import config from '../config.json';

import './simplecss.css';

function CustomComponent({
  glyph, header, text, href,
}) {
  return (
    <Col md={6}>
      <Link to={href}>
        <ListGroupItem
          style={{ padding: '15px', margin: '15px 0px' }}
        >
          <div style={{ height: '155px', display: 'flex' }}>
            <div
              style={{
                padding: '20px', display: 'flex', alignItems: 'center',
              }}
            >
              <Glyphicon glyph={glyph} style={{ fontSize: '40px' }} />
            </div>
            <div>
              <h4 style={{ fontSize: '20px' }}>{header}</h4>
              <p style={{ fontSize: '16px' }}>{text}</p>
            </div>
          </div>
        </ListGroupItem>
      </Link>
    </Col>
  );
}

/**
 * Home page
 * @param {boolean} isSignedIn is the user signed in
 */
export default function Landing({ isSignedIn }) {
  const shownNewQuestion = isSignedIn && config.settings.enableNewQuestions;

  return (
    <Grid>
      <Jumbotron>
        <h1>Robokop</h1>
        <p>
          <b>R</b>easoning <b>O</b>ver <b>B</b>iomedical <b> O</b>bjects
          linked in <b>K</b>nowledge <b>O</b>riented <b>P</b>athways
        </p>
        <p>
          Robokop is a biomedical reasoning system that interacts with many biomedical knowledge
          sources to answer questions. Robokop is one of several prototype systems under active development
          with <a href="https://ncats.nih.gov/">NIH NCATS</a>.
        </p>
        <p>
          <Link
            style={{ fontSize: 'small' }}
            to="/guide"
          >
            Learn More
          </Link>
        </p>
        <ButtonToolbar style={{ paddingTop: '10px' }}>
          <Link to="/questions">
            <Button bsSize="large">
              Browse Questions
            </Button>
          </Link>
          {shownNewQuestion ? (
            <Link to="/q/new">
              <Button
                bsSize="large"
              >
                Ask a Question
              </Button>
            </Link>
          ) : (
            <Link to="/simple/question">
              <Button
                bsSize="large"
              >
                Ask a Quick Question
              </Button>
            </Link>
          )}
        </ButtonToolbar>
      </Jumbotron>
      <Jumbotron id="landingOptions">
        <h2>Robokop Apps</h2>
        <ListGroup>
          <Row>
            <CustomComponent
              glyph="question-sign"
              header="Quick Question"
              text="Ask a question and get an answerset back. This question will not be stored and you don&apos;t have to be signed in."
              href="/simple/question"
            />
            <CustomComponent
              glyph="import"
              header="Answerset Explorer"
              text="Easily upload JSON files of answersets to view them in Robokop&apos;s graphical interface."
              href="/simple/view"
            />
          </Row>
          {/*
          <Row>
            <CustomComponent
              glyph="screenshot"
              header="Neighborhood"
              text="Explore many sources and one-hop neighbors from specified node."
              href="/neighborhood"
            />
          </Row>
          */}
        </ListGroup>
      </Jumbotron>
    </Grid>
  );
}
