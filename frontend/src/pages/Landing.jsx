import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  Grid, Jumbotron, ButtonToolbar, Button, ListGroup,
  ListGroupItem, Glyphicon, Col, Row,
} from 'react-bootstrap';

import UserContext from '~/context/user';
import './simplecss.css';

/**
 * Landing Page Options Button
 * @param {string} glyph bootstrap glyph type
 * @param {string} header Title of the option
 * @param {string} text Short description of the option
 * @param {string} href option url
 */
function OptionButton({
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
 */
export default function Landing() {
  const user = useContext(UserContext);
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
          {user ? (
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
            <OptionButton
              glyph="question-sign"
              header="Quick Question"
              text="Ask a question and get an answerset back. This question will not be stored and you don&apos;t have to be signed in."
              href="/simple/question"
            />
            <OptionButton
              glyph="import"
              header="Answerset Explorer"
              text="Easily upload JSON files of answersets to view them in Robokop&apos;s graphical interface."
              href="/simple/view"
            />
          </Row>
          <Row>
            <OptionButton
              glyph="screenshot"
              header="New Question Builder"
              text="Use text editor and a graph editor together."
              href="/new_question"
            />
          </Row>
          {/*
          <Row>
            <OptionButton
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
