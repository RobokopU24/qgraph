import React from 'react';
import {
  render,
} from '@testing-library/react';

import App from '../src/App';

// needed for web worker import
jest.mock('~/pages/answer/fullKg/simulation.worker.js');

describe('<App />', () => {
  it('loads page and shows welcome', async () => {
    const { getByText } = render(<App />);
    expect(getByText('Robokop Apps')).toBeTruthy();
  });
});
