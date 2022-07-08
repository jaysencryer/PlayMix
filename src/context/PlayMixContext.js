import React, { useContext, createContext } from 'react';

import usePlayMixTracks from '../hooks/usePlayMixTracks';

export const PlayMixContext = createContext(null);

export const PlayMixProvider = ({ children }) => {
  const contextValue = usePlayMixTracks();
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
