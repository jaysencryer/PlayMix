import { render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import React from 'react';

import useSpotifyController from './useSpotifyController';

const mockProfile = {
  accessToken: 'access',
  refreshToken: 'refresh',
};

const TestComponent = (profile) => {
  const { spotifyClient, spotifyProfile, initialized } =
    useSpotifyController(profile);
  console.log(spotifyClient);
  console.log(spotifyProfile);

  if (!initialized) {
    return <>Nothing</>;
  }

  return (
    <>
      {spotifyClient?.spotAxios && <div data-testid="axios-present">Axios</div>}
    </>
  );
};

describe('useSpotifyController hook tests', () => {
  test('builds spotify client', async () => {
    await act(async () => render(<TestComponent profile={mockProfile} />));
    screen.debug();
    // const axiosPresent = screen.getByTestId('axios-present');
    // screen.debug();
    // expect(axiosPresent).toBeInTheDocument();
  });
});
