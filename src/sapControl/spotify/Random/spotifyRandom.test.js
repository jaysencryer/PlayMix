import { searchType as SEARCHTYPE } from '../../constants/enums';
import { selectRandomSpotifySong } from './spotifyRandom';
import { spotifyClientBuilder } from '../API/spotifyClient';

afterEach(() => {
  jest.clearAllMocks();
});

const mockAccessToken = 'access';
const mockRefreshToken = 'refresh';

const testSpotify = spotifyClientBuilder()
  .useTokens(mockAccessToken, mockRefreshToken)
  .build();

const saveOriginalFunction = testSpotify.selectRandomSpotifySong;

describe('spotifyClient.getRandomSong tests', () => {
  test('getRandomSong selects a Random song', async () => {
    testSpotify.selectRandomSpotifySong = jest.fn();
    await testSpotify.getRandomSong('test', SEARCHTYPE.ARTIST);
    expect(testSpotify.selectRandomSpotifySong).toHaveBeenCalledWith(
      'test',
      SEARCHTYPE.ARTIST,
    );
  });

  test('getRandomSong defaults to TRACK if searchType not specified', async () => {
    testSpotify.selectRandomSpotifySong = jest.fn();
    await testSpotify.getRandomSong('test');
    expect(testSpotify.selectRandomSpotifySong).toHaveBeenCalledWith(
      'test',
      SEARCHTYPE.TRACK,
    );
  });

  test('getRandomSong with invalid search type rejects', async () => {
    testSpotify.selectRandomSpotifySong = jest.fn();
    const mockError = new Error('Unsupported search type invalid search');
    await expect(
      testSpotify.getRandomSong('test', 'invalid search'),
    ).rejects.toEqual(mockError);
  });

  test('getRandomSong with no params search defaults to a random 2 character string', async () => {
    testSpotify.selectRandomSpotifySong = jest.fn();
    await testSpotify.getRandomSong();
    const randomString = testSpotify.selectRandomSpotifySong.mock.calls[0][0];
    expect(typeof randomString).toBe('string');
    expect(randomString.length).toBe(2);
  });

  test('getRandomSong rejects if no Spotify', async () => {
    testSpotify.selectRandomSpotifySong = saveOriginalFunction;
    testSpotify.spotAxios.execute.get = jest.fn(() => Promise.reject('reject'));
    await expect(testSpotify.getRandomSong()).rejects.toBe('reject');
  });
});

describe('selectRandomSpotifySong tests', () => {
  const mockReturn = {
    data: {
      tracks: {
        total: 2,
        items: [
          {
            artists: [{ name: 'Rolling Stones' }, { name: 'The Beatles' }],
            track: {
              name: 'Never Happened',
              uri: 'mockuri1',
            },
          },
          {
            artists: [{ name: 'The Beatles' }],
            track: {
              name: 'Get Back',
              uri: 'mockuri2',
            },
          },
        ],
      },
    },
  };

  test('selectRandomSpotifySong returns a random song', async () => {
    testSpotify.spotAxios.execute.get = jest.fn(() => mockReturn);

    const returnedSong = await testSpotify.selectRandomSpotifySong(
      'type',
      SEARCHTYPE.TRACK,
    );
    expect(returnedSong.track).not.toBe('Get Back' || 'Never Happened');
  });

  test('selectRandomSpotifySong still works over 1000 songs', async () => {
    testSpotify.spotAxios.execute.get = jest.fn(() => ({
      data: {
        tracks: {
          total: 2000,
          items: [{ artists: [], track: {} }],
        },
      },
    }));

    const returnedSong = await testSpotify.selectRandomSpotifySong(
      'test',
      SEARCHTYPE.TRACK,
    );
    expect(returnedSong.track).toEqual({});
  });
});
