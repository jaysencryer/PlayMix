import React, { useContext, createContext } from 'react';

import usePlayMixTracks from '../hooks/usePlayMixTracks';
import { useSongLinks } from '../hooks/useSongLinks';

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

export const SongLinkContext = createContext(null);

export const SongLinkProvider = ({ children }) => {
  const contextValue = useSongLinks();
  return (
    <SongLinkContext.Provider value={contextValue}>
      {children}
    </SongLinkContext.Provider>
  );
};

export const useLinks = () => {
  const context = useContext(SongLinkContext);
  return context;
};

export const PlayMixSongLinkProvider = ({ selectedMix, children }) => (
  <SongLinkProvider>
    <PlayMixProvider selectedMix={selectedMix}>{children}</PlayMixProvider>
  </SongLinkProvider>
);
