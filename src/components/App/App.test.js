import * as React from 'react';
import '@testing-library/jest-dom/extend-expect';

import { App } from './App';

import { render, screen } from '@testing-library/react';

const mockSpotProfile = {
  user: 'testUser',
  avatar: 'mockAvater',
};

const mockSessionData = {
  authorized: true,
};

describe('App', () => {
  it('renders', () => {
    render(<App initialData={{ appName: 'TEST' }} />);
  });

  it('renders main app once user authorized connected', () => {
    render(
      <App
        initialData={{
          appName: 'TEST',
          sessionData: mockSessionData,
          spotifyProfile: mockSpotProfile,
        }}
      />,
    );
    const authorized = screen.getByTestId('authorized-view');

    expect(authorized).toBeInTheDocument();
  });

  test('renders connect to spotify button if not-authorized', () => {
    render(
      <App
        initialData={{
          appName: 'TEST',
        }}
      />,
    );
    const unauthorized = screen.getByTestId('not-authorized');

    expect(unauthorized).toBeInTheDocument();
  });
});
