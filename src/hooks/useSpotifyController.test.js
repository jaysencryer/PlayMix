import { queryByTestId, render, screen } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import axios from 'axios';
import React from 'react';
import { spotifyClientBuilder } from '../sapControl/spotify/API/spotifyClient';

import useSpotifyController from './useSpotifyController';

const mockProfile = {
  accessToken: 'access',
  refreshToken: 'refresh',
};

const mockConfigureSpotifyProfile = jest.fn();

const mockSpotifyClient = function () {
  return { configureSpotifyProfile: mockConfigureSpotifyProfile };
};

jest.mock('axios');
jest.mock('../sapControl/spotify/API/spotifyClient');

// axios.post.mockImplementation(() => {})
axios.get.mockImplementation(() => ({
  data: { display_name: 'test user', id: 12345, images: [{ url: 'myurl' }] },
}));

spotifyClientBuilder.mockImplementation(() => {
  return {
    useTokens: function () {
      return this;
    },
    build: function () {
      return mockSpotifyClient;
    },
  };
});
const TestComponent = ({ profile }) => {
  const { spotifyClient, spotifyProfile } = useSpotifyController(profile);
  return <>{spotifyClient && <div data-testid="axios-present">Axios</div>}</>;
};

describe('useSpotifyController hook tests', () => {
  test('builds spotify client', async () => {
    await act(async () => render(<TestComponent profile={mockProfile} />));
    const axiosPresent = screen.getByTestId('axios-present');
    expect(axiosPresent).toBeTruthy();
  });
});
