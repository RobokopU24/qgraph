import React from 'react';
import { GoQuestion } from 'react-icons/go';

const HelpButton = ({ link }) => (
  <a href={`/help#${link}`} rel="noreferrer" target="_blank" style={{ color: 'black' }}>
    <GoQuestion />
  </a>
);

export default HelpButton;
