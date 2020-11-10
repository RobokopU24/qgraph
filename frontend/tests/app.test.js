import React from 'react';
import {
  render,
} from '@testing-library/react';

import App from '../src/App';

describe('<App />', () => {
  it('loads page and shows welcome', async () => {
    const { getByText } = render(<App />);
    expect(getByText('Robokop Aps')).toBeTruthy();
  });
});
