import { source } from '../../constants/enums';
import { spotifyClientBuilder } from '../API/spotifyClient';

afterEach(() => {
  jest.clearAllMocks();
});

const mockAccessToken = 'access';
const mockRefreshToken = 'refresh';

const testSpotify = spotifyClientBuilder()
  .useTokens(mockAccessToken, mockRefreshToken)
  .build();

describe('spotifyClient.getPlayLists() tests', () => {
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

  testSpotify.spotAxios.execute.get = jest.fn((url) => {
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

    expect(testSpotify.spotAxios.execute.get).toBeCalledTimes(1);
  });

  test('If there is an error getting playlists Promise will reject', async () => {
    jest.resetAllMocks();
    await expect(testSpotify.getPlayLists()).rejects.toBeTruthy();
  });

  test('if there are more than 100 playlists limit is 50', async () => {
    jest.resetAllMocks();
    testSpotify.spotAxios.execute.get = jest.fn(() => {
      return { data: { total: 105, items: mockPlayListsFirst50 } };
    });
    await testSpotify.getPlayLists();
    expect(testSpotify.spotAxios.execute.get).toHaveBeenNthCalledWith(
      2,
      '/me/playlists?limit=50&offset=50',
    );
    expect(testSpotify.spotAxios.execute.get).toHaveBeenNthCalledWith(
      3,
      '/me/playlists?limit=5&offset=100',
    );
  });
});

describe('spotifyClient.getTracks', () => {
  const mockTrackList = [1, 2, 3, 4, 5];

  const testSpotify = spotifyClientBuilder()
    .useTokens(mockAccessToken, mockRefreshToken)
    .build();

  test('successfully return a playlists tracks', async () => {
    jest.resetAllMocks();
    testSpotify.spotAxios.execute.get = jest.fn(() => {
      return { data: mockTrackList };
    });
    const response = await testSpotify.getTracks(source.PLAYLIST, 'uri');
    expect(response).toEqual(mockTrackList);
  });

  test('Reject Promise if unknown source used', async () => {
    await expect(testSpotify.getTracks()).rejects.toBeTruthy();
    // expect(async () => await testSpotify.getTracks()).toThrow();
  });

  test('error retrieving tracks', async () => {
    jest.resetAllMocks();
    await expect(
      testSpotify.getTracks(source.PLAYLIST, 'uri'),
    ).rejects.toBeTruthy();
  });
});

describe('addSpotifyPlayList tests', () => {
  test('addSpotifyPlayList makes two calls to Spotify', async () => {
    jest.resetAllMocks();
    testSpotify.spotAxios.execute.post = jest.fn(() => ({
      data: { id: 'newplaylistid' },
    }));

    const mockUris = ['mockuri1', 'mockuri2'];

    await testSpotify.addSpotifyPlayList('test playlist', mockUris);
    expect(testSpotify.spotAxios.execute.post).toHaveBeenCalledTimes(2);
    expect(testSpotify.spotAxios.execute.post).toHaveBeenLastCalledWith(
      `/playlists/newplaylistid/tracks`,
      { uris: mockUris },
    );
  });

  test('addSpotifyPlayList rejects if array of uris not sent', async () => {
    jest.resetAllMocks();
    testSpotify.spotAxios.execute.post = jest.fn(() => ({
      data: { id: 'newplaylistid' },
    }));

    const mockuri = 'mockuri';
    const mockError = new Error(`Array of uri's must be sent`);

    await expect(
      testSpotify.addSpotifyPlayList('test playlist', mockuri),
    ).rejects.toEqual(mockError);

    expect(testSpotify.spotAxios.execute.post).not.toHaveBeenCalled();
  });
});
