import React, { useEffect, useRef, useState } from 'react';

import ShowTrack from '../ShowTrack/ShowTrack';

import { trackType, trackMode } from '../../sapControl/constants/enums';

import './PlayMix.css';
import usePlayMixTracks from '../../hooks/usePlayMixTracks';

const newTrack = {
  type: trackType.SONG,
  mode: trackMode.SPOTIFY,
};

const PlayMix = () => {
  const {
    playMixTracks,
    playMixSongs,
    playMixName,
    setPlayMixName,
    playMixController,
  } = usePlayMixTracks();
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
        {playMixSongs.length > 5 && (
          <>
            <button type="button" onClick={playMixController.addToQueue}>
              Send to Spotify
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
            const trackId = playMixTracks?.length ?? 0;
            console.log(`trackId = ${trackId}`);
            playMixController.addTrack(trackId, { ...newTrack, id: trackId });
          }}
        >
          Add Track
        </button>
      </div>
      <p>Create your PlayMix</p>
      {playMixTracks &&
        playMixTracks.map((track, id) => (
          <section key={`${track.id}${track.type}`} className="playmix-track">
            <ShowTrack
              id={id}
              track={track}
              saveTrack={playMixController.addTrack}
              edit={track?.label ?? true}
            />
          </section>
        ))}
    </div>
  );
};

export default PlayMix;
