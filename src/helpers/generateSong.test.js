import {
  generateSong,
  generateSongList,
  mapTracksToSongUris,
} from './generateSong';
import { source, trackType, trackMode } from '../sapControl/constants/enums';

afterEach(() => {
  jest.clearAllMocks();
});

const mockArtistTrack = {
  type: trackType.RANDOM,
  mode: trackMode.ARTIST,
  label: 'Nate Dogg',
  id: 1,
};

const mockGenreTrack = {
  type: trackType.RANDOM,
  mode: trackMode.GENRE,
  label: 'classical',
  id: 1,
};

const mockTrack = {
  type: trackType.RANDOM,
  mode: trackMode.SPOTIFY,
};

const mockPlayListTrack = {
  type: trackType.RANDOM,
  mode: trackMode.PLAYLIST,
  uri: ['mock:uri:1'],
  label: 'All Playlists',
};

const mockPlayLists = [
  { uri: 'mock:playlist:uri1' },
  { uri: 'mock:playlist:uri2' },
  { uri: 'mock:playlist:uri3' },
];

const mockSong = {
  name: 'never gonna give you up',
  uri: 'spotify:12345:abcdefghijklmnopqrstuv',
  id: 'abc',
};

const mockGetTrackResponse = {
  items: [{ track: mockSong }],
};

const mockClient = {
  playLists: [],
  getPlayLists: jest.fn().mockReturnValue(mockPlayLists),
  getRandomSong: jest.fn().mockReturnValue(mockSong),
  getTracks: jest.fn().mockReturnValue(mockGetTrackResponse),
};

describe('generateSong tests', () => {
  test('generateSong called for Artist test', async () => {
    await generateSong(mockClient, mockArtistTrack);
    expect(mockClient.getRandomSong.mock.calls[0]).toEqual([
      mockArtistTrack.label,
      trackMode.ARTIST,
    ]);
  });

  test('generateSong called for Genre test', async () => {
    await generateSong(mockClient, mockGenreTrack);
    expect(mockClient.getRandomSong.mock.calls[0]).toEqual([
      mockGenreTrack.label,
      trackMode.GENRE,
    ]);
  });

  test('generateSong called with anything else test', async () => {
    await generateSong(mockClient, mockTrack);
    expect(mockClient.getRandomSong.mock.calls[0]).toEqual([]);
  });

  test('generateSong called with one playlist', async () => {
    await generateSong(mockClient, {
      ...mockPlayListTrack,
      label: 'anything else',
    });
    expect(mockClient.getTracks).toBeCalledWith(source.PLAYLIST, '1');
  });
  test('generateSong called with All PlayLists', async () => {
    await generateSong(mockClient, mockPlayListTrack);
    expect(mockClient.getPlayLists).toBeCalledTimes(1);
    expect(mockClient.getTracks).toBeCalledTimes(1);
  });

  test('generateSong called somehow without Random!', async () => {
    await generateSong(mockClient, { type: trackType.SONG });
    expect(mockClient.getRandomSong).not.toHaveBeenCalled();
  });
});

describe('mapTracksToSongUris tests', () => {
  const mockTrackList = [mockArtistTrack, mockGenreTrack];

  test('returns array of uris', async () => {
    const result = await mapTracksToSongUris(mockClient, mockTrackList);
    expect(result).toEqual([mockSong.uri, mockSong.uri]);
  });
});

describe('generateSongList tests', () => {
  test('sending empty tracklist returns empty songlist', async () => {
    const songList = await generateSongList(mockClient, []);
    expect(songList).toEqual([]);
  });

  test('generateSongList returns a list of songs with no repeats', async () => {
    const mockSong2 = {
      ...mockSong,
      uri: 'spotify:unique:vutsrqponmlkjihgfedcba',
    };
    mockClient.getRandomSong = jest
      .fn()
      .mockReturnValueOnce(mockSong)
      .mockReturnValue(mockSong2);
    const songList = await generateSongList(mockClient, [
      mockArtistTrack,
      mockArtistTrack,
      mockArtistTrack,
    ]);
    console.log(songList);
    // client.getRandomSong mocked to return the same song every time, so second song should be
    // marked as invalid
    console.log(mockClient.getRandomSong.mock.calls);
    expect(songList[0].uri).toBe(mockSong.uri);
    expect(songList[1].uri).toBe(mockSong2.uri);
  });
});
