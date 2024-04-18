import React, { useState } from 'react';
import {
  PlayMixSongLinkProvider,
  SongLinkProvider,
} from '../../context/PlayMixContext';

import LinkedSongs from '../LinkedSongs/LinkedSongs';
import NavMenu from '../NavMenu/NavMenu';
import PlayMix from '../PlayMix/PlayMix';
import PlayMixes from '../PlayMixes/PlayMixes';
import RandomList from '../RandomList/RandomList';
import RandomSong from '../RandomSong/RandomSong';
import Xmix from '../Xmix/Xmix';

const MainScreen = () => {
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
            <SongLinkProvider>
              <PlayMixes selectMix={selectMix} />
            </SongLinkProvider>
          </>
        )}
        {view === 'edit-playmix' && (
          <PlayMixSongLinkProvider selectedMix={mix}>
            <PlayMix />
          </PlayMixSongLinkProvider>
        )}
        {view === 'new-playmix' && (
          <PlayMixSongLinkProvider>
            <PlayMix />
          </PlayMixSongLinkProvider>
        )}
        {view === 'xmix' && <Xmix />}
        {view === 'links' && (
          <SongLinkProvider>
            <LinkedSongs />
          </SongLinkProvider>
        )}
      </div>
    </main>
  );
};

export default MainScreen;
