import React from 'react';

const Header = ({ user, avatar, setViewPlayLists }) => {
  const clickHandler = (option) => {
    switch (option) {
      case 'playlists':
        setViewPlayLists(true);
        break;
    }
  };

  return (
    <div>
      <ul>
        {user && (
          <li>
            {user}
            <img src={avatar}></img>
          </li>
        )}
        <li>
          <div onClick={() => clickHandler('playlists')}>Play Lists</div>
        </li>
      </ul>
    </div>
  );
};

export default Header;
