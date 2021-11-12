import { getSpotifyTrackSourceURL } from './spotifyHelpers';
import { source } from '../../constants/enums';

describe('getSpotifyTrackSourceURL tests', () => {
  test('getSpotifyTrackSourceURL returns correct url for playlists', () => {
    const url = getSpotifyTrackSourceURL(source.PLAYLIST, 'mockuri');
    expect(url).toBe('/playlists/mockuri/tracks');
  });
  test('getSpotifyTrackSource throws error if no source used', () => {
    expect(() => getSpotifyTrackSourceURL()).toThrowError();
  });
});
