import axios from 'axios';
import React, { useEffect, useState } from 'react';

const PlayListSelector = ({ setTracks }) => {
  const [playListOption, setPlayListOption] = useState('default');
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

  return (
    <>
      {options && (
        <>
          <select
            name="playListSelector"
            value={playListOption}
            onChange={(selected) => {
              const { target } = selected;
              //   console.log(selected);
              const option = target.value;
              const playList = option !== 'all' ? parseInt(option) + 2 : 1;

              //   console.log(target[playList]?.text);
              setPlayListOption(option);
              setTracks({
                label: target[playList].text,
                uri: target[playList]?.dataset?.uri,
              });
              //   setTracks(options[selected.target.value].tracks);
            }}
          >
            <option value="default" hidden>
              Select PlayList
            </option>
            <option value="all">All Playlists</option>
            {options.map((list, index) => (
              <option key={index} data-uri={list.uri} value={`${index}`}>
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
