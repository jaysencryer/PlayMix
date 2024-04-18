import { randomItem } from '../sapControl/helpers/helpers';
import { searchType as SEARCHTYPE } from '../sapControl/constants/enums';

const getRandomQualifier = () => {
  const qualifiers = [
    ['pop', 'rock', 'jazz'],
    ['rap', 'soul', 'alternative', 'traditional'],
    // ['alternative', 'traditional'],
  ];

  const randomDistribution = Math.floor(Math.random() * 8) + 1;

  let randomListOfQualifiers = [];

  for (let i = 0; i < randomDistribution; i++) {
    randomListOfQualifiers.push(0);
  }
  for (let j = 0; j < randomDistribution - 3; j++) {
    randomListOfQualifiers.push(1);
  }

  const result = randomItem(qualifiers[randomItem(randomListOfQualifiers)]);

  return result;
};

const generateXmix = async (spotifyClient) => {
  // app.get('/xmix', async (req, res) => {

  let songList = new Set();
  let type;
  let searchString;
  let response;
  do {
    type = getRandomQualifier();
    searchString = `${type} AND Christmas`;
    console.log(`Searching for ${searchString}`);

    response = await spotifyClient.getRandomSong(
      searchString,
      SEARCHTYPE.GENRE,
    );
    if (response?.uri) {
      songList.add(response.uri);
    }
  } while (songList.size < 120);
  const uriList = Array.from(songList);
  return uriList;
};

export default generateXmix;

// spotifyC.playSong(uriList);

//     const date = new Date();
//     const mixName = `XMix ${date.toLocaleDateString()}`;

//     spotifyControl.addSpotifyPlayList(mixName, uriList.slice(0, 100));
//     res.send({ message, uriList });
//   } catch (err) {
//     res.send(err);
//   }
// });
