import * as React from 'react';
import { useState } from 'react';

import Header from './Header';
import ConnectSpotify from './ConnectSpotify';
import PlayLists from './PlayLists';
import RandomSong from './RandomSong';
import RandomList from './RandomList';
import SpotifySearchBar from './SpotifySearchBar';
import Song from './Song';
import Create from './Create';

export function App({ initialData }) {
  // console.log(initialData.spotAuthorized);
  const { spotAuthorized, spotifyProfile } = initialData;

  const [user, setUser] = useState('');
  const [avatar, setAvatar] = useState('');
  const [view, setView] = useState('testing');
  const [songName, setSongName] = useState('');
  const [songUri, setSongUri] = useState('');

  if (spotifyProfile && user === '') {
    setUser(spotifyProfile.user);
    setAvatar(spotifyProfile.avatar);
  }

  const handleSelection = (selectedOption) => {
    setSongName(selectedOption.label);
    setSongUri(selectedOption.uri);
  };

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
          <Header user={user} avatar={avatar} setView={setView} />
          <p>Yay! Spotify connected. Welcome to PlayMix {user}</p>
          {view === 'playlists' && <PlayLists user={user} />}
          {view === 'create' && <Create user={user} />}
          {view === 'testing' && (
            <>
              <div>
                <RandomSong />
              </div>
              <div>
                <RandomList />
                <Song name={songName} uri={songUri} />
                Search For a Track{' '}
                <SpotifySearchBar
                  onSelect={(selected) => handleSelection(selected)}
                  type="track"
                />
                Search For an Artist <SpotifySearchBar type="artist" />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
