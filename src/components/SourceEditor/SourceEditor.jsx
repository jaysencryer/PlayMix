import React, { useState } from 'react';

import SpotifySearchBar from '../SpotifySearchBar/SpotifySearchBar';
import PlaylistSelector from '../PlayListSelector/PlayListSelector';
import Toggle from '../Toggle/Toggle';
import SelectBar from '../SelectBar/SelectBar';

import { trackType, trackMode } from '../../sapControl/constants/enums';
import { searchType as SEARCHTYPE } from '../../sapControl/constants/enums';
// import './SourceEditor.css';
// import { usePlayMix } from '../../context/PlayMixContext';

const SourceEditor = ({ source, onSave }) => {
  const [selectType, setSelectType] = useState(source?.type || trackType.SONG);
  const [randomMode, setRandomMode] = useState(source?.mode);
  //   const { playMixController } = usePlayMix();
  const [editSource, setEditSource] = useState(source);

  const selectSource = ({ label, mode = randomMode, uri = 'generate' }) => {
    // we've selected a track
    setEditSource({
      type: selectType,
      mode: mode ? mode : trackMode.SPOTIFY,
      label,
      uri,
      id: editSource?.id,
    });
  };

  const toggleSourceType = () => {
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
          onClick={toggleSourceType}
        />
        <p>{selectType}</p>
      </div>
      <div className="selector">
        {selectType === trackType.SONG && (
          <SpotifySearchBar
            onSelect={(selected) => selectSource(selected)}
            type="track"
            library="spotify"
            value={editSource?.label ?? ''}
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
                selectSource({
                  mode: trackMode.SPOTIFY,
                  label: trackMode.SPOTIFY,
                });
              }
              setRandomMode(selected);
            }}
            selected={randomMode}
          />
          {randomMode === trackMode.PLAYLIST && (
            <PlaylistSelector setSource={selectSource} source={editSource} />
          )}
          {randomMode === trackMode.ARTIST && (
            <SpotifySearchBar
              onSelect={(selected) => selectSource({ label: selected.label })}
              type={SEARCHTYPE.ARTIST}
              library="spotify"
              value={editSource?.label}
            />
          )}
        </>
      )}
      <div className="toolBar">
        <button type="button" onClick={() => onSave(editSource)}>
          Save
        </button>
      </div>
    </div>
  );
};

export default SourceEditor;
