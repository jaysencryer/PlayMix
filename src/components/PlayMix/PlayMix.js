import React from 'react';

import PlayMixControlBar from '../PlayMixControlBar/PlayMixControlBar';
import ShowTrack from '../ShowTrack/ShowTrack';

import './PlayMix.css';
import { usePlayMix } from '../../context/PlayMixContext';

const PlayMix = () => {
  const { playMixTracks } = usePlayMix();

  return (
    <div id="playmix-screen-container">
      <PlayMixControlBar />
      <div id="playmix-tracks-container">
        {playMixTracks.length > 0 ? (
          playMixTracks.map((track, index) => (
            <div key={`${index}${track?.id}`} className="playmix-track">
              <ShowTrack track={track} edit={track?.label ? false : true} />
            </div>
          ))
        ) : (
          <p>Create your PlayMix</p>
        )}
      </div>
    </div>
  );
};

export default PlayMix;
