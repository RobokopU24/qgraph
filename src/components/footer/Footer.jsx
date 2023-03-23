import React from 'react';

import { Grid, Row, Col } from 'react-bootstrap';

import './footer.css';

export default function Footer() {
  return (
    <div className="footer">
      <Grid>
        <Row>
          <Col md={12}>
            <p>
              ROBOKOP is a joint creation of <a href="http://www.renci.org" target="_blank">RENCI</a>{" "} 
              and <a href="http://www.covar.com" target="_blank">CoVar</a>. Early development was 
              supported by the <a href="https://ncats.nih.gov" target="_blank">NCATS</a> and continued 
              development is supported by the <a href="niehs.nih.gov" target="_blank">NIEHS</a> and{" "}
              <a href="https://datascience.nih.gov/about/odss" target="_blank">ODSS</a> within the{" "}
              <a href="https://www.nih.gov/" target="_blank">NIH</a>. <a href="/termsofservice">Terms of Service</a>.
            </p>
          </Col>
        </Row>
      </Grid>
    </div>
  );
}
