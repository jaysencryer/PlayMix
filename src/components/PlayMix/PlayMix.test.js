import { act, fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import axios from 'axios';
import { useSpotify } from '../../context/SpotifyContext';
import { PlayMixProvider } from '../../context/PlayMixContext';
import PlayMix from './PlayMix';
import trackReducer from '../../reducer/trackReducer';
import * as genFunc from '../../helpers/generateSong';

jest.mock('axios');
jest.mock('../../reducer/trackReducer');
jest.mock('../../context/SpotifyContext');
// jest.mock('../../helpers/generateSong', () => {
//   const original = jest.requireActual(generateSongList);
//   return {
//     __esModule: true,
//     generateSongList: jest.fn(original.default),
//   };
// });
const generateSongSpy = jest.spyOn(genFunc, 'generateSongList');

const mockAddSpotifyPlayList = jest.fn();
const mockPlaySong = jest.fn();

const mockTracks = [{ _id: '123' }, { _id: '456' }];
trackReducer.mockImplementation(() => mockTracks);
useSpotify.mockImplementation(() => ({
  spotifyClient: {
    addSpotifyPlayList: mockAddSpotifyPlayList,
    playSong: mockPlaySong,
  },
  spotifyProfile: {},
}));

const mockMix = {
  _id: 'abc',
  name: 'test mix',
  tracks: mockTracks,
};

describe('PlayMix component - playmixController tests', () => {
  test('renders new play mix without error', () => {
    jest.clearAllMocks();
    render(
      <PlayMixProvider>
        <PlayMix />
      </PlayMixProvider>,
    );
  });
  test('renders existing play mix without error', () => {
    jest.clearAllMocks();
    render(
      <PlayMixProvider selectedMix={mockMix}>
        <PlayMix />
      </PlayMixProvider>,
    );
  });

  test('Add button triggers add action', () => {
    jest.clearAllMocks();
    render(
      <PlayMixProvider>
        <PlayMix />
      </PlayMixProvider>,
    );
    const addButton = screen.getByRole('button', { name: 'Add Track' });
    fireEvent.click(addButton);
    expect(trackReducer).toBeCalledTimes(1);
    expect(trackReducer.mock.calls[0][1].type).toBe('add');
  });

  test('saving a track triggers edit action', async () => {
    jest.clearAllMocks();
    render(
      <PlayMixProvider>
        <PlayMix />
      </PlayMixProvider>,
    );
    const addButton = screen.getByRole('button', { name: 'Add Track' });
    fireEvent.click(addButton);
    const trackToggle = screen.getAllByRole('checkbox');
    fireEvent.click(trackToggle[0]);
    const saveButton = screen.getAllByRole('button', { name: 'Save' });
    await act(async () => {
      fireEvent.click(saveButton[1]);
    });
    expect(trackReducer).toBeCalledTimes(2);
    expect(trackReducer.mock.calls[1][1].type).toBe('edit');
  });
  test('save play list to spotify triggers addSpotifyPlayList', async () => {
    jest.clearAllMocks();
    trackReducer.mockImplementation(() => [
      ...mockTracks,
      ...mockTracks,
      ...mockTracks,
    ]);
    render(
      <PlayMixProvider selectedMix={mockMix}>
        <PlayMix />
      </PlayMixProvider>,
    );
    const saveButton = screen.getByRole('button', {
      name: 'Save as PlayList',
    });
    await act(async () => {
      fireEvent.click(saveButton);
    });
    expect(trackReducer).toBeCalledTimes(1);
    expect(mockAddSpotifyPlayList).toBeCalledTimes(1);
  });
  test('save play list after send to spotify does not generate new song list', async () => {
    jest.clearAllMocks();
    trackReducer.mockImplementation(() => [
      ...mockTracks,
      ...mockTracks,
      ...mockTracks,
    ]);
    render(
      <PlayMixProvider selectedMix={mockMix}>
        <PlayMix />
      </PlayMixProvider>,
    );
    const sendButton = screen.getByRole('button', {
      name: 'Send to Spotify',
    });
    await act(async () => {
      fireEvent.click(sendButton);
    });
    const saveButton = screen.getByRole('button', {
      name: 'Save as PlayList',
    });
    await act(async () => {
      fireEvent.click(saveButton);
    });
    expect(trackReducer).toBeCalledTimes(1);
    expect(generateSongSpy).toBeCalledTimes(1);
  });

  test('send to spotify triggers spotifyClient.playSong', async () => {
    jest.clearAllMocks();
    trackReducer.mockImplementation(() => [
      ...mockTracks,
      ...mockTracks,
      ...mockTracks,
    ]);
    render(
      <PlayMixProvider selectedMix={mockMix}>
        <PlayMix />
      </PlayMixProvider>,
    );
    const sendButton = screen.getByRole('button', {
      name: 'Send to Spotify',
    });
    await act(async () => {
      fireEvent.click(sendButton);
    });
    expect(trackReducer).toBeCalledTimes(1);
    expect(mockPlaySong).toBeCalledTimes(1);
  });

  test('save triggers axios post to /playmix/save', async () => {
    jest.clearAllMocks();
    const axiosSpy = jest.spyOn(axios, 'post');
    trackReducer.mockImplementation(() => [
      ...mockTracks,
      ...mockTracks,
      ...mockTracks,
    ]);
    render(
      <PlayMixProvider selectedMix={mockMix}>
        <PlayMix />
      </PlayMixProvider>,
    );
    const saveButton = screen.getAllByRole('button', {
      name: 'Save',
    });
    await act(async () => {
      fireEvent.click(saveButton[0]);
    });
    expect(trackReducer).toBeCalledTimes(1);
    expect(axiosSpy).toBeCalledTimes(1);
    expect(axiosSpy.mock.calls[0][0]).toBe('/playmix/save');
  });
  test('Duplicate button triggers duplicate action', async () => {
    jest.clearAllMocks();
    render(
      <PlayMixProvider>
        <PlayMix />
      </PlayMixProvider>,
    );
    const addButton = screen.getByRole('button', { name: 'Add Track' });
    fireEvent.click(addButton);
    const saveButton = screen.getAllByRole('button', { name: 'Save' });
    await act(async () => {
      fireEvent.click(saveButton[1]);
    });
    const duplicateButton = screen.getByRole('button', {
      name: 'Duplicate',
    });
    await act(async () => {
      fireEvent.click(duplicateButton);
    });
    expect(trackReducer).toBeCalledTimes(3);
    expect(trackReducer.mock.calls[2][1].type).toBe('duplicate');
  });
});

describe('PlayMix component name editing tests', () => {
  test('name is editable', async () => {
    render(
      <PlayMixProvider>
        <PlayMix />
      </PlayMixProvider>,
    );
    const editButton = screen.getByRole('button', { name: 'EDIT' });

    await act(async () => {
      fireEvent.click(editButton);
    });
    const nameField = screen.getByRole('textbox');
    await act(async () => {
      fireEvent.change(nameField, { target: { value: 'new name' } });
    });
    await act(async () => {
      fireEvent.blur(nameField);
    });
    const mixName = screen.getByRole('heading');
    expect(mixName.textContent).toBe('new name');
  });
});
