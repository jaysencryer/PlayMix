import { act, render, screen } from '@testing-library/react';
import React from 'react';

import useSpotifyController from './useSpotifyController';

const mockProfile = {
  accessToken: 'access',
  refreshToken: 'refresh',
};

const TestComponent = (profile) => {
  const { spotifyClient, spotifyProfile } = useSpotifyController(profile);
  console.log(spotifyClient);
  console.log(spotifyProfile);
  return (
    <>
      {spotifyClient?.spotAxios && <div data-testid="axios-present">Axios</div>}
    </>
  );
};

describe('useSpotifyController hook tests', () => {
  test('builds spotify client', async () => {
    await act(async () => render(<TestComponent profile={mockProfile} />));
    const axiosPresent = screen.getByTestId('axios-present');
    expect(axiosPresent).toBeInTheDocument();
  });
});
