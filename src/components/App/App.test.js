import * as React from 'react';
import '@testing-library/jest-dom/extend-expect';

import { App } from './App';

import { render } from '@testing-library/react';

const mockSpotProfile = {
  user: 'testUser',
  avater: 'mockAvater',
};

describe('App', () => {
  it('renders', () => {
    render(<App initialData={{ appName: 'TEST' }} />);
  });

  it('renders main app once spotify connected', () => {
    render(
      <App
        initialData={{
          appName: 'TEST',
          spotAuthorized: true,
          spotifyProfile: mockSpotProfile,
        }}
      />,
    );
  });
});
