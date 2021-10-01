import axios from 'axios';
import React, { useEffect, useState } from 'react';

const PlayListTrackSelector = ({ tracks }) => {
  const [songOption, setSongOption] = useState('default');
  const [options, setOptions] = useState([{ label: 'test' }]);

  const getPlayListSongs = async () => {
    const url = tracks.split('/tracks')[0];
    const { data: response } = await axios.get(`/playlist/tracks?url=${url}`);
    console.log(response);
    return response.data.tracks.items.map((song) => ({
      label: song.track.name,
      uri: song.track.uri,
    }));
  };

  useEffect(() => {
    const getOptions = async () => {
      const plOptions = await getPlayListSongs();
      console.log(plOptions);
      setOptions(plOptions);
    };

    getOptions();
  }, []);

  return (
    <>
      {options && (
        <select
          name="playListTrackSelector"
          value={songOption}
          onChange={(selected) => setSongOption(selected.label)}
        >
          <option value="default" hidden>
            Select Song
          </option>
          {options.map((list, index) => (
            <option key={index} value={`${index}`}>
              {list.label}
            </option>
          ))}
        </select>
      )}
    </>
  );
};

export default PlayListTrackSelector;
