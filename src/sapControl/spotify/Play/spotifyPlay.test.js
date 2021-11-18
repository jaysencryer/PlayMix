import { spotifyAPIBuilder } from '../API/spotifyAPI';

afterEach(() => {
  jest.clearAllMocks();
});

const mockId = '1234';
const mockSecret = 'abcdefg';
const mockUrl = 'http://test';

const testSpotify = spotifyAPIBuilder()
  .useCredentials(mockId, mockSecret)
  .useRedirect(mockUrl)
  .useAuthorizedUrl('test')
  .build();

describe('spotifyAPI.playSong tests', () => {
  test('playSong rejects if problem', async () => {
    // the problem here is that execute.put will fail
    await expect(testSpotify.playSong()).rejects.toBeTruthy();
  });
});
