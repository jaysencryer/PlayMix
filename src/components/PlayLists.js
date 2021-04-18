import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Edit from './Edit';

const PlayLists = ({ user }) => {
  const [playLists, setPlayLists] = useState([]);

  // Get the playlists
  useEffect(() => {
    // axios the database?

    const getPlayLists = async () => {
      const data = await axios.get('/playlists');
      setPlayLists([...data.data]);
    };
    if (playLists.length === 0) {
      getPlayLists();
    }
  });

  const [showAll, setShowAll] = useState(false);
  const [activePlayList, setActivePlayList] = useState('');
  const [editMode, setEditMode] = useState(false);

  const toggleView = () => {
    setShowAll(!showAll);
  };

  const editPlayList = (uri) => {
    console.log(
      `edit clicked on playlist ${
        playLists.filter((plist) => plist.uri === uri)[0].name
      }`,
    );
    setActivePlayList(uri);
    setEditMode(true);
  };

  if (!editMode) {
    return (
      <div>
        <button onClick={() => toggleView()}>
          {showAll ? 'Show user owned' : 'Show All'}
        </button>

        {showAll &&
          playLists.map((pList, i) => (
            <div key={i}>
              {pList.name}
              <Edit onClick={() => editPlayList(pList.uri)} />
            </div>
          ))}
        {!showAll &&
          playLists
            .filter((pList) => pList.owner == user)
            .map((p, i) => (
              <div key={i}>
                {p.name}
                <Edit onClick={() => editPlayList(p.uri)} />
              </div>
            ))}
      </div>
    );
  } else {
    return (
      <div>
        specific playlist{' '}
        {playLists.filter((plist) => plist.uri === activePlayList)[0].name}
      </div>
    );
  }
};

export default PlayLists;
