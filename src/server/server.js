import express from 'express';
import morgan from 'morgan';
import serialize from 'serialize-javascript';
import dotenv from 'dotenv';
import querystring from 'querystring';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import config from 'server/config';
import { serverRenderer } from 'renderers/server';

import {
  generateRandomString,
  getSpotifyProfile,
  getSpotifyPlayLists,
  getSpotifyToken,
  uriEncode,
} from './utils';

const app = express();
app.enable('trust proxy');
app.use(morgan('common'));
app.use(cors());
app.use(cookieParser());

app.use(express.static('public'));

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.locals.serialize = serialize;

if (config.isDev) {
  app.locals.gVars = {
    main: ['main.css', 'main.js'],
    vendor: 'vendor.js',
  };
} else {
  try {
    app.locals.gVars = require('../../.reactful.json');
  } catch (err) {
    console.error('Reactful did not find Webpack generated assets');
  }
}

// Spotify connection stuff
dotenv.config();

const client_id = process.env.SPOT_CLIENT_ID;
const client_secret = process.env.SPOT_SECRET;
const redirect_uri = 'http://localhost:1234/authorized';

// encode the client_id and secret for passing to spotify
const authBuffer = Buffer.from(`${client_id}:${client_secret}`).toString(
  'base64',
);

const stateKey = 'spotify_auth_state';
const spotifyProfile = {};
let authorized = false;

app.get('/', async (req, res) => {
  try {
    const vars = await serverRenderer(authorized, spotifyProfile);
    res.render('index', vars);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.get('/connectSpotify', (req, res) => {
  // your application requests authorization
  const state = generateRandomString(16);
  res.cookie(stateKey, state);
  const scope = 'user-read-private user-read-email playlist-read-private';
  res.redirect(
    'https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: client_id,
        scope: scope,
        state: state,
        redirect_uri: redirect_uri,
      }),
  );
});

// When Spotify is successfully connected it will fire back to this route
app.get('/authorized', async (req, res) => {
  // check that we are correctly verified
  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies[stateKey] : null;

  let error = {};

  if (state === null || state !== storedState) {
    // some error authenticating occurred
    error['message'] = 'Initial authorization failed';
    res.render('error', { error: error });
  } else {
    // All authenticated
    // Now we need to get our spotify token - and user info
    const spotifyTokenBody = {
      code,
      redirect_uri,
      grant_type: 'authorization_code',
    };

    const formBody = uriEncode(spotifyTokenBody);

    // Get Spotify Access Tokens
    ({
      access_token: spotifyProfile.accessToken,
      refresh_token: spotifyProfile.refreshToken,
      error: error,
    } = await getSpotifyToken(formBody, authBuffer));

    // Get spotify profile data
    ({
      user: spotifyProfile.user,
      avatar: spotifyProfile.avatar,
      error: error,
    } = await getSpotifyProfile(spotifyProfile.accessToken));
  }

  if (error) {
    console.error(
      `Spotify connection and initial load failed: ${error.message}`,
    );
    res.render('error', { error: error });
  } else {
    authorized = true;
    res.redirect('/');
  }
});

// Load spotify playlists for current user
app.get('/playlists', async (req, res) => {
  // check to see if we already have playlists loaded.
  if (!spotifyProfile.playLists) {
    // If not load all users playlists

    spotifyProfile['playLists'] = await getSpotifyPlayLists(
      spotifyProfile.accessToken,
    );
  }
  // send back json list of playlists
  res.send(spotifyProfile.playLists);
});

app.listen(config.port, config.host, () => {
  console.info(`Running on ${config.host}:${config.port}...`);
});
