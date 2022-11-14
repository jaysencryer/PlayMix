import React, { useEffect, useState } from 'react';
import { useSpotify } from '../../context/SpotifyContext';

const PlayListSelector = ({ setTracks, track }) => {
  const [playListOption, setPlayListOption] = useState();
  const [options, setOptions] = useState([{ label: '', uri: '' }]);
  const { spotifyClient } = useSpotify();

  const getPlayLists = async () => {
    if (spotifyClient.playLists.length === 0) {
      spotifyClient.playLists = await spotifyClient.getPlayLists();
    }
    return spotifyClient.playLists.map((list) => ({
      label: list.name,
      tracks: list.tracks.href,
      uri: list.uri,
    })); // Probably need track list too.
  };

  const findIndex = (playListName, playLists) => {
    return playLists.findIndex((element) => element.label === playListName);
  };

  useEffect(() => {
    const getOptions = async () => {
      const plOptions = await getPlayLists();
      console.log(plOptions);
      setPlayListOption([findIndex(track?.sources[0]?.label, plOptions) + 2]);
      setOptions(plOptions);
    };

    getOptions();
  }, []);

  const selectHandler = (selected) => {
    const { target } = selected;
    console.log(selected);
    // const option = target.value;
    // console.log(target.selectedOptions);
    const options = target.selectedOptions;
    console.log(options);
    let newOptions = [];
    let uri;

    for (let option of options) {
      if (option.value == 1) {
        // If 'All PlayLists' is selected - just set that one
        newOptions = [1];
        uri = target[1]?.dataset?.uri;
        break;
      }
      newOptions.push(option.value);
      const playList = parseInt(option.value);
      uri = target[playList]?.dataset?.uri;
    }

    // Set up label for track rendering
    const extras = newOptions.length > 1 ? ` + ${newOptions.length - 1}` : '';
    const label = `${target[newOptions[0]].text}${extras}`;
    // console.log(newOptions);
    // console.log(label);
    setPlayListOption(newOptions);
    setTracks({
      label,
      uri,
    });
  };

  return (
    <>
      {options && (
        <>
          <select
            className="playlist-selector"
            name="playListSelector"
            value={playListOption}
            onChange={selectHandler}
          >
            {/* size={5} */}
            {/* defaultValue={['default']} */}
            <option value="default" hidden>
              Select PlayList
            </option>
            <option data-uri="all" value={1}>
              All Playlists
            </option>
            {options.map((list, index) => (
              <option key={index} data-uri={list.uri} value={`${index + 2}`}>
                {list.label}
              </option>
            ))}
          </select>
        </>
      )}
    </>
  );
};

export default PlayListSelector;
