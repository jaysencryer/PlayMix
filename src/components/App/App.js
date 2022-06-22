import * as React from 'react';
import { useState } from 'react';

import NavMenu from '../NavMenu/NavMenu';
import ConnectSpotify from '../ConnectSpotify/ConnectSpotify';
import PlayMix from '../PlayMix/PlayMix';
import RandomList from '../RandomList/RandomList';
import RandomSong from '../RandomSong/RandomSong';
import TestBed from '../TestBed/TestBed';

import './App.css';
import axios from 'axios';
import { spotifyClientBuilder } from '../../sapControl/spotify/API/spotifyClient';

export function App({ initialData }) {
  // console.log(initialData.spotAuthorized);
  const { spotAuthorized, spotifyProfile } = initialData;

  const [user, setUser] = useState('');
  const [avatar, setAvatar] = useState('');
  const [view, setView] = useState('testing');
  const [client, setClient] = useState();

  const hackSpotifyAccess = async () => {
    console.log(spotifyProfile.accessToken);
    const response = await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${spotifyProfile.accessToken}` },
    });
    console.log(response.data);
    setUser(response.data.display_name);
    setAvatar(response.data.images[0].url);
    const spotifyClient = await spotifyClientBuilder()
      .useTokens(spotifyProfile.accessToken, spotifyProfile.refreshToken)
      .build();

    setClient(spotifyClient);
    console.log(client);
    // const song = await spotifyClient.getRandomSong();
    // console.log(song);
    // spotifyClient.playSong([song.uri]);
    // return { display_name: response?.data?.display_name, images: response.data;
  };
  // console.log(spotifyProfile);
  React.useEffect(() => {
    console.log('showing spotifyProfile');
    console.log(spotifyProfile);
    if (spotAuthorized && spotifyProfile && user === '') {
      hackSpotifyAccess();
      // spotifyProfile.avatar = ;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spotifyProfile, spotAuthorized]);

  React.useEffect(() => {
    const asyncFun = async () => {
      if (client) {
        const song = await client.getRandomSong();
        console.log(song);
        client.playSong([song.uri]);
      }
    };
    asyncFun();
  }, [client]);

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
        {view === 'testing' && (
          <>
            <ul>
              <li>
                <RandomSong client={client} />
              </li>
              <li>
                <RandomList client={client} />
              </li>
            </ul>
            <TestBed />
          </>
        )}
        {view === 'playmix' && <PlayMix client={client} />}
      </div>
    </main>
  );
}
