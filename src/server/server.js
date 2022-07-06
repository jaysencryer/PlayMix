import express from 'express';
import sessions from 'express-session';
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

const oneDay = 1000 * 60 * 60 * 24;
app.use(
  sessions({
    secret: 'thisismysecrctekeyfhrgfgrfrty84fwir767',
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
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

// // encode the client_id and secret for passing to spotify
// const authBuffer = Buffer.from(`${client_id}:${client_secret}`).toString(
//   'base64',
// );

const spotifyControl = SapControlBuilder()
  .useStreamer('spotify')
  .useAuth(client_id, client_secret)
  .redirect(redirect_uri)
  .build();

let session;

app.get('/', async (req, res) => {
  session = req.session;
  const sessionData = session.playMixData;
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
  const { authorizedUrl, accessToken, refreshToken } =
    await spotifyControl.authorize(req);
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

// const getRandomQualifier = () => {
//   const qualifiers = [
//     ['pop', 'rock', 'jazz'],
//     ['hip-hop', "r'n'b", 'alternative', 'traditional'],
//   ];

//   const randomDistribution = Math.floor(Math.random() * 8) + 1;

//   let randomListOfQualifiers = [];

//   for (let i = 0; i < randomDistribution; i++) {
//     randomListOfQualifiers.push(0);
//   }
//   for (let j = 0; j < randomDistribution - 2; j++) {
//     randomListOfQualifiers.push(1);
//   }

//   const result = randomItem(qualifiers[randomItem(randomListOfQualifiers)]);

//   return result;
// };

// app.get('/xmix', async (req, res) => {
//   let songList = new Set();
//   let type;
//   let searchString;
//   let message = [];
//   let response;
//   try {
//     do {
//       type = getRandomQualifier();
//       searchString = `${type} AND Christmas`;
//       message.push(`Searching for ${searchString}`);

//       response = await spotifyControl.getRandomSong(
//         searchString,
//         SEARCHTYPE.GENRE,
//       );
//       if (response?.uri) {
//         songList.add(response.uri);
//       }
//     } while (songList.size < 120);
//     const uriList = Array.from(songList);
//     spotifyControl.playSong(uriList);

//     const date = new Date();
//     const mixName = `XMix ${date.toLocaleDateString()}`;

//     spotifyControl.addSpotifyPlayList(mixName, uriList.slice(0, 100));
//     res.send({ message, uriList });
//   } catch (err) {
//     console.error('this is what happens');
//     console.error(err);
//     res.send(err);
//   }
// });

const server = app.listen(config.port || 1234, config.host, () => {
  console.info(`Running on ${config.host}:${config.port}...`);
});

server.timeout = 240000;
