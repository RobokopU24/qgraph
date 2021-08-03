import React from 'react';
import {
  render, screen, waitFor,
} from '&/test_utils';

import mockAxios from '&/axios';
import App from '~/App';
import biolink from '&/biolink_model.json';

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
  it('loads the Robokop homepage', async () => {
    jest.clearAllMocks();
    process.env.BRAND = 'robokop';
    const biolinkCall = mockAxios.mockResponse(biolink);
    render(<App />);
    await waitFor(() => expect(biolinkCall).toHaveBeenCalledTimes(1));
    expect(screen.getByText('ROBOKOP Apps')).toBeTruthy();
  });
  it('loads the qgraph query builder', async () => {
    jest.clearAllMocks();
    const biolinkCall = mockAxios.mockResponse(biolink);
    render(<App />);
    await waitFor(() => expect(biolinkCall).toHaveBeenCalledTimes(1));
    expect(screen.getByText('Quick Submit')).toBeTruthy();
  });
});
