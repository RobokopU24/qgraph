import React from 'react';
import renderer from 'react-test-renderer';

import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import Landing from '@/src/pages/Landing';

it('loads page and shows welcome', async () => {
  render(<Landing />);

  await waitFor(() => screen.getByRole('heading'));

  expect(screen.getByRole('heading')).toHaveTextContent('Robokop');

});
