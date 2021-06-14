import React from 'react';
import { render } from '@testing-library/react';

import QueryBuilder from '~/pages/queryBuilder/QueryBuilder';

describe('Full Workflow', () => {
  it('asks a question', () => {
    const { getByText } = render(<QueryBuilder />);
    expect(true).toBe(true);
  });
});
