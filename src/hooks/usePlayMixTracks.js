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
    addTrack: (id, track, repeat) =>
      dispatch({ type: 'add', track, data: { id, repeat } }),
  };
  return { trackList, trackController };
};

export default usePlayMixTracks;
