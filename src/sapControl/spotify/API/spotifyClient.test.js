import { spotifyClientBuilder } from './spotifyClient';

afterEach(() => {
  jest.clearAllMocks();
});

const mockAccessToken = 'access';
const mockRefreshToken = 'refresh';

describe('spotifyClientBuilder() tests', () => {
  test('We can build a spotifyClient object', () => {
    const testSpotify = spotifyClientBuilder()
      .useTokens(mockAccessToken, mockRefreshToken)
      .build();

    expect(testSpotify.accessToken).toBe(mockAccessToken);
    expect(testSpotify.refreshToken).toBe(mockRefreshToken);
  });

  test('not sending accessToken throws an error', () => {
    expect(() => spotifyClientBuilder().build()).toThrowError(
      'spotifyClient cannot build object - no accessToken.  Did you specify an accessToken with useTokens()',
    );
  });

  test('not sending refreshToken throws an error', () => {
    expect(() =>
      spotifyClientBuilder().useTokens(mockAccessToken).build(),
    ).toThrowError(
      'spotifyClient cannot build object - no refreshToken.  Did you specify a refreshToken with useTokens()',
    );
  });

  test('configureSpotifyProfile returns user Id and username', async () => {
    const mockId = 1234;
    const mockUserName = 'test user';
    const mockAvatar = 'imageurl';
    const mockProfileData = {
      data: {
        id: mockId,
        display_name: mockUserName,
        images: [{ url: mockAvatar }],
      },
    };
    const testSpotify = spotifyClientBuilder()
      .useTokens(mockAccessToken, mockRefreshToken)
      .build();
    testSpotify.spotAxios.execute.get = jest.fn(() => mockProfileData);
    await testSpotify.configureSpotifyProfile();
    expect(testSpotify.userId).toBe(mockId);
    expect(testSpotify.user).toBe(mockUserName);
    expect(testSpotify.avatar).toBe(mockAvatar);
  });
});
