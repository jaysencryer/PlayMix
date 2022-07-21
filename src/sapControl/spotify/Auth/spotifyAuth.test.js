import { spotifyAPIBuilder } from '../API/spotifyAPI';

import axios from 'axios';
import { uriEncode } from '../../helpers/helpers';

afterEach(() => {
  jest.clearAllMocks();
});

jest.mock('axios');

const mockId = '1234';
const mockSecret = 'abcdefg';
const mockUrl = 'http://test';
const mockProfileinfo = {
  data: {
    id: '9876',
    display_name: 'test user',
    images: [{ url: 'http://image.png' }],
  },
};

const mockTokenResponse = {
  data: {
    access_token: 'access',
    refresh_token: 'refresh',
  },
};

const mockRes = {
  redirect: jest.fn(),
  cookie: jest.fn(),
};

describe('spotifyAPI.authorize() tests', () => {
  const testSpotify = spotifyAPIBuilder()
    .useCredentials(mockId, mockSecret)
    .useRedirect(mockUrl)
    .useAuthorizedUrl('/spotifycomplete')
    .build();

  testSpotify.spotAxios = {
    getAccessToken: () => jest.fn(),
    initialize: () => jest.fn(),
    execute: {
      get: jest.fn((url) => {
        if (url === '/me') {
          return mockProfileinfo;
        }
      }),
      post: jest.fn(),
    },
  };

  test('on spotifyAPI authorize success redirect to /spotifycomplete', async () => {
    jest.resetAllMocks();
    axios.post = jest.fn(() => mockTokenResponse);
    const mockReq = {
      query: { code: 'code', state: 'state' },
      cookies: { spotify_auth_state: 'state' },
    };

    const response = await testSpotify.authorize(mockReq, mockRes);

    expect(response).toEqual({
      authorizedUrl: '/spotifycomplete',
      accessToken: 'access',
      refreshToken: 'refresh',
    });
  });

  test('mismatching state causes authorize error', async () => {
    const mockReq = {
      query: { code: 'code', state: 'mis matched state' },
      cookies: { spotify_auth_state: 'state' },
    };
    const mockRes = {
      redirect: jest.fn(),
    };

    await expect(testSpotify.authorize(mockReq, mockRes)).rejects.toBe(
      'Failed to authenticate Spotify',
    );
  });

  test('null returned state causes authorize error', async () => {
    const mockReq = {
      query: { code: null, state: null },
      cookies: { spotify_auth_state: 'state' },
    };

    await expect(testSpotify.authorize(mockReq, mockRes)).rejects.toBe(
      'Failed to authenticate Spotify',
    );
  });

  test('empty cookie causes authorize error', async () => {
    const mockReq = {
      query: { code: 'code', state: 'state' },
    };

    await expect(testSpotify.authorize(mockReq, mockRes)).rejects.toBe(
      'Failed to authenticate Spotify',
    );
  });
});

describe('spotifyAPI.connect() tests', () => {
  const testSpotify = spotifyAPIBuilder()
    .useCredentials(mockId, mockSecret)
    .useRedirect(mockUrl)
    .useAuthorizedUrl('/spotifycomplete')
    .build();

  test('spotifyAPI/connect sets cookie and calls redirect', () => {
    testSpotify.connect(mockRes);
    expect(mockRes.cookie).toHaveBeenCalledTimes(1);
    expect(mockRes.redirect).toHaveBeenCalledTimes(1);
  });
});

describe('spotifyAPI.getAccessToken/refreshAccesToken tests', () => {
  const testSpotify = spotifyAPIBuilder()
    .useCredentials(mockId, mockSecret)
    .useRedirect(mockUrl)
    .useAuthorizedUrl('/spotifycomplete')
    .build();
  test('calls getAccessToken with correct body', async () => {
    const mockRefreshBody = uriEncode({
      grant_type: 'refresh_token',
      refresh_token: 'refresh',
    });

    const saveFunction = testSpotify.getAccessToken;
    testSpotify.getAccessToken = jest.fn();
    await testSpotify.refreshAccessToken('refresh');
    expect(testSpotify.getAccessToken).toBeCalledWith(mockRefreshBody);
    testSpotify.getAccessToken = saveFunction;
  });

  test('getAccessToken returns tokens', async () => {
    axios.post = jest.fn(() => mockTokenResponse);

    const response = await testSpotify.getAccessToken();
    expect(response).toEqual({
      authorizedUrl: '/spotifycomplete',
      accessToken: 'access',
      refreshToken: 'refresh',
    });
  });

  test('getAccessToken rejects if Axios fails', async () => {
    axios.post = jest.fn(() => Promise.reject());
    expect(testSpotify.getAccessToken).rejects.toBeTruthy();
  });
});
