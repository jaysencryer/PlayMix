import {
  filterSpotifySongsByType,
  getSpotifySearchUrlByType,
  getSpotifyTrackSourceURL,
  sanitizeSpotifyPlayLists,
  sanitizedSpotifySongList,
  getSpotifySongSearchUrl,
  validUri,
} from './spotifyHelpers';

import { source } from '../../constants/enums';
import { searchType as SEARCHTYPE } from '../../constants/enums';

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
describe('getSpotifyTrackSourceURL tests', () => {
  test('getSpotifyTrackSourceURL returns correct url for playlists', () => {
    const url = getSpotifyTrackSourceURL(source.PLAYLIST, 'mockuri');
    expect(url).toBe('/playlists/mockuri/tracks');
  });
  test('getSpotifyTrackSource throws error if no source used', () => {
    expect(() => getSpotifyTrackSourceURL()).toThrowError();
  });
});

describe('sanitizeSpotifyPlayLists tests', () => {
  test('sanitizeSpotifyPlayLists works as expected', () => {
    const mockPlayList = [
      {
        name: 'test playlist',
        owner: { display_name: 'teddy tester' },
        uri: 'bleepbloop',
        href: 'http://somekindofurl',
        images: [
          { url: 'http://picture1', otherdata: 'test' },
          { url: 'http://picture2', otherdata: 'test2' },
        ],
        tracks: 'http://trackurl',
        datawedontneed: 'extra info',
        license: 'other unused data',
      },
    ];

    const sanitizedList = sanitizeSpotifyPlayLists(mockPlayList);

    expect(sanitizedList[0].name).toBe(mockPlayList[0].name);
    expect(sanitizedList[0].license).toBeUndefined();
    expect(sanitizedList[0].images).toBe(mockPlayList[0].images[0].url);
  });

  test('if playlist does not have field, expect all field to be undefined', () => {
    const emptyPlayList = [];

    const sanitizedList = sanitizeSpotifyPlayLists(emptyPlayList);
    const listToCheck = sanitizedList[0];
    for (let items in listToCheck) {
      if (items !== 'images') {
        expect(listToCheck[items]).toBeUndefined();
      } else {
        expect(listToCheck[items]).toBe('');
      }
    }
  });
});

describe('getSpotifySearchUrlByType tests', () => {
  test('getSpotifySearchUrlByType searching for Artist', () => {
    const mockArtist = 'Eminem';
    const encodedArtist = encodeURIComponent(mockArtist);
    const result = getSpotifySearchUrlByType(mockArtist, SEARCHTYPE.ARTIST);
    expect(result).toBe(
      `/search?query=${SEARCHTYPE.ARTIST}%3A%22${encodedArtist}%22&type=${SEARCHTYPE.ARTIST}`,
    );
  });

  test('getSpotifySearchUrlByType searching for track', () => {
    const mockSearchTerm = 'never gonna';
    const encodedSearch = encodeURIComponent(mockSearchTerm);
    const result = getSpotifySearchUrlByType(mockSearchTerm, SEARCHTYPE.TRACK);
    expect(result).toBe(
      `/search?query=${SEARCHTYPE.TRACK}%3A${encodedSearch}&type=${SEARCHTYPE.TRACK}`,
    );
  });

  test('getSpotifySearchUrlByType throws error if unknown searchType used', () => {
    const invalidSearch = 'not valid';
    expect(() =>
      getSpotifySearchUrlByType('anything', invalidSearch),
    ).toThrowError(`Unsupported search type ${invalidSearch}`);
  });
});

describe('filterSpotifySongsByType tests', () => {
  const mockArtist = 'The Beatles';
  const songList = mockSpotifyResponseData.tracks.items;
  test('filterSpotifySongsByType returns all songs by artist', () => {
    const newSongList = filterSpotifySongsByType(
      songList,
      mockArtist,
      SEARCHTYPE.ARTIST,
    );
    expect(newSongList.length).toBe(1);
    expect(newSongList[0].name).toBe('Get Back');
  });

  test('filterSpotifySongsByType returns all songs if no searchType sent', () => {
    const newSongList = filterSpotifySongsByType(songList, 'unused', null);
    expect(newSongList).toEqual(songList);
  });

  test('filterSpotifySongsByType returns empty array if artist not in list', () => {
    const newSongList = filterSpotifySongsByType(
      songList,
      'Eminem',
      SEARCHTYPE.ARTIST,
    );
    expect(newSongList.length).toBe(0);
  });
});

describe('getSpotifySongSearchUrl tests', () => {
  test('getSpotifySongSearchUrl search by Track test', () => {
    const mockSearch = 'test words';
    const encodedSearch = encodeURIComponent(mockSearch);
    const result = getSpotifySongSearchUrl(mockSearch, SEARCHTYPE.TRACK);
    expect(result).toBe(
      `/search?query=${SEARCHTYPE.TRACK}%3A${encodedSearch}%20NOT%20karaoke&type=track`,
    );
  });

  test('getSpotifySongSearchUrl search by Artists test', () => {
    const mockArtist = 'Eminem';
    const encodedSearch = encodeURIComponent(mockArtist);
    const result = getSpotifySongSearchUrl(mockArtist, SEARCHTYPE.ARTIST);
    expect(result).toBe(
      `/search?query=${SEARCHTYPE.ARTIST}%3A%22${encodedSearch}%22%20NOT%20karaoke&type=track`,
    );
  });

  test('getSpotifySongSearchUrl throws error if unknown searchType used', () => {
    const invalidSearch = 'not valid';
    expect(() =>
      getSpotifySongSearchUrl('anything', invalidSearch),
    ).toThrowError(`Unsupported search type ${invalidSearch}`);
  });
});

describe('sanitizedSpotifySongList tests', () => {
  test('sanitizedSpotifySongList returns sanitized song list', () => {
    const songList = sanitizedSpotifySongList(mockSpotifyResponseData);
    expect(songList.length).toBe(mockSpotifyResponseData.tracks.items.length);
    expect(songList[0].artist).toBe('Rolling Stones');
    expect(songList[0].title).toBe('Never Happened');
  });

  test('sanitizedSpotifySongList returns undefined if data is incorrect', () => {
    const songList = sanitizedSpotifySongList({ tracks: 'nothing' });
    expect(songList).toBeUndefined();
  });
});

describe('validUri tests', () => {
  const valid = 'spotify:track:abcdefghijklmnopqrstuv';
  const invalidSections = 'spotify:track';
  const invalidSpotify = 'invalid:track:abcdefghijklmnopqrstuv';
  const invalidId = 'spotify:track:abcdefg';

  test('valid track uri returns true', () => {
    expect(validUri(valid)).toBeTruthy();
  });

  test('invalid number of sections returns false', () => {
    expect(validUri(invalidSections)).toBeFalsy();
  });
  test('invalid number of Spotify returns false', () => {
    expect(validUri(invalidSpotify)).toBeFalsy();
  });
  test('invalid length of Id returns false', () => {
    expect(validUri(invalidId)).toBeFalsy();
  });

  test('uri that is not a string is invalid', () => {
    expect(validUri({})).toBeFalsy();
  });
});
