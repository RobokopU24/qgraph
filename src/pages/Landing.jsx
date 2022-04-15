import React from 'react';
import { Link } from 'react-router-dom';
import {
  Grid, Jumbotron, ButtonToolbar, Button, ListGroup,
  ListGroupItem, Glyphicon, Col, Row,
} from 'react-bootstrap';

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
  return (
    <Grid>
      <Jumbotron>
        <h1>ROBOKOP</h1>
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
        </ButtonToolbar>
      </Jumbotron>
      <Jumbotron id="landingOptions">
        <h2>ROBOKOP Apps</h2>
        <ListGroup>
          <Row>
            <OptionButton
              glyph="screenshot"
              header="Question Builder"
              text="Build a new question."
              href="/question"
            />
            <OptionButton
              glyph="import"
              header="Answer Explorer"
              text="Easily upload JSON files of answersets to view them in ROBOKOP's graphical interface."
              href="/answer"
            />
          </Row>
        </ListGroup>
      </Jumbotron>
    </Grid>
  );
}
