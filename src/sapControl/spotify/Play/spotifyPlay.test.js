import { spotifyAPIBuilder } from '../API/spotifyAPI';
import { spotifyClientBuilder } from '../API/spotifyClient';

afterEach(() => {
  jest.clearAllMocks();
});

const mockAccessToken = 'access';
const mockRefreshToken = 'refresh';

const testSpotify = spotifyClientBuilder()
  .useTokens(mockAccessToken, mockRefreshToken)
  .build();

describe('spotifyClient.playSong tests', () => {
  const mockUris = ['ur1', 'uri2'];
  test('playSong rejects if no uris sent', async () => {
    await expect(testSpotify.playSong()).rejects.toBeTruthy();
  });

  test('playSong rejects if axios throws an error', async () => {
    const mockError = new Error('spotify mock error');
    testSpotify.spotAxios.execute.put = jest.fn(() => {
      throw mockError;
    });
    await expect(testSpotify.playSong(mockUris)).rejects.toBe(mockError);
  });

  test('playSong works correctly if uri array sent', async () => {
    const mockResponse = { status: 204 };

    testSpotify.spotAxios.execute.put = jest.fn(() => mockResponse);
    await expect(testSpotify.playSong(mockUris)).resolves;
  });
});
