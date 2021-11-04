import React from 'react';
import { PlayMixCSS } from '../../styles/styles.js';
import NavMenu from '../NavMenu/NavMenu';

const Header = ({ user, avatar, setView }) => {
  const clickHandler = (option) => {
    setView(option);
  };

  return (
    
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
