import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { spotifyClientBuilder } from '../sapControl/spotify/API/spotifyClient';

const useSpotifyController = (profile) => {
  const [spotifyProfile, setSpotifyProfile] = useState(profile);
  const [spotifyClient, setSpotifyClient] = useState();

  useEffect(() => {
    const initializeSpotifyClient = async () => {
      console.log(profile);
      const { accessToken, refreshToken } = profile;
      const response = await axios.get('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      console.log(response.data);
      setSpotifyProfile({
        ...spotifyProfile,
        user: response?.data?.display_name,
        avatar: response?.data?.images?.[0]?.url,
      });
      const client = await spotifyClientBuilder()
        .useTokens(accessToken, refreshToken)
        .build();

      setSpotifyClient(client);
      console.log(client);
    };

    initializeSpotifyClient();
  }, []);

  return { spotifyClient, spotifyProfile };
};

export default useSpotifyController;
