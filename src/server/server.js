import express from 'express';
import morgan from 'morgan';
import serialize from 'serialize-javascript';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import config from 'server/config';
import { serverRenderer } from 'renderers/server';
import { SapControlBuilder } from './sapControl';

import {
  generateRandomString,
  getSpotifyPlayLists,
  searchSpotify,
  randomSong,
  playSpotifySong,
  addSpotifyPlayList,
  getSpotifyTracks,
} from './utils';
import { searchType, source } from '../constants/enums';

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

// // encode the client_id and secret for passing to spotify
// const authBuffer = Buffer.from(`${client_id}:${client_secret}`).toString(
//   'base64',
// );

const spotifyControl = SapControlBuilder()
  .useStreamer('spotify')
  .useAuth(client_id, client_secret)
  .redirect(redirect_uri)
  .build();

let spotifyProfile = {};
let authorized = false;

app.get('/', async (req, res) => {
  try {
    const vars = await serverRenderer(authorized, spotifyControl);
    res.render('index', vars);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.get('/connectSpotify', (req, res) => {
  spotifyControl.connect(req, res);
});

app.get('/authorized', (req, res) => {
  const response = spotifyControl.authorize(req, res);
  if ('error' in response) {
    res.render('error', { error: response.error });
  }
});

app.get('/spotifycomplete', async (req, res) => {
  authorized = true;

  // Keep this until all other endpoints rewritten
  ({
    id: spotifyProfile.id,
    user: spotifyProfile.user,
    avatar: spotifyProfile.avatar,
    accessToken: spotifyProfile.accessToken,
  } = await spotifyControl.getProfile());
  // console.log(spotifyProfile);
  res.redirect('/');
});

// Load spotify playlists for current user
app.get('/playlists', async (req, res) => {
  // check to see if we already have playlists loaded.
  // console.log(spotifyControl.playLists);
  if (spotifyControl.playLists.length === 0) {
    console.log('getting playlists');
    // If not load all users playlists
    spotifyProfile['playLists'] = await spotifyControl.getPlayLists();
  }
  // send back json list of playlists
  res.send(spotifyControl.playLists);
});

app.get('/sapinfo', (req, res) => {
  res.send(spotifyControl);
});

// Search spotify API endpoint
app.get('/search', async (req, res) => {
  console.log(req.url);
  const searchString = [...req.url.matchAll(/search\?query=(\w.*)/g)];
  console.log(searchString[0][1]);
  const data = await searchSpotify(
    spotifyProfile.accessToken,
    searchString[0][1],
    'track',
  );
  res.send(data);
});

app.get('/search/:type', async (req, res) => {
  const data = await searchSpotify(
    spotifyProfile.accessToken,
    req.query.q,
    req.params.type,
  );

  res.send({
    type: req.params.type,
    data,
  });
});

app.get('/random/:type', async (req, res) => {
  const randSearchTerm = generateRandomString(2);
  let data;
  if (req.params.type === searchType.TRACK) {
    data = await randomSong(
      spotifyProfile.accessToken,
      randSearchTerm,
      searchType.TRACK,
    );
  } else if (req.params.type === searchType.ARTIST) {
    const artist = req.query.name;
    do {
      data = await randomSong(
        spotifyProfile.accessToken,
        artist,
        searchType.ARTIST,
      );
      console.log(
        `found artist - ${data.artists[0].name} looking for ${artist}`,
      );
    } while (data.artists[0].name.toLowerCase() !== artist.toLowerCase());
    // data = { message: 'Random song from artist not implemented yet' };
  }

  res.send(data);
});

// Random spotify API endpoint
app.get('/random', async (req, res) => {
  const data = await randomSong(spotifyProfile.accessToken, req.query.query);
  res.send(data);
});

app.post('/playsong', async (req, res) => {
  const songUris = req.body.songs; // array of song uri's
  try {
    const data = await spotifyControl.playSong(songUris);
    res.send(data.status);
  } catch (err) {
    console.log(err);
    res.send({ error: err, status: 400 });
  }
});

app.post('/playlist', async (req, res) => {
  // TO DO
  // Body contains - song uris, playlist id (if adding or modifying)
  console.log(req.body);
  // create the new playlist - if no playlist id given
  const data = await addSpotifyPlayList(
    spotifyProfile.accessToken,
    spotifyProfile.id,
    req.body.name,
    req.body.uris,
  );
  // upload song uris
  res.send({ status: 200 });
});

app.get('/tracks', async (req, res) => {
  const uri = req.query.uri;
  const trackSource = req.query.source;
  try {
    // const data = await getSpotifyTracks(url, spotifyProfile.accessToken);
    const data = await spotifyControl.getTracks(trackSource, uri);
    res.send(data);
  } catch (err) {
    console.log(err.message);
    console.log('fail');
    res.send('too bad');
  }
});

app.listen(config.port, config.host, () => {
  console.info(`Running on ${config.host}:${config.port}...`);
});
