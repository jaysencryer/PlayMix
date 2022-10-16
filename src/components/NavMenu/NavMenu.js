import React from 'react';

import './NavMenu.css';

const menuOptions = [
  // { name: 'Play Lists', view: 'playlists' },
  { name: 'Home', view: 'home' },
  // { name: '+ Play List', label: 'Create Play List', view: 'create' },
  { name: '+ Play Mix', label: 'Create Play Mix', view: 'new-playmix' },
];

const NavMenu = ({ user, avatar, setView }) => (
  <div className="nav-menu">
    <h1>PlayMix</h1>
    <ul>
      {menuOptions.map((option) => (
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
      ))}
      {user && (
        <li>
          <img
            className="avatar"
            aria-label={`${user} avatar`}
            src={avatar}
          ></img>
        </li>
      )}
    </ul>
  </div>
);

export default NavMenu;
