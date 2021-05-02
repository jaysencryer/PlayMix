import * as React from 'react';
import { useState } from 'react';

import Header from './Header';
import ConnectSpotify from './ConnectSpotify';
import PlayLists from './PlayLists';
import RandomSong from './RandomSong';
import RandomList from './RandomList';
import SpotifySearchBar from './SpotifySearchBar';
import Song from './Song';

export function App({ initialData }) {
  // console.log(initialData.spotAuthorized);
  const { spotAuthorized, spotifyProfile } = initialData;

  const [user, setUser] = useState('');
  const [avatar, setAvatar] = useState('');
  const [viewPlayLists, setViewPlayLists] = useState(false);
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
          <Header
            user={user}
            avatar={avatar}
            setViewPlayLists={setViewPlayLists}
          />
          <p>Yay! Spotify connected. Welcome to PlayMix {user}</p>
        </>
      )}
      {viewPlayLists && <PlayLists user={user} />}
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
    </div>
  );
}
