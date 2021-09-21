import React from 'react';
import {
  render, fireEvent, waitFor, screen,
} from '&/test_utils';

import QueryBuilder from '~/pages/queryBuilder/QueryBuilder';

const mockHistoryPush = jest.fn();

jest.mock('idb-keyval', () => ({
  set: jest.fn(() => Promise.resolve({})),
}));
// mocking url history: https://stackoverflow.com/a/59451956/8250415
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));

describe('Full Workflow', () => {
  beforeEach(() => {
    // We have to override some svg functions: https://stackoverflow.com/a/66248540/8250415
    SVGElement.prototype.getComputedTextLength = () => 40;
  });
  it('asks a question', async () => {
    render(<QueryBuilder />);
    fireEvent.click(screen.getByText('Quick Submit'));
    await waitFor(() => expect(mockHistoryPush).toHaveBeenCalledWith('/answer'));
  });
});
