import { spotifyAPIBuilder } from './spotifyAPI';
// import { getSpotifyToken } from '../../server/utils';

jest.mock('../../server/utils', () => {
  const originalModule = jest.requireActual('../../server/utils');

  return {
    __esModule: true,
    ...originalModule,
    getSpotifyToken: (form, auth) => {
      const failAuthBuffer = Buffer.from('fail:fail').toString('base64');
      if (auth === failAuthBuffer) return { error: 'token error' };
      return { access_token: 'access', refresh_token: 'refresh' };
    },
  };
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

test('on spotifyAPI authorize success redirect to /spotifycomplete', async () => {
  const mockReq = {
    query: { code: 'code', state: 'state' },
    cookies: { spotify_auth_state: 'state' },
  };
  const mockRes = {
    redirect: jest.fn(),
  };

  const testSpotify = spotifyAPIBuilder()
    .useCredentials(mockId, mockSecret)
    .useRedirect(mockUrl)
    .build();

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

  const testSpotify = spotifyAPIBuilder()
    .useCredentials(mockId, mockSecret)
    .useRedirect(mockUrl)
    .build();

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

  const testSpotify = spotifyAPIBuilder()
    .useCredentials(mockId, mockSecret)
    .useRedirect(mockUrl)
    .build();

  const response = await testSpotify.authorize(mockReq, mockRes);
  expect(response.error).toBe('Failed to authenticate spotify');
});

test('spotifyToken fails', async () => {
  const mockReq = {
    query: { code: 'code', state: 'state' },
    cookies: { spotify_auth_state: 'state' },
  };

  const testSpotify = spotifyAPIBuilder()
    .useCredentials('fail', 'fail')
    .useRedirect(mockUrl)
    .build();

  const response = await testSpotify.authorize(mockReq, mockRes);
  expect(response.error).toBe('Failed to retrieve spotify Token');
});
