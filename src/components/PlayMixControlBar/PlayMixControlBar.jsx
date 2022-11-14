import React, { useEffect, useRef, useState } from 'react';

import { usePlayMix } from '../../context/PlayMixContext';

import { trackMode, trackType } from '../../sapControl/constants/enums';

import './PlayMixControlBar.css';

const newTrack = {
  sources: [
    {
      type: trackType.SONG,
      mode: trackMode.SPOTIFY,
    },
  ],
};

const PlayMixControlBar = () => {
  const { playMixController, playMixTracks, playMixName, setPlayMixName } =
    usePlayMix();
  const [editName, setEditName] = useState(false);
  const editNameRef = useRef(null);

  useEffect(() => {
    if (editName && editNameRef) {
      editNameRef.current.focus();
    }
  }, [editName]);

  return (
    <div className="playmix-controller">
      <>
        <button
          type="button"
          onClick={playMixController.addToQueue}
          disabled={playMixTracks.length < 3}
        >
          Send to Spotify
        </button>
        <button
          type="button"
          onClick={playMixController.savePlayMix}
          disabled={playMixTracks.length < 3}
        >
          Save
        </button>
        <button
          type="button"
          onClick={playMixController.savePlayList}
          disabled={playMixTracks.length < 3}
        >
          Save as PlayList
        </button>
        {/* <button type="button" onClick={regenerateSongs}>
              Regenerate List
            </button> */}
      </>
      <button
        type="button"
        onClick={() => {
          const trackId = playMixTracks?.length;
          playMixController.addTrack({ ...newTrack, id: trackId });
        }}
      >
        Add Track
      </button>
      <div id="edit-name-container">
        {editName ? (
          <input
            type="text"
            value={playMixName}
            onChange={(e) => setPlayMixName(e.target.value)}
            onBlur={() => setEditName(false)}
            ref={editNameRef}
          />
        ) : (
          <h2>{playMixName}</h2>
        )}
        <button
          type="button"
          className="edit-name-button"
          onClick={() => {
            setEditName(true);
          }}
        >
          EDIT
        </button>
      </div>
    </div>
  );
};

export default PlayMixControlBar;
