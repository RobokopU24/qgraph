import React, { useContext } from 'react';

import { Grid, Row, Col } from 'react-bootstrap';

import BrandContext from '~/context/brand';

import './footer.css';

export default function Footer() {
  const brandConfig = useContext(BrandContext);

  return (
    <div className="footer">
      <Grid>
        <Row>
          <Col md={12}>
            <p>
              {brandConfig.title} is a joint creation
              of <a href="http://www.renci.org">RENCI</a> and <a href="http://www.covar.com">CoVar</a> with
              funding from the <a href="https://ncats.nih.gov">U.S. NIH NCATS</a> as part
              of the <a href="https://ncats.nih.gov/translator">Biomedical Data Translator</a>.
              See our <a href="/termsofservice">Terms of Service</a>.
            </p>
          </Col>
        </Row>
      </Grid>
    </div>
  );
}
