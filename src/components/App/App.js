import React from 'react';

import ConnectSpotify from '../ConnectSpotify/ConnectSpotify';
import TestScreen from '../TestScreen/TestScreen';

import './App.css';
import { SpotifyProvider } from '../../context/SpotifyContext';

export function App({ initialData }) {
  const { sessionData } = initialData;

  if (!sessionData?.authorized) {
    return (
      <main id="not-authorized">
        <h1>PlayMix</h1>
        <p>To use this app you must connect to spotify</p>
        <ConnectSpotify />
      </main>
    );
  }

  return (
    <SpotifyProvider profile={sessionData}>
      <TestScreen />
    </SpotifyProvider>
  );
}
