import React, { useContext, createContext } from 'react';

import usePlayMixTracks from '../hooks/usePlayMixTracks';

export const PlayMixContext = createContext(null);

export const PlayMixProvider = ({ selectedMix, children }) => {
  const contextValue = usePlayMixTracks(selectedMix);
  return (
    <PlayMixContext.Provider value={contextValue}>
      {children}
    </PlayMixContext.Provider>
  );
};

export const usePlayMix = () => {
  const context = useContext(PlayMixContext);
  return context;
};
