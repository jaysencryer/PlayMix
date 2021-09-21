import React from 'react';
import { PlayMixCSS } from '../styles/styles.js';
import NavMenu from './NavMenu';

const Header = ({ user, avatar, setView }) => {
  const clickHandler = (option) => {
    setView(option);
  };

  return (
    <div>
      <NavMenu>
        {user && (
          <>
            {user}
            <img style={PlayMixCSS.avatar} src={avatar}></img>
          </>
        )}
        <div onClick={() => clickHandler('playlists')}>Play Lists</div>
        <div onClick={() => clickHandler('testing')}>Testing</div>
        <div onClick={() => clickHandler('create')}>Creat Play List</div>
      </NavMenu>
    </div>
  );
};
/*
      <ul style={PlayMixCSS.nav_menu}>
        {user && (
          <li style={PlayMixCSS.nav_menu}>
            {user}
            <img style={PlayMixCSS.avatar} src={avatar}></img>
          </li>
        )}
        <li style={PlayMixCSS.nav_menu}>
          <div onClick={() => clickHandler('playlists')}>Play Lists</div>
        </li>
        <li style={PlayMixCSS.nav_menu}>
          <div onClick={() => clickHandler('testing')}>Testing</div>
        </li>
        
      </ul>
    </div>
  );
};
*/
export default Header;
