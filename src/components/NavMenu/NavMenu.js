import React from 'react';

import './NavMenu.css';

import featureToggle from '../../helpers/featureToggle.js';
import { useSpotify } from '../../context/SpotifyContext';

const menuOptions = [
  // { name: 'Play Lists', view: 'playlists' },
  { name: 'Home', view: 'home' },
  // { name: '+ Play List', label: 'Create Play List', view: 'create' },
  { name: '+ Play Mix', label: 'Create Play Mix', view: 'new-playmix' },
  {
    name: 'xmix',
    label: 'Create an Xmix',
    view: 'xmix',
    featureKey: 'xmix2022',
  },
  { name: 'links', label: 'Link Songs', view: 'links' },
];

const NavMenu = ({ setView }) => {
  const { spotifyProfile } = useSpotify();
  return (
    <div className="nav-menu">
      <h1>PlayMix</h1>
      <ul>
        {menuOptions.map((option) => {
          if (
            (option.featureKey &&
              featureToggle(spotifyProfile.userId, option.featureKey)) ||
            option.featureKey == null
          )
            return (
              <li key={option.view}>
                <button
                  type="button"
                  aria-label={option.label ?? option.name}
                  className="btn-nav"
                  onClick={() => setView(option.view)}
                >
                  {option.name}
                </button>
              </li>
            );
        })}
        {spotifyProfile.user && (
          <li>
            <img
              className="avatar"
              aria-label={`${spotifyProfile.user} avatar`}
              src={spotifyProfile.avatar}
            ></img>
          </li>
        )}
      </ul>
    </div>
  );
};

export default NavMenu;
