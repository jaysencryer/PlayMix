import { response } from 'express';
import fetch from 'node-fetch';

export const generateRandomString = (length) => {
  var text = '';
  var possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

export const uriEncode = (obj) => {
  let formBody = [];
  for (const property in obj) {
    var encodedKey = encodeURIComponent(property);
    var encodedValue = encodeURIComponent(obj[property]);
    formBody.push(encodedKey + '=' + encodedValue);
  }
  return formBody.join('&');
};

export const getSpotifyToken = async (formBody, authBuffer) => {
  try {
    const data = await spotFetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      body: formBody,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        'Authorization': `Basic ${authBuffer}`,
      },
    });

    return {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    };
  } catch (err) {
    console.error(`getSpotifyToken: Error occured\n${err}`);
    return { error: err };
  }
};

export const getSpotifyProfile = async (accessToken) => {
  try {
    const data = await spotFetch('https://api.spotify.com/v1/me', {
      method: 'GET',
      headers: { Authorization: 'Bearer ' + accessToken },
    });

    return { user: data.display_name, avatar: data.images[0].url };
  } catch (err) {
    console.error(`Access Token Error:\n ${err}`);
    return { error: err, avatar: '/images/blank.png' };
  }
};

// Custom fetch method to deal with Json-ing and error handling
const spotFetch = async (url, body) => {
  try {
    const response = await fetch(url, body);
    const data = await response.json();
    if (data.error) throw data.error;
    return data;
  } catch (err) {
    return { error: err };
  }
};
