import generateSong from './generateSong';
import { source, trackType, trackMode } from '../sapControl/constants/enums';
import axios from 'axios';

afterEach(() => {
  jest.clearAllMocks();
});

jest.mock('axios', () => ({
  get: (url) => {
    if (url === '/playlists') {
      return { data: [{ uri: 'mock:uri:1' }] };
    }
    return { data: { items: [{ track: {} }] } };
  },
}));

jest.spyOn(axios, 'get');

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

const mockPlayListCall = `/tracks?source=${source.PLAYLIST}&uri=1`;

describe('generateSong tests', () => {
  test('generateSong called for Artist test', async () => {
    await generateSong(mockArtistTrack);
    expect(axios.get).toBeCalledWith(
      `/random/${mockArtistTrack.mode}?query=${mockArtistTrack.label}`,
    );
  });

  test('generateSong called for Genre test', async () => {
    await generateSong(mockGenreTrack);
    expect(axios.get).toBeCalledWith(
      `/random/${mockGenreTrack.mode}?query=${mockGenreTrack.label}`,
    );
  });

  test('generateSong called with anything else test', async () => {
    await generateSong(mockTrack);
    expect(axios.get).toBeCalledWith('/random');
  });

  test('generateSong called with one playlist', async () => {
    await generateSong({ ...mockPlayListTrack, label: 'anything else' });
    expect(axios.get).toBeCalledWith(mockPlayListCall);
  });
  test('generateSong called with All PlayLists', async () => {
    await generateSong(mockPlayListTrack);
    expect(axios.get).toHaveBeenNthCalledWith(1, '/playlists');
    expect(axios.get).toHaveBeenNthCalledWith(2, mockPlayListCall);
  });

  test('generateSong called somehow without Random!', async () => {
    await generateSong({ type: trackType.SONG });
    expect(axios.get).not.toBeCalled();
  });
});
