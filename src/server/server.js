import express from 'express';
import sessions from 'express-session';
import morgan from 'morgan';
import serialize from 'serialize-javascript';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';

import config from 'server/config';
import { serverRenderer } from 'renderers/server';

import { SapControlBuilder } from '../sapControl/sapControl';

import playMixRoutes from './playMixRoutes';

// import { searchType as SEARCHTYPE } from '../sapControl/constants/enums';
// import { randomItem } from '../sapControl/helpers/helpers';

const app = express();
app.enable('trust proxy');
app.use(morgan('common'));
app.use(cors());
app.use(cookieParser());

app.use(express.static('public'));

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const oneYear = 1000 * 60 * 60 * 24 * 365;
app.use(
  sessions({
    secret: 'thisismysecrctekeyfhrgfgrfrty84fwir767',
    saveUninitialized: true,
    cookie: { maxAge: oneYear },
    resave: false,
  }),
);

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

const mongoUrl = process.env.MONGOURL;

mongoose.connect(mongoUrl, () => {
  console.log('Connected to Mongo DB Successfully!!');
});

// // encode the client_id and secret for passing to spotify
// const authBuffer = Buffer.from(`${client_id}:${client_secret}`).toString(
//   'base64',
// );

app.use('/playMix', playMixRoutes);

const spotifyControl = SapControlBuilder()
  .useStreamer('spotify')
  .useAuth(client_id, client_secret)
  .redirect(redirect_uri)
  .build();

let session;

app.get('/', async (req, res) => {
  session = req.session;
  const sessionData = session.playMixData;
  console.log(session);
  try {
    const vars = await serverRenderer(sessionData);
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
  session = req.session;
  const response = await spotifyControl.authorize(req);
  console.log(response);
  const { authorizedUrl, accessToken, refreshToken } = response;

  session.playMixData = { accessToken, refreshToken };
  res.redirect(authorizedUrl);
});

app.get('/spotifycomplete', async (req, res) => {
  session = req.session;
  session.playMixData.authorized = true;
  res.redirect('/');
});

app.get('/refreshToken', async (req, res) => {
  session = req.session;
  const { accessToken, refreshToken } = await spotifyControl.refreshAccessToken(
    session?.playMixData?.refreshToken,
  );
  session.playMixData.accessToken =
    accessToken ?? session?.playMixData?.accessToken;
  session.playMixData.refreshToken =
    refreshToken ?? session?.playMixData?.refreshToken;
  res.send({ accessToken, refreshToken });
});

app.post('/setSessionUser', (req, res) => {
  if (req.body.accessToken === req.session.playMixData.accessToken) {
    req.session.playMixData.userId = req.body.userId;
  }

  console.log(`set session userId to ${req.body.userId}`);
  console.log(req.session.playMixData);
  res.send('okay');
});

const server = app.listen(config.port || 1234, config.host, () => {
  console.info(`Running on ${config.host}:${config.port}...`);
});

server.timeout = 240000;
