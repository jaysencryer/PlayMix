import {
  getSpotifySearchUrlByType,
  getSpotifyTrackSourceURL,
  sanitizeSpotifyPlayLists,
} from './spotifyHelpers';

import { source } from '../../constants/enums';
import { searchType as SEARCHTYPE } from '../../constants/enums';

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

  test('getSpotifySearchUrlBase searching for track', () => {
    const mockSearchTerm = 'never gonna';
    const encodedSearch = encodeURIComponent(mockSearchTerm);
    const result = getSpotifySearchUrlByType(mockSearchTerm, SEARCHTYPE.TRACK);
    expect(result).toBe(
      `/search?query=${SEARCHTYPE.TRACK}%3A${encodedSearch}&type=${SEARCHTYPE.TRACK}`,
    );
  });
});
