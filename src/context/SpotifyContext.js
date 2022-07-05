import React, { useContext, createContext } from 'react';

import useSpotifyController from '../hooks/useSpotifyController';

export const SpotifyContext = createContext(null);

export const SpotifyProvider = ({ profile, children }) => {
  const contextValue = useSpotifyController(profile);
  return (
    <SpotifyContext.Provider value={contextValue}>
      {children}
    </SpotifyContext.Provider>
  );
};

export const useSpotify = () => {
  const context = useContext(SpotifyContext);
  return context;
};
