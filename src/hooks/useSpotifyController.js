import { useEffect, useState } from 'react';
import axios from 'axios';
import { spotifyClientBuilder } from '../sapControl/spotify/API/spotifyClient';
import * as SPOTIFY_CONSTANTS from '../sapControl/helpers/spotify/spotifyConstants';

const useSpotifyController = (profile) => {
  const [spotifyProfile, setSpotifyProfile] = useState(profile);
  const [spotifyClient, setSpotifyClient] = useState();

  useEffect(() => {
    const initializeSpotifyClient = async () => {
      const { accessToken, refreshToken } = profile;
      const response = await axios.get(`${SPOTIFY_CONSTANTS.API_BASE_URL}/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setSpotifyProfile({
        ...spotifyProfile,
        user: response?.data?.display_name,
        avatar: response?.data?.images?.[0]?.url,
      });
      const client = await spotifyClientBuilder()
        .useTokens(accessToken, refreshToken)
        .build();

      setSpotifyClient(client);
    };

    initializeSpotifyClient();
  }, []);

  return { spotifyClient, spotifyProfile };
};

export default useSpotifyController;
