import React from 'react';

import ConnectSpotify from '../ConnectSpotify/ConnectSpotify';
import TestScreen from '../TestScreen/TestScreen';

import { SpotifyProvider } from '../../context/SpotifyContext';

import './App.css';

export function App({ initialData }) {
  const { sessionData } = initialData;

  if (!sessionData?.authorized) {
    return (
      <main id="not-authorized" data-testid="not-authorized">
        <h1>PlayMix</h1>
        <p>To use this app you must connect to spotify</p>
        <ConnectSpotify />
      </main>
    );
  }

  return (
    <div data-testid="authorized-view">
      <SpotifyProvider profile={sessionData}>
        <TestScreen />
      </SpotifyProvider>
    </div>
  );
}
