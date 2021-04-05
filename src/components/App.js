import * as React from 'react';

import ConnectSpotify from './ConnectSpotify';

export function App({ initialData }) {
  // console.log(initialData.spotAuthorized);
  const { spotAuthorized } = initialData;
  return (
    <div>
      <h1>PlayMix</h1>
      {spotAuthorized || (
        <>
          <p>To use this app you must connect to spotify</p>
          <ConnectSpotify />
        </>
      )}
      {spotAuthorized && <p>Yay! Spotify connected. Welcome to PlayMix</p>}
    </div>
  );
}
