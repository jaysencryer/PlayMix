import { searchType as SEARCHTYPE } from '../../constants/enums';
import { spotifyAPIBuilder } from '../API/spotifyAPI';

const mockId = '1234';
const mockSecret = 'abcdefg';
const mockUrl = 'http://test';

const testSpotify = spotifyAPIBuilder()
  .useCredentials(mockId, mockSecret)
  .useRedirect(mockUrl)
  .build();

describe('searchSpotify tests', () => {
  //   const spotSearch = new searchSpotify();
  test('searchSpotify called with artists searches for artists', () => {
    testSpotify.searchSpotifyArtists = jest.fn();
    const result = testSpotify.searchSpotify('test', SEARCHTYPE.ARTIST, true);
    console.log(result);
    expect(testSpotify.searchSpotifyArtists).toBeCalled();
  });
});
