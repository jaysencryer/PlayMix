import React, { useState } from 'react';

import SpotifySearchBar from '../SpotifySearchBar/SpotifySearchBar';
import PlaylistSelector from '../PlayListSelector';

import { trackType, trackMode } from '../../sapControl/constants/enums';
import { searchType as SEARCHTYPE } from '../../sapControl/constants/enums';
// import './TrackSelector.css';

const TrackSelector = ({ track, id, saveTrack }) => {
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
    <div id="playmix-trackselector">
      {selectType === trackType.SONG ? (
        <button
          type="button"
          className="btn-track-type"
          aria-label="switch to random"
          onClick={toggleTrackType}
        >
          <img
            className="icon-song"
            src="https://img.icons8.com/external-kiranshastry-solid-kiranshastry/64/000000/external-vinyl-music-kiranshastry-solid-kiranshastry.png"
          />
        </button>
      ) : (
        <button
          type="button"
          className="btn-track-type"
          aria-label="switch to song"
          onClick={toggleTrackType}
        >
          <span className="icon-random">?</span>
        </button>
      )}

      {/* <select
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
      </select> */}
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
              value="test"
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

export default TrackSelector;
