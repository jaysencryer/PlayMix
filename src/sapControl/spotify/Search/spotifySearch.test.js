import { searchType as SEARCHTYPE } from '../../constants/enums';
import { spotifyAPIBuilder } from '../API/spotifyAPI';

const mockId = '1234';
const mockSecret = 'abcdefg';
const mockUrl = 'http://test';

const mockSpotifyResponseData = {
  tracks: {
    items: [
      {
        artists: [{ name: 'Rolling Stones' }, { name: 'The Beatles' }],
        name: 'Never Happened',
        uri: 'mockuri1',
      },
      {
        artists: [{ name: 'The Beatles' }],
        name: 'Get Back',
        uri: 'mockuri2',
      },
    ],
  },
};

beforeEach(() => {
  jest.resetAllMocks();
});

const testSpotify = spotifyAPIBuilder()
  .useCredentials(mockId, mockSecret)
  .useRedirect(mockUrl)
  .build();

const safeArtists = testSpotify.searchSpotifyArtists;
const safeSongs = testSpotify.searchSpotifySongs;

describe('searchSpotify tests', () => {
  //   const spotSearch = new searchSpotify();
  test('searchSpotify called with artists by type searches for artists', async () => {
    testSpotify.searchSpotifyArtists = jest.fn();
    await testSpotify.searchSpotify('test', SEARCHTYPE.ARTIST, true);
    expect(testSpotify.searchSpotifyArtists).toBeCalledWith('test');
  });

  test('searchSpotify called with artist NOT by type searches for arist', async () => {
    testSpotify.searchSpotifySongs = jest.fn();
    await testSpotify.searchSpotify('test', SEARCHTYPE.ARTIST);
    expect(testSpotify.searchSpotifySongs).toBeCalledWith(
      'test',
      SEARCHTYPE.ARTIST,
    );
  });

  test('searchSpotify called with other search type searches for tracks', async () => {
    await testSpotify.searchSpotify('test', SEARCHTYPE.GENRE);
    expect(testSpotify.searchSpotifySongs).toBeCalledWith(
      'test',
      SEARCHTYPE.GENRE,
    );
  });

  test('searchSpotify called with Tracks searches for tracks', async () => {
    await testSpotify.searchSpotify('test', SEARCHTYPE.TRACK);
    expect(testSpotify.searchSpotifySongs).toBeCalledWith('test');
  });

  test('searchSpotify called with invalid search rejects', async () => {
    const mockError = new Error('Unsupported search type invalid');

    await expect(testSpotify.searchSpotify('test', 'invalid')).rejects.toEqual(
      mockError,
    );
  });
});

describe('searchSpotifyArtists test', () => {
  const mockResponse = {
    data: { artists: { items: [{ name: 'Eminem' }, { name: 'Elton John' }] } },
  };

  test('search for artist returns artist', async () => {
    jest.restoreAllMocks();
    testSpotify.searchSpotifyArtists = safeArtists;
    testSpotify.spotAxios.execute.get = jest.fn(() => mockResponse);
    const artistList = await testSpotify.searchSpotifyArtists('test');
    expect(artistList.length).toBe(2);
    expect(testSpotify.spotAxios.execute.get).toBeCalledWith(
      `/search?query=${SEARCHTYPE.ARTIST}%3A%22test%22&type=${SEARCHTYPE.ARTIST}`,
    );
  });

  test('search for artist rejects if axios execute fails', async () => {
    jest.resetAllMocks();
    await expect(testSpotify.searchSpotifyArtists('test')).rejects.toBeTruthy();
  });
});

describe('searchSpotifySongs tests', () => {
  test('searchSpotifySongs successfully calls execute.get', async () => {
    jest.restoreAllMocks();
    testSpotify.spotAxios.execute.get = jest.fn(() => ({
      data: mockSpotifyResponseData,
    }));
    testSpotify.searchSpotifySongs = safeSongs;
    await testSpotify.searchSpotifySongs('test', SEARCHTYPE.TRACK);
    expect(testSpotify.spotAxios.execute.get).toBeCalledWith(
      `/search?query=${SEARCHTYPE.TRACK}%3Atest%20NOT%20karaoke&type=track`,
    );
  });

  test('searchSpotifySongs successfully calls sanitizedSpotifySongList', async () => {
    testSpotify.spotAxios.execute.get = jest.fn(() => ({
      data: mockSpotifyResponseData,
    }));
    const response = await testSpotify.searchSpotifySongs('test');
    console.log(response);

    // expect(testSpotify.spotAxios.execute.get).toHaveBeenCalled();
    expect(response.length).toBe(2);
    expect(response[0].title).toBe('Never Happened');
  });

  test('searchSpotifySongs rejects if error encountered', async () => {
    jest.restoreAllMocks();
    await expect(testSpotify.searchSpotifySongs('test')).rejects.toBeTruthy();
  });
});
