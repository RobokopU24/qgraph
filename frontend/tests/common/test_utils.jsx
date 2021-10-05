/**
 * https://testing-library.com/docs/react-testing-library/setup#custom-render
 */
import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';

import AlertContext from '~/context/alert';
import BiolinkContext from '~/context/biolink';

import biolink from './biolink.json';

// We need to mock the whole Auth0 provider so it doesn't try and use
// window.crypto
// https://github.com/auth0/auth0-react/issues/248#issuecomment-840478152
jest.mock('@auth0/auth0-react', () => ({
  Auth0Provider: ({ children }) => (
    <div>{children}</div>
  ),
  useAuth0: () => ({
    isLoading: false,
    isAuthenticated: true,
    loginWithPopup: jest.fn(),
  }),
}));

biolink.colorMap = jest.fn();

function ProviderWrapper({ children }) {
  return (
    <MemoryRouter>
      <Auth0Provider>
        <AlertContext.Provider value={jest.fn}>
          <BiolinkContext.Provider value={biolink}>
            {children}
          </BiolinkContext.Provider>
        </AlertContext.Provider>
      </Auth0Provider>
    </MemoryRouter>
  );
}

function customRender(ui, options) {
  return render(ui, { wrapper: ProviderWrapper, ...options });
}

// re-export all testing library functions
export * from '@testing-library/react';
// override render function with provider wrapper
export { customRender as render };
