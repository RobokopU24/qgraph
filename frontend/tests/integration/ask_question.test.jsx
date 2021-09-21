import React from 'react';
import axios from 'axios';
import userEvent from '@testing-library/user-event';
import {
  render, waitFor, screen,
} from '&/test_utils';

import App from '~/App';

// needed for web worker import
jest.mock('~/pages/answer/fullKg/simulation.worker.js');
// https://jestjs.io/docs/timer-mocks#run-pending-timers
jest.mock('idb-keyval', () => {
  const saved_message = require('&/test_message.json');
  return {
    set: jest.fn()
      .mockImplementationOnce(() => Promise.resolve()),
    get: jest.fn()
      .mockImplementation(() => Promise.resolve(JSON.stringify(saved_message))),
  };
});

describe('Full question workflow', () => {
  beforeEach(() => {
    // We have to override some svg functions: https://stackoverflow.com/a/66248540/8250415
    SVGElement.prototype.getComputedTextLength = () => 40;
    window.open = () => ({
      document: {
        write: jest.fn(),
      },
    });
  });
  afterEach(() => {
    jest.clearAllMocks();
  })
  it('successfully asks a question', async () => {
    const spyPost = jest.spyOn(axios, 'post');
    render(<App />);

    // submit question
    userEvent.click(screen.getByText('Quick Submit'));
    await waitFor(() => expect(spyPost).toHaveBeenCalledTimes(1));

    // answer page loaded, check that things showed up
    await waitFor(() => screen.findByRole('button', { name: 'Bubble Chart' }));
    expect(await screen.queryByRole('cell', { name: 'Ebola Hemorrhagic Fever' })).toBeTruthy();
    expect(await screen.queryByRole('cell', { name: 'NPC1' })).toBeTruthy();
  });
});
