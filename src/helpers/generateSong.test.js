import { generateSong, mapTracksToSongUris } from './generateSong';
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
  uri: 'abcdef:12345',
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

// describe('mapTracksToSongUris tests', () => {
//   test('returns array of uris', () => {
//     const result = mapTracksToSongUris(mockClient, mockTrackList);
//     expect(result).toEqual(['uri1', 'uri2']);
//   });
// });
