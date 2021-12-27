import express from 'express';
import morgan from 'morgan';
import serialize from 'serialize-javascript';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import config from 'server/config';
import { serverRenderer } from 'renderers/server';

import { SapControlBuilder } from '../sapControl/sapControl';

import { searchType as SEARCHTYPE } from '../sapControl/constants/enums';
import { randomItem } from '../sapControl/helpers/helpers';

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
const redirect_uri =
  process.env.SPOT_REDIRECT_URL || 'http://localhost:1234/authorized';

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
  spotifyControl.connect(res);
});

app.get('/authorized', async (req, res) => {
  spotifyControl.authorize(req, res);
  // if ('error' in response) {
  //   res.render('error', { error: response.error });
  // }
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
  res.redirect('/');
});

// Load spotify playlists for current user
app.get('/playlists', async (req, res) => {
  // check to see if we already have playlists loaded.
  if (spotifyControl.playLists.length === 0) {
    console.log('getting playlists');
    // If not load all users playlists
    spotifyProfile['playLists'] = await spotifyControl.getPlayLists();
  }
  // send back json list of playlists
  res.send(spotifyControl.playLists);
});

// Dev only
app.get('/sapinfo', (req, res) => {
  if (config.isDev) res.send(spotifyControl);
  res.send('Dev Only');
});

// Search spotify API endpoint
app.get('/search', async (req, res) => {
  const data = await spotifyControl.searchSpotify(
    req.query.query,
    SEARCHTYPE.TRACK,
  );
  res.send(data);
});

app.get('/search/:type', async (req, res) => {
  const data = await spotifyControl.searchSpotify(
    req.query.query,
    req.params.type,
    true,
  );
  res.send({
    type: req.params.type,
    data,
  });
});

app.get('/random/:type', async (req, res) => {
  const searchType = req.params.type;
  const searchString = req.query.query;

  const data = await spotifyControl.getRandomSong(searchString, searchType);
  res.send(data);
});

// Random spotify API endpoint
app.get('/random', async (req, res) => {
  // const data = await randomSong(spotifyProfile.accessToken, req.query.query);
  const data = await spotifyControl.getRandomSong();
  res.send(data);
});

app.post('/playsong', async (req, res) => {
  const songUris = req.body.songs; // array of song uri's
  try {
    const response = await spotifyControl.playSong(songUris);
    res.send(response);
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

app.post('/playlist', async (req, res) => {
  // TO DO
  // Body contains - song uris, playlist id (if adding or modifying)
  // console.log(req.body);
  // create the new playlist - if no playlist id given
  const response = await spotifyControl.addSpotifyPlayList(
    req.body.name,
    req.body.uris,
  );
  res.send(response);
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

const getRandomQualifier = () => {
  const qualifiers = [
    ['pop', 'rock', 'jazz'],
    ['hip-hop', "r'n'b", 'alternative', 'traditional'],
  ];

  const randomDistribution = Math.floor(Math.random() * 8) + 1;

  let randomListOfQualifiers = [];

  for (let i = 0; i < randomDistribution; i++) {
    randomListOfQualifiers.push(0);
  }
  for (let j = 0; j < randomDistribution - 2; j++) {
    randomListOfQualifiers.push(1);
  }

  const result = randomItem(qualifiers[randomItem(randomListOfQualifiers)]);

  return result;
};

app.get('/xmix', async (req, res) => {
  let songList = new Set();
  let type;
  let searchString;
  let message = [];
  let response;
  try {
    do {
      type = getRandomQualifier();
      searchString = `${type} AND Christmas`;
      message.push(`Searching for ${searchString}`);

      response = await spotifyControl.getRandomSong(
        searchString,
        SEARCHTYPE.GENRE,
      );
      if (response?.uri) {
        songList.add(response.uri);
      }
    } while (songList.size < 120);
    const uriList = Array.from(songList);
    spotifyControl.playSong(uriList);
    const date = new Date();
    const mixName = `XMix ${date.toLocaleDateString()}`;

    spotifyControl.addSpotifyPlayList(mixName, uriList.slice(0, 100));

    res.send({ message, uriList });
  } catch (err) {
    console.error('this is what happens');
    console.error(err);
    res.send(err);
  }
});

const server = app.listen(config.port, config.host, () => {
  console.info(`Running on ${config.host}:${config.port}...`);
});

server.timeout = 240000;
