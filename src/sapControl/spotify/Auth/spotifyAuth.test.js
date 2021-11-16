import { spotifyAPIBuilder } from '../API/spotifyAPI';

afterEach(() => {
  jest.clearAllMocks();
});

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
    const mockReq = {
      query: { code: 'code', state: 'state' },
      cookies: { spotify_auth_state: 'state' },
    };

    await testSpotify.authorize(mockReq, mockRes);

    expect(mockRes.redirect).toBeCalledWith('/spotifycomplete');
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
