/**
 * https://testing-library.com/docs/react-testing-library/setup#custom-render
 */
import React from 'react';
import { render } from '@testing-library/react';

import UserContext from '~/context/user';
import AlertContext from '~/context/alert';
import BiolinkContext from '~/context/biolink';

function ProviderWrapper({ children }) {
  return (
    <AlertContext.Provider value={{}}>
      <UserContext.Provider value={{}}>
        <BiolinkContext.Provider value={{}}>
          {children}
        </BiolinkContext.Provider>
      </UserContext.Provider>
    </AlertContext.Provider>
  );
}

function customRender(ui, options) {
  return render(ui, { wrapper: ProviderWrapper, ...options });
}

// re-export all testing library functions
export * from '@testing-library/react';
// override render function with provider wrapper
export { customRender as render };
