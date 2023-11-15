import React from 'react';
import { Link } from 'react-router-dom';
import './footer.css';

export default function Footer() {
  return (
    <footer>
      <p>
        ROBOKOP is a joint creation of <a href="http://www.renci.org" target="_blank" rel="noreferrer">RENCI</a>{' '}
        and <a href="http://www.covar.com" target="_blank" rel="noreferrer">CoVar LLC</a>. Early development was{' '}
        supported by <a href="https://ncats.nih.gov" target="_blank" rel="noreferrer">NCATS</a>; continued{' '}
        development is supported by <a href="https://niehs.nih.gov" target="_blank" rel="noreferrer">NIEHS</a> and{' '}
        the <a href="https://www.nih.gov/" target="_blank" rel="noreferrer">NIH</a>{' '}
        <a href="https://datascience.nih.gov/about/odss" target="_blank" rel="noreferrer">ODSS</a>.{' '}
        <Link to="/termsofservice">Terms of Service</Link>.
      </p>
    </footer>
  );
}
