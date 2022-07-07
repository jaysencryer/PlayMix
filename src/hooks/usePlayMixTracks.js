import React, { useReducer } from 'react';
import trackReducer from '../reducer/trackReducer';

const usePlayMixTracks = () => {
  const [playMixTracks, dispatch] = useReducer(trackReducer, []);

  const trackController = {
    addTrack: (id, track, repeat = 1) =>
      dispatch({ type: 'add', track, data: { id, repeat } }),
  };
  return { playMixTracks, trackController };
};

export default usePlayMixTracks;
