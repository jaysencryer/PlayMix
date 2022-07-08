import React, { useState } from 'react';

import SpotifySearchBar from '../SpotifySearchBar/SpotifySearchBar';
import PlaylistSelector from '../PlayListSelector';
import Toggle from '../Toggle/Toggle';
import SelectBar from '../SelectBar/SelectBar';

import { trackType, trackMode } from '../../sapControl/constants/enums';
import { searchType as SEARCHTYPE } from '../../sapControl/constants/enums';
import './TrackEditor.css';
import { usePlayMix } from '../../context/PlayMixContext';

const TrackEditor = ({ track, onSave }) => {
  const [selectType, setSelectType] = useState(track?.type || trackType.SONG);
  const [randomMode, setRandomMode] = useState(track?.mode);
  // const [repeat, setRepeat] = useState(false);
  // const [repeatTimes, setRepeatTimes] = useState(1);
  const { playMixController } = usePlayMix();
  const [editTrack, setEditTrack] = useState(track);
  // const [trackGenre, setTrackGenre] = useState('');
  // const [label, setLabel] = useState(track.label);

  // console.log('In Track Editor');
  // console.table(playMixTracks);

  const selectTrack = ({
    label,
    mode = randomMode,
    uri = 'generate',
    option = null,
  }) => {
    // we've selected a track
    // console.log('Selected a track');
    setEditTrack({
      type: selectType,
      mode,
      label,
      option,
      uri,
      id: editTrack?.id,
    });
  };

  const saveHandler = async () => {
    await playMixController.updateTrack(editTrack);
    onSave();
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
            value={editTrack?.label ?? ''}
          />
        )}
      </div>
      {selectType === trackType.RANDOM && (
        <>
          <SelectBar
            options={[trackMode.SPOTIFY, trackMode.PLAYLIST, trackMode.ARTIST]}
            onClick={(selected) => {
              console.log(selected);
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
            <PlaylistSelector setTracks={selectTrack} track={editTrack} />
          )}
          {randomMode === trackMode.ARTIST && (
            <SpotifySearchBar
              onSelect={(selected) => selectTrack({ label: selected.label })}
              type={SEARCHTYPE.ARTIST}
              library="spotify"
              value={editTrack?.label}
            />
          )}
        </>
      )}
      <div className="toolBar">
        <button type="button" onClick={saveHandler}>
          Save
        </button>
        {/* <label htmlFor="repeat-check">Repeat:</label>
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
        )} */}
      </div>
    </div>
  );
};

export default TrackEditor;
