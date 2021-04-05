import express from 'express';
import morgan from 'morgan';
import serialize from 'serialize-javascript';
import dotenv from 'dotenv';
import querystring from 'querystring';

import config from 'server/config';
import { serverRenderer } from 'renderers/server';

import { generateRandomString } from './utils';

const app = express();
app.enable('trust proxy');
app.use(morgan('common'));

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

app.get('/', async (req, res) => {
  try {
    const vars = await serverRenderer();
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
  try {
    const vars = await serverRenderer(true);
    res.render('index', vars);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

app.listen(config.port, config.host, () => {
  console.info(`Running on ${config.host}:${config.port}...`);
});
