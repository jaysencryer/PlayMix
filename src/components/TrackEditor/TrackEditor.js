import React, { useState } from 'react';

import SpotifySearchBar from '../SpotifySearchBar/SpotifySearchBar';
import PlaylistSelector from '../PlayListSelector';
import Toggle from '../Toggle/Toggle';

import { trackType, trackMode } from '../../sapControl/constants/enums';
import { searchType as SEARCHTYPE } from '../../sapControl/constants/enums';
import './TrackEditor.css';

const TrackEditor = ({ track, id, saveTrack }) => {
  const [selectType, setSelectType] = useState(track.type);
  const [randomMode, setRandomMode] = useState(track.mode);
  const [repeat, setRepeat] = useState(false);
  const [repeatTimes, setRepeatTimes] = useState(1);
  const [trackGenre, setTrackGenre] = useState('');

  console.log(track.label);

  const selectTrack = ({
    label,
    mode = randomMode,
    uri = 'generate',
    option = null,
  }) => {
    // we've selected a track
    saveTrack(
      id,
      {
        type: selectType,
        mode: mode,
        label: label,
        option: option,
        uri: uri,
        id: track.id,
      },
      repeatTimes,
    );
  };

  const toggleTrackType = () => {
    if (selectType === trackType.SONG) {
      setSelectType(trackType.RANDOM);
    } else {
      setSelectType(trackType.SONG);
    }
  };

  return (
    <div id="playmix-trackeditor">
      <div className="toggle-display">
        <Toggle
          on={selectType === trackType.RANDOM}
          onClick={toggleTrackType}
        />
        <p>{selectType}</p>
      </div>
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
            <option value={trackMode.GENRE}>Genre</option>
          </select>
          {randomMode === trackMode.PLAYLIST && (
            <PlaylistSelector setTracks={selectTrack} track={track} />
          )}
          {randomMode === trackMode.ARTIST && (
            <SpotifySearchBar
              onSelect={(selected) => selectTrack({ label: selected.label })}
              type={SEARCHTYPE.ARTIST}
              library="spotify"
              value={track.label}
            />
            // value={track.label ?? ''}
          )}
          {randomMode === trackMode.GENRE && (
            <input
              type="text"
              value={trackGenre}
              onChange={(e) => setTrackGenre(e.target.value)}
              onBlur={() => selectTrack({ label: trackGenre })}
            />
          )}
        </>
      )}
      <input
        type="checkbox"
        checked={repeat}
        onChange={() => setRepeat(!repeat)}
      />
      {repeat && (
        <input
          type="number"
          value={repeatTimes}
          onChange={(e) => {
            console.log(e.target);
            setRepeatTimes(e.target.value);
          }}
        />
      )}
    </div>
  );
};

export default TrackEditor;
