import React from 'react';
import { NavLink } from 'react-router-dom';

const Header = () => (
  <div>
    <ul>
      <li>
        <NavLink to="/playlists">Play Lists</NavLink>
      </li>
    </ul>
  </div>
);

export default Header;
