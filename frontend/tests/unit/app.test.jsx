import React from 'react';
import {
  render, screen,
} from '&/test_utils';

import App from '~/App';

// needed for web worker import
jest.mock('~/pages/answer/fullKg/simulation.worker.js');

describe('<App />', () => {
  // https://stackoverflow.com/a/48042799/8250415
  const OLD_ENV = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...OLD_ENV };
    // We have to override some svg functions: https://stackoverflow.com/a/66248540/8250415
    SVGElement.prototype.getComputedTextLength = () => 40;
  });
  afterEach(() => {
    process.env = OLD_ENV;
  });
  it('loads the Robokop homepage', () => {
    process.env.BRAND = 'robokop';
    render(<App />);
    expect(screen.getByText('Robokop Apps')).toBeTruthy();
  });
  it('loads the qgraph query builder', () => {
    render(<App />);
    expect(screen.getByText('Quick Submit')).toBeTruthy();
  });
});
