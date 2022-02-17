import React, { useState } from 'react';

import SpotifySearchBar from '../SpotifySearchBar/SpotifySearchBar';
import PlaylistSelector from '../PlayListSelector';
import Toggle from '../Toggle/Toggle';
import SelectBar from '../SelectBar/SelectBar';

import { trackType, trackMode } from '../../sapControl/constants/enums';
import { searchType as SEARCHTYPE } from '../../sapControl/constants/enums';
import './TrackEditor.css';

const TrackEditor = ({ track, id, saveTrack, onSave }) => {
  const [selectType, setSelectType] = useState(track.type);
  const [randomMode, setRandomMode] = useState(track.mode);
  const [repeat, setRepeat] = useState(false);
  const [repeatTimes, setRepeatTimes] = useState(1);
  // const [trackGenre, setTrackGenre] = useState('');
  // const [label, setLabel] = useState(track.label);

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
      <div className="selector">
        {selectType === trackType.SONG && (
          <SpotifySearchBar
            onSelect={(selected) => selectTrack(selected)}
            type="track"
            library="spotify"
            value={track.label}
          />
        )}
      </div>
      {selectType === trackType.RANDOM && (
        <>
          <SelectBar
            options={[trackMode.SPOTIFY, trackMode.PLAYLIST, trackMode.ARTIST]}
            onClick={(selected) => {
              if (selected === trackMode.SPOTIFY) {
                selectTrack({
                  mode: trackMode.SPOTIFY,
                  label: trackMode.SPOTIFY,
                });
              }
              setRandomMode(selected);
            }}
            selected={randomMode}
          />
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
          )}
        </>
      )}
      <div className="toolBar">
        <button type="button" onClick={onSave}>
          Save
        </button>
        <label htmlFor="repeat-check">Repeat:</label>
        <input
          type="checkbox"
          id="repeat-check"
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
    </div>
  );
};

export default TrackEditor;
