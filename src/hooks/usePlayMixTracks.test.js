import { render, screen } from '@testing-library/react';
import React from 'react';

import { useSpotify } from '../context/SpotifyContext';
import usePlayMixTracks from './usePlayMixTracks';

jest.mock('../context/SpotifyContext');

useSpotify.mockImplementation(() => ({
  spotifyClient: () => {},
  spotifyProfile: {},
}));

const TestComponent = ({ mix }) => {
  const {
    playMixTracks,
    // playMixSongs,
    playMixName,
    // setPlayMixName,
    // playMixController,
  } = usePlayMixTracks(mix);

  return (
    <div>
      <div data-testid="playmix-name">{playMixName}</div>
      <div data-testid="playmix-tracks">{playMixTracks.length}</div>
    </div>
  );
};

describe('usePlayMixTracks tests', () => {
  test('default values are correct', () => {
    render(<TestComponent />);

    const mockDate = new Date().toLocaleDateString();
    const expectedPlaymixDefaultName = `PlayMix ${mockDate}`;

    const playmixDefaultName = screen.getByTestId('playmix-name');
    expect(playmixDefaultName.textContent).toBe(expectedPlaymixDefaultName);

    const playmixTracksLength = screen.getByTestId('playmix-tracks');
    expect(playmixTracksLength.textContent).toBe('0');
  });

  test('sending an existing playmix populates mix', () => {
    const mockExistingMix = {
      _id: 'abc',
      name: 'test mix',
      tracks: [{ _id: '123' }, { _id: '456' }],
    };
    render(<TestComponent mix={mockExistingMix} />);

    const playMixName = screen.getByTestId('playmix-name');
    expect(playMixName.textContent).toBe(mockExistingMix.name);
    const playmixTracksLength = screen.getByTestId('playmix-tracks');
    expect(playmixTracksLength.textContent).toBe(
      mockExistingMix.tracks.length.toString(),
    );
  });
});
