import React, { useState } from 'react';

import SpotifySearchBar from '../SpotifySearchBar';
import PlaylistSelector from '../PlayListSelector';

import { trackType, trackMode } from '../../constants/enums';
// import './TrackSelector.css';

const TrackSelector = ({ track, id, saveTrack }) => {
  const [selectType, setSelectType] = useState(track.type);
  const [randomMode, setRandomMode] = useState(track.mode);

  const selectTrack = ({ label, mode = randomMode, uri = 'generate' }) => {
    // we've selected a track
    saveTrack(id, {
      type: selectType,
      mode: mode,
      label: label,
      uri: uri,
    });
  };

  return (
    <div>
      <select
        className="track-type-selector-dropdown"
        name="type"
        id="selectType"
        value={selectType}
        onChange={(event) => setSelectType(event.target.value)}
      >
        <option value={trackType.DEFAULT} disabled hidden>
          Select Track Type
        </option>
        <option value={trackType.SONG}>Song</option>
        <option value={trackType.RANDOM}>Random</option>
      </select>
      {selectType === trackType.SONG && (
        <SpotifySearchBar
          onSelect={(selected) => selectTrack(selected)}
          type="track"
          library="spotify"
        />
      )}
      {selectType === trackType.RANDOM && (
        <>
          <select
            name="randomMode"
            id="randomMode"
            value={randomMode}
            onChange={(event) => {
              if (event.target.value === trackMode.SPOTIFY) {
                selectTrack({
                  mode: trackMode.SPOTIFY,
                  label: trackMode.SPOTIFY,
                });
              }
              setRandomMode(event.target.value);
            }}
          >
            <option value={trackMode.DEFAULT}>select mode</option>
            <option value={trackMode.PLAYLIST}>Play List</option>
            <option value={trackMode.SPOTIFY}>Spotify</option>
            <option value={trackMode.ARTIST}>Artist</option>
          </select>
          {randomMode === trackMode.PLAYLIST && (
            <PlaylistSelector setTracks={selectTrack} />
          )}
          {randomMode === trackMode.ARTIST && (
            <SpotifySearchBar
              onSelect={(selected) => selectTrack({ label: selected.label })}
              type="artist"
              library="spotify"
            />
          )}
        </>
      )}
    </div>
  );
};

export default TrackSelector;
