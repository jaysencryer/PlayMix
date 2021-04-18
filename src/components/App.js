import * as React from 'react';
import { useState } from 'react';
import { StaticRouter, BrowserRouter, Switch, Route } from 'react-router-dom';

import Header from './Header';
import ConnectSpotify from './ConnectSpotify';
import PlayLists from './PlayLists';

export function App({ initialData }) {
  // console.log(initialData.spotAuthorized);
  const { spotAuthorized, spotifyProfile } = initialData;

  const [user, setUser] = useState('');
  const [avatar, setAvatar] = useState('');
  const [viewPlayLists, setViewPlayLists] = useState(false);

  if (spotifyProfile && user === '') {
    setUser(spotifyProfile.user);
    setAvatar(spotifyProfile.avatar);
  }

  return (
    <div>
      <h1>PlayMix</h1>
      {spotAuthorized || (
        <>
          <p>To use this app you must connect to spotify</p>
          <ConnectSpotify />
        </>
      )}
      {spotAuthorized && (
        <>
          <Header
            user={user}
            avatar={avatar}
            setViewPlayLists={setViewPlayLists}
          />
          <p>Yay! Spotify connected. Welcome to PlayMix {user}</p>
        </>
      )}
      {viewPlayLists && <PlayLists user={user} />}
    </div>
  );
}
