import { spotifyAPIBuilder } from './spotifyAPI';

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
};

describe('spotifyAPI.authorize() tests', () => {
  const testSpotify = spotifyAPIBuilder()
    .useCredentials(mockId, mockSecret)
    .useRedirect(mockUrl)
    .build();

  testSpotify.getAccessToken = jest.fn(() => {
    return { access_token: 'access', refresh_token: 'refresh' };
  });

  test('on spotifyAPI authorize success redirect to /spotifycomplete', async () => {
    const mockReq = {
      query: { code: 'code', state: 'state' },
      cookies: { spotify_auth_state: 'state' },
    };
    const mockRes = {
      redirect: jest.fn(),
    };

    testSpotify.spotAxios.get = () => {
      return mockProfileinfo;
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

    const response = await testSpotify.authorize(mockReq, mockRes);
    expect(response.error).toBe('Failed to authenticate spotify');
  });

  test('null returned state causes authorize error', async () => {
    const mockReq = {
      query: { code: 'code', state: null },
      cookies: { spotify_auth_state: 'state' },
    };
    const mockRes = {
      redirect: jest.fn(),
    };

    const response = await testSpotify.authorize(mockReq, mockRes);
    expect(response.error).toBe('Failed to authenticate spotify');
  });

  test('spotifyToken fails', async () => {
    const mockReq = {
      query: { code: 'code', state: 'state' },
      cookies: { spotify_auth_state: 'state' },
    };

    const failSpotify = spotifyAPIBuilder()
      .useCredentials('fail', 'fail')
      .useRedirect(mockUrl)
      .build();

    failSpotify.getAccessToken = jest.fn(() => ({ error: 'error' }));
    const response = await failSpotify.authorize(mockReq, mockRes);
    expect(response.error).toBe('Failed to retrieve spotify Token');
  });
});

describe('spotifyAPI.getAccessToken tests', () => {
  const testSpotify = spotifyAPIBuilder()
    .useCredentials(mockId, mockSecret)
    .useRedirect(mockUrl)
    .build();

  test('getAccessToken returns token', async () => {
    testSpotify.spotAxios.post = jest.fn(() => {
      return { data: { access_token: 'comein', refresh_token: 'refresh' } };
    });
    const { access_token, refresh_token } = await testSpotify.getAccessToken();
    expect(access_token).toBe('comein');
    expect(refresh_token).toBe('refresh');
  });

  test('getAccessToken returns error when invalid auth sent', async () => {
    jest.resetAllMocks();
    testSpotify.spotAxios.post = jest.fn(async () => {
      return Promise.reject({
        response: { statusText: 'Authentication Error', status: 400 },
      });
    });
    const response = await testSpotify.getAccessToken();
    expect(response?.error).toBe('Authentication Error');
  });

  test('getAccessToken returns error when it cannot communicate with spotify', async () => {
    jest.resetAllMocks();
    const response = await testSpotify.getAccessToken();
    expect(response.error).toBeDefined();
  });
});

describe('spotifyAPI.refreshAccessToken tests', () => {
  const testSpotify = spotifyAPIBuilder()
    .useCredentials(mockId, mockSecret)
    .useRedirect(mockUrl)
    .build();

  test('refreshAccessToken returns token', async () => {
    testSpotify.spotAxios.post = jest.fn(() => {
      return {
        data: { access_token: 'newtoken', refresh_token: 'newrefresh' },
      };
    });
    await testSpotify.refreshAccessToken();
    expect(testSpotify.accessToken).toBe('newtoken');
    expect(testSpotify.refreshToken).toBe('newrefresh');
  });

  test('refreshAccessToken returns error when invalid auth sent', async () => {
    jest.resetAllMocks();
    testSpotify.spotAxios.post = jest.fn(async () => {
      return Promise.reject({
        response: { statusText: 'Authentication Error', status: 400 },
      });
    });
    const response = await testSpotify.refreshAccessToken();
    expect(response?.error).toBe('Authentication Error');
  });

  test('refreshAccessToken returns error when it cannot communicate with spotify', async () => {
    jest.resetAllMocks();
    const response = await testSpotify.refreshAccessToken();
    expect(response.error).toBeDefined();
  });
});
