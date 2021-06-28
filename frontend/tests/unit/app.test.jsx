import React from 'react';
import {
  render, screen,
} from '&/test_utils';

import App from '~/App';

// needed for web worker import
jest.mock('~/pages/answer/fullKg/simulation.worker.js');

describe('<App />', () => {
  it('loads page and shows welcome', async () => {
    render(<App />);
    expect(screen.getByText('Robokop Apps')).toBeTruthy();
  });
});
