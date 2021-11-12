import { spotifyAPIBuilder } from '../API/spotifyAPI';
import { source } from '../../constants/enums';

afterEach(() => {
  jest.clearAllMocks();
});

const mockId = '1234';
const mockSecret = 'abcdefg';
const mockUrl = 'http://test';

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

  test('If there is an error getting playlists Promise will reject', async () => {
    jest.resetAllMocks();
    await expect(testSpotify.getPlayLists()).rejects.toBeTruthy();
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
    expect(async () => await testSpotify.getTracks()).toThrow();
  });

  test('error retrieving tracks', async () => {
    jest.resetAllMocks();
    await expect(
      testSpotify.getTracks(source.PLAYLIST, 'uri'),
    ).rejects.toBeTruthy();
  });
});
