import React, { useState } from 'react';
import { PlayMixProvider } from '../../context/PlayMixContext';

import { useSpotify } from '../../context/SpotifyContext';

import NavMenu from '../NavMenu/NavMenu';
import PlayMix from '../PlayMix/PlayMix';
import PlayMixes from '../PlayMixes/PlayMixes';
import RandomList from '../RandomList/RandomList';
import RandomSong from '../RandomSong/RandomSong';
import Xmix from '../Xmix/Xmix';

const TestScreen = () => {
  const { spotifyProfile } = useSpotify();
  const [view, setView] = useState('home');
  const [mix, setMix] = useState();

  const selectMix = (selectedMix) => {
    setMix(selectedMix);
    setView('edit-playmix');
  };
  return (
    <main id="main-app">
      <NavMenu setView={setView} />
      <div id="view-container">
        {view === 'home' && (
          <>
            <ul>
              <li>
                <RandomSong />
              </li>
              <li>
                <RandomList />
              </li>
            </ul>
            <PlayMixes selectMix={selectMix} />
          </>
        )}
        {view === 'edit-playmix' && (
          <PlayMixProvider selectedMix={mix}>
            <PlayMix />
          </PlayMixProvider>
        )}
        {view === 'new-playmix' && (
          <PlayMixProvider>
            <PlayMix />
          </PlayMixProvider>
        )}
        {view === 'xmix' && <Xmix />}
      </div>
    </main>
  );
};

export default TestScreen;
