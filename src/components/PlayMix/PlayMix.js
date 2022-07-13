import React, { useEffect, useRef, useState } from 'react';

import ShowTrack from '../ShowTrack/ShowTrack';

import { trackType, trackMode } from '../../sapControl/constants/enums';

import './PlayMix.css';
import { usePlayMix } from '../../context/PlayMixContext';

const newTrack = {
  type: trackType.SONG,
  mode: trackMode.SPOTIFY,
};

const PlayMix = () => {
  const { playMixTracks, playMixName, setPlayMixName, playMixController } =
    usePlayMix();
  const [editName, setEditName] = useState(false);
  const editNameRef = useRef(null);

  useEffect(() => {
    if (editName && editNameRef) {
      editNameRef.current.focus();
    }
  }, [editName]);

  return (
    <div id="playmix-screen-container">
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
      <div className="playmix-controller">
        {playMixTracks.length > 5 && (
          <>
            <button type="button" onClick={playMixController.addToQueue}>
              Send to Spotify
            </button>
            <button type="button" onClick={playMixController.savePlayMix}>
              Save
            </button>
            <button type="button" onClick={playMixController.savePlayList}>
              Save as PlayList
            </button>
            {/* <button type="button" onClick={regenerateSongs}>
              Regenerate List
            </button> */}
          </>
        )}
        <button
          type="button"
          onClick={() => {
            const trackId = playMixTracks?.length;
            playMixController.addTrack({ ...newTrack, id: trackId });
          }}
        >
          Add Track
        </button>
      </div>
      <p>Create your PlayMix</p>
      {playMixTracks &&
        playMixTracks.map((track, index) => (
          <div key={`${index}${track?.id}`} className="playmix-track">
            <ShowTrack track={track} edit={track?.label ? false : true} />
          </div>
        ))}
    </div>
  );
};

export default PlayMix;
