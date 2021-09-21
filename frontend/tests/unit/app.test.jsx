import React from 'react';
import axios from 'axios';
import {
  render, screen, waitFor,
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
    jest.clearAllMocks();
  });
  it('loads the Robokop homepage', async () => {
    const spy = jest.spyOn(axios, 'get');
    process.env.BRAND = 'robokop';
    render(<App />);
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));
    expect(screen.findByText('ROBOKOP Apps')).toBeTruthy();
  });
  it('loads the qgraph query builder', async () => {
    const spy = jest.spyOn(axios, 'get');
    render(<App />);
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));
    expect(screen.findByText('Quick Submit')).toBeTruthy();
  });
});
