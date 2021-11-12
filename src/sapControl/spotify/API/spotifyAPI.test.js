import { spotifyAPIBuilder } from './spotifyAPI';

afterEach(() => {
  jest.clearAllMocks();
});

const mockId = '1234';
const mockSecret = 'abcdefg';
const mockUrl = 'http://test';

const mockAuthBuffer = Buffer.from(`${mockId}:${mockSecret}`).toString(
  'base64',
);

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
