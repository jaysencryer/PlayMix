import React, { useReducer } from 'react';
import { trackType, trackMode } from '../sapControl/constants/enums';

const initialTrackList = [
  {
    type: trackType.SONG,
    mode: trackMode.SPOTIFY,
  },
];

const usePlayMixTracks = () => {
  const [trackList, dispatch] = useReducer(trackReducer, initialTrackList);

  const trackController = {
    addTrack: (track) => dispatch({ type: 'add', track }),
  };
  return { trackList, trackController };
};

export default usePlayMixTracks;
