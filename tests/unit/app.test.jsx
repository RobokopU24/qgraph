import React from 'react';
import axios from 'axios';
import { rest } from 'msw';
import '@testing-library/jest-dom';
import {
  render, screen, waitFor,
} from '&/test_utils';
import server from '&/mocks/server';

import App from '~/App';

// needed for web worker import
jest.mock('~/pages/answer/fullKg/simulation.worker.js');

describe('<App />', () => {
  beforeEach(() => {
    // We have to override some svg functions: https://stackoverflow.com/a/66248540/8250415
    SVGElement.prototype.getComputedTextLength = () => 40;
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('loads the Robokop homepage', async () => {
    const spy = jest.spyOn(axios, 'get');
    server.use(
      rest.get('/api/biolink', (req, res, ctx) => res(
        ctx.status(404),
      )),
    );
    render(<App />);
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));
    await waitFor(() => screen.findByText(/Failed to contact server to download biolink model/i));
    expect(screen.findByText('ROBOKOP')).toBeTruthy();
    expect(screen.getByText(/robokop apps/i)).toBeInTheDocument();
  });
});
