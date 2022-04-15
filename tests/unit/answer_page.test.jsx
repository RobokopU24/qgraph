import React from 'react';
import { render, screen } from '&/test_utils';

import Answer from '~/pages/answer/Answer';

// needed for web worker import
jest.mock('~/pages/answer/fullKg/simulation.worker.js');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: jest.fn().mockReturnValue({
    pathname: '/another-route',
    search: '',
    hash: '',
    state: null,
    key: '5nvxpbdafa',
  }),
  useRouteMatch: jest.fn().mockReturnValue({
    params: {},
  }),
}));
jest.mock('idb-keyval', () => ({
  set: jest.fn(() => Promise.resolve({})),
  get: jest.fn(() => Promise.resolve(undefined)),
}));

describe('Answer Page', () => {
  it('renders', async () => {
    render(<Answer />);
    expect(await screen.findByText('Please upload an answer')).toBeTruthy();
  });
});
