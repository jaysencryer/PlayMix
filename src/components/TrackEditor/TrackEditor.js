import React, { useState } from 'react';

import SpotifySearchBar from '../SpotifySearchBar/SpotifySearchBar';
import PlaylistSelector from '../PlayListSelector/PlayListSelector';
import Toggle from '../Toggle/Toggle';
import SelectBar from '../SelectBar/SelectBar';

import { trackType, trackMode } from '../../sapControl/constants/enums';
import { searchType as SEARCHTYPE } from '../../sapControl/constants/enums';
import './TrackEditor.css';
import { usePlayMix } from '../../context/PlayMixContext';

const TrackEditor = ({ track, onSave }) => {
  const [selectType, setSelectType] = useState(
    track?.sources[0].type || trackType.SONG,
  );
  const [randomMode, setRandomMode] = useState(track?.sources[0].mode);
  const { playMixController } = usePlayMix();
  const [editTrack, setEditTrack] = useState(track);

  const selectTrack = ({ label, mode = randomMode, uri = 'generate' }) => {
    // we've selected a track
    setEditTrack({
      label,
      id: editTrack?.id,
      sources: [
        {
          type: selectType,
          mode,
          label,
          uri,
        },
      ],
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
      </div>
    </div>
  );
};

export default TrackEditor;
