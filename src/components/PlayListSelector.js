import axios from 'axios';
import React, { useEffect, useState } from 'react';
import PlayLists from './PlayLists';

const PlayListSelector = ({ setTracks }) => {
  const [playListOption, setPlayListOption] = useState(['default']);
  const [options, setOptions] = useState([{ label: '', uri: '' }]);

  const getPlayLists = async () => {
    const { data: response } = await axios.get('/playlists');
    // console.log(response);
    return response.map((list) => ({
      label: list.name,
      tracks: list.tracks.href,
      uri: list.uri,
    })); // Probably need track list too.
  };

  useEffect(() => {
    const getOptions = async () => {
      const plOptions = await getPlayLists();
      console.log(plOptions);
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
    let uriList = [];

    for (let option of options) {
      if (option.value == 1) {
        // If 'All PlayLists' is selected - just set that one
        newOptions = [1];
        uriList = [target[1]?.dataset?.uri];
        break;
      }
      newOptions.push(option.value);
      const playList = parseInt(option.value);
      uriList.push(target[playList]?.dataset?.uri);
    }

    // Set up label for track rendering
    const extras = newOptions.length > 1 ? ` + ${newOptions.length - 1}` : '';
    const label = `${target[newOptions[0]].text}${extras}`;
    // console.log(newOptions);
    // console.log(label);
    setPlayListOption(newOptions);
    setTracks({
      label,
      uri: uriList,
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
            multiple
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