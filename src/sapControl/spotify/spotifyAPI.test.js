import { spotifyAPIBuilder } from './spotifyAPI';
import { source } from '../../constants/enums';

// jest.mock('../../server/utils', () => {
//   const originalModule = jest.requireActual('../../server/utils');

//   return {
//     __esModule: true,
//     ...originalModule,
//     getSpotifyToken: (form, auth) => {
//       const failAuthBuffer = Buffer.from('fail:fail').toString('base64');
//       if (auth === failAuthBuffer) return { error: 'token error' };
//       return { access_token: 'access', refresh_token: 'refresh' };
//     },
//   };
// });

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

const mockAuthBuffer = Buffer.from(`${mockId}:${mockSecret}`).toString(
  'base64',
);

const mockRes = {
  redirect: jest.fn(),
};

describe('spotifyAPIBuilder() tests', () => {
  test('We can build a spotifyAPI object', () => {
    const testSpotify = spotifyAPIBuilder()
      .useCredentials(mockId, mockSecret)
      .useRedirect(mockUrl)
      .build();

    expect(testSpotify.redirectUrl).toBe(mockUrl);
  });

  test('useCredentials encodes id and secret', () => {
    const testSpotify = spotifyAPIBuilder()
      .useCredentials(mockId, mockSecret)
      .useRedirect(mockUrl)
      .build();

    expect(testSpotify.authBuffer).toBe(mockAuthBuffer);
  });

  test('not using credentials throws an error', () => {
    expect(() => spotifyAPIBuilder().build()).toThrowError(
      'spotifyAPI cannot build object - clientId undefined or null.  Did you specify a clientId & clientSecret? with useCredentials()',
    );
  });

  test('not using useRedirect throws an error', () => {
    expect(() =>
      spotifyAPIBuilder().useCredentials(mockId, mockSecret).build(),
    ).toThrowError(
      'spotifyAPI cannot build object - redirectUrl not defined or null.  Did you specify a redirectUrl with useRedirect()',
    );
  });
});

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

describe('spotifyAPI.getPlayLists() tests', () => {
  const mockPlayListsFirst50 = [
    { name: '1' },
    { name: '2' },
    { name: '3' },
    { name: '4' },
    { name: '5' },
  ];
  const mockPlayListsSecond50 = [
    { name: '6' },
    { name: '7' },
    { name: '8' },
    { name: '9' },
    { name: '10' },
  ];

  const testSpotify = spotifyAPIBuilder()
    .useCredentials(mockId, mockSecret)
    .useRedirect(mockUrl)
    .build();

  testSpotify.spotAxios.get = jest.fn((url) => {
    const queryString = new URLSearchParams(url.split('?')[1]);
    const offset = queryString.get('offset');
    if (!offset) {
      return { data: { total: 10, items: mockPlayListsFirst50 } };
    }
    return { data: { total: 10, items: mockPlayListsSecond50 } };
  });

  test('All playlists can be retrieved', async () => {
    const response = await testSpotify.getPlayLists();
    expect(response.length).toBe(10);
    expect(response[0]?.name).toEqual(mockPlayListsFirst50[0]?.name);
    expect(response[9]?.name).toEqual(mockPlayListsSecond50[4]?.name);
  });

  test('If we already have all playlists, return early', async () => {
    jest.clearAllMocks();
    testSpotify.playLists = [...mockPlayListsFirst50, ...mockPlayListsSecond50];
    await testSpotify.getPlayLists();

    expect(testSpotify.spotAxios.get).toBeCalledTimes(1);
  });

  test('If there is an error getting playlists return error', async () => {
    jest.resetAllMocks();
    const response = await testSpotify.getPlayLists();
    expect(response.error).toBeDefined();
  });
});

describe('spotifyAPI.getTracks', () => {
  const mockTrackList = [1, 2, 3, 4, 5];

  const testSpotify = spotifyAPIBuilder()
    .useCredentials(mockId, mockSecret)
    .useRedirect(mockUrl)
    .build();

  test('successfully return a playlists tracks', async () => {
    jest.resetAllMocks();
    testSpotify.spotAxios.get = jest.fn(() => {
      return { data: mockTrackList };
    });
    const response = await testSpotify.getTracks(source.PLAYLIST, 'uri');
    expect(response).toEqual(mockTrackList);
  });

  test('throw error if unknown source used', async () => {
    try {
      await testSpotify.getTracks();
    } catch (err) {
      expect(err).toBe('Unknown Source');
    }
  });

  test('error retrieving tracks', async () => {
    jest.resetAllMocks();
    const response = await testSpotify.getTracks(source.PLAYLIST, 'uri');
    expect(response.error).toBeDefined();
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
