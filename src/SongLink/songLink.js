class linkedSong {
  constructor(uri, before, after) {
    this.uri = uri;
    this.before = before;
    this.after = after;
    return this;
  }
}

const linkedSongs = new Map();
const playedSongs = new Set();

const playLinkedSong = (uri) => {
  if (playedSongs.has(uri)) return;
  //   console.log(linkedSongs);
  const linkedSong = linkedSongs.get(uri);
  if (linkedSong?.before) {
    playLinkedSong(linkedSong.before);
  }

  console.log(`playing ${uri}`);
  playedSongs.add(uri);

  if (linkedSong?.after) {
    playLinkedSong(linkedSong.after);
  }
};

const getLinkedSong = (uri, linked = []) => {
  if (playedSongs.has(uri)) return [];
  const listOfSongs = [...linked];
  //   console.log(linkedSongs);
  const linkedSong = linkedSongs.get(uri);
  if (linkedSong?.before) {
    listOfSongs.push(...playLinkedSong(linkedSong.before, listOfSongs));
  }

  console.log(`playing ${uri}`);
  listOfSongs.push(uri);
  playedSongs.add(uri);

  if (linkedSong?.after) {
    listOfSongs.push(...playLinkedSong(linkedSong.after, listOfSongs));
  }

  return listOfSongs;
};

export const getLinkedSongList = (songList) => {
  const newSongList = [];
  songList.forEach((song) => {
    newSongList.push(getLinkedSong(song));
  });
  return newSongList;
};

export const mainLink = () => {
  const song1 = new linkedSong('uri1', null, 'uri2');
  const song2 = new linkedSong('uri2', 'uri3', 'uri4');

  linkedSongs.set('uri1', song1);
  linkedSongs.set(song2.uri, song2);

  //   console.log(linkedSongs.get('uri1').after);

  getLinkedSong('uri1');
};
