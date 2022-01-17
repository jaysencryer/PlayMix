import * as React from 'react';
import { useState } from 'react';

import NavMenu from '../NavMenu/NavMenu';
import ConnectSpotify from '../ConnectSpotify/ConnectSpotify';
import PlayMix from '../PlayMix/PlayMix';
import RandomList from '../RandomList/RandomList';
import RandomSong from '../RandomSong/RandomSong';

import './App.css';

export function App({ initialData }) {
  // console.log(initialData.spotAuthorized);
  const { spotAuthorized, spotifyProfile } = initialData;

  const [user, setUser] = useState('');
  const [avatar, setAvatar] = useState('');
  const [view, setView] = useState('testing');

  // console.log(spotifyProfile);
  React.useEffect(() => {
    if (spotifyProfile && user === '') {
      setUser(spotifyProfile.user);
      setAvatar(spotifyProfile.avatar);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotifyProfile]);

  if (!spotAuthorized) {
    return (
      <main id="not-authorized">
        <h1>PlayMix</h1>
        <p>To use this app you must connect to spotify</p>
        <ConnectSpotify />
      </main>
    );
  }
  return (
    <main id="main-app">
      <NavMenu user={user} avatar={avatar} setView={setView} />
      <div id="view-container">
        <p>Yay! Spotify connected. Welcome to PlayMix {user}</p>
        {view === 'testing' && (
          <ul>
            <li>
              <RandomSong />
            </li>
            <li>
              <RandomList />
            </li>
          </ul>
        )}
        {view === 'playmix' && <PlayMix sapControl={spotifyProfile} />}
      </div>
    </main>
  );
}
