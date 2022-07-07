import React, { useState } from 'react';

import { useSpotify } from '../../context/spotifyContext';

import NavMenu from '../NavMenu/NavMenu';
import PlayMix from '../PlayMix/PlayMix';
import RandomList from '../RandomList/RandomList';
import RandomSong from '../RandomSong/RandomSong';
import TestBed from '../TestBed/TestBed';

const TestScreen = () => {
  const { spotifyProfile } = useSpotify();
  const [view, setView] = useState('testing');

  return (
    <main id="main-app">
      <NavMenu
        user={spotifyProfile.user}
        avatar={spotifyProfile.avatar}
        setView={setView}
      />
      <div id="view-container">
        {view === 'testing' && (
          <>
            <ul>
              <li>
                <RandomSong />
              </li>
              <li>
                <RandomList />
              </li>
            </ul>
            <TestBed />
          </>
        )}
        {view === 'playmix' && <PlayMix />}
      </div>
    </main>
  );
};

export default TestScreen;
