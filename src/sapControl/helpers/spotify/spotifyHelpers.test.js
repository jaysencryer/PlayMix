import { getSpotifyTrackSourceURL } from './spotifyHelpers';

describe('getSpotifyTrackSourceURL tests', () => {
  test('getSpotifyTrackSource throws error if no source used', () => {
    expect(() => getSpotifyTrackSourceURL()).toThrowError();
  });
});
