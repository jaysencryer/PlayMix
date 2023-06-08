import { linkedSong, linkSingleSong } from './songLink';

const mockLinkedSongData = [
  new linkedSong('A', 'D', 'F'),
  new linkedSong('B', null, 'E'),
  new linkedSong('D', 'Z', null),
];

describe('linkSingleSong tests', () => {
  const mockSongMap = new Map();
  mockLinkedSongData.forEach((song) => mockSongMap.set(song.uri, song));
  test('unlinked song returns list of that song', () => {
    const mockStartSong = 'C';
    const songList = linkSingleSong(mockStartSong, mockSongMap);
    expect(songList.length).toBe(1);
    expect(songList[0]).toBe(mockStartSong);
  });
  test('song chains return correctly', () => {
    const mockStartResponse = [
      { start: 'D', response: ['Z', 'D'] },
      { start: 'A', response: ['Z', 'D', 'A', 'F'] },
      { start: 'B', response: ['B', 'E'] },
    ];
    mockStartResponse.forEach((test) => {
      const songList = linkSingleSong(test.start, mockSongMap);
      console.log(songList);
      expect(songList.length).toBe(test.response.length);
      expect(songList).toEqual(test.response);
    });
  });
});
