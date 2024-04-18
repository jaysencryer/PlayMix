import React from 'react';

import ConnectSpotify from '../ConnectSpotify/ConnectSpotify';
// import TestScreen from '../TestScreen/TestScreen';
import MainScreen from '../MainScreen/MainScreen';

import { SpotifyProvider } from '../../context/SpotifyContext';

import './App.css';

export function App({ initialData }) {
  const { sessionData } = initialData;

  if (!sessionData?.authorized) {
    return (
      <main id="not-authorized" data-testid="not-authorized">
        <h1>Welcome to PlayMix</h1>
        <p>Log in with Spotify</p>
        <ConnectSpotify />
      </main>
    );
  }

  return (
    <main data-testid="authorized-view">
      <SpotifyProvider profile={sessionData}>
        {/* <TestScreen /> */}
        <MainScreen />
      </SpotifyProvider>
    </main>
  );
}
