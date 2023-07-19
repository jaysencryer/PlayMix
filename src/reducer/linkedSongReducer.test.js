import linkedSongReducer, { ADD, AFTER, BEFORE } from './linkedSongReducer';

describe('linkedSongReducer Add action tests', () => {
  const mockSong = {
    uri: '1234ABC',
    name: 'Test Song',
    before: null,
    after: null,
  };

  const mockBefore = {
    uri: '456fluff',
    name: 'Before Song',
    before: null,
    after: null,
  };

  const mockAfter = {
    uri: '987corgi',
    name: 'After Song',
    before: null,
    after: null,
  };

  test('adds new track if not in list', () => {
    const testAction = {
      type: ADD,
      songToAdd: mockSong,
    };

    const newList = linkedSongReducer(new Map(), testAction);
    expect(newList.size).toBe(1);
    expect(newList.get(mockSong.uri).name).toBe(mockSong.name);
  });

  test('when song A added as before song B, song As after is set to Song B', () => {
    const linkedBefore = { ...mockBefore };
    const linkedAfter = { ...mockAfter };

    const testAction = {
      type: ADD,
      songToAdd: linkedBefore,
      existingSong: linkedAfter,
      position: BEFORE,
    };

    const existingList = new Map();
    existingList.set(mockSong.uri, mockSong);
    existingList.set(mockAfter.uri, linkedAfter);

    const newList = linkedSongReducer(existingList, testAction);
    expect(newList.size).toBe(3);
    expect(newList.get(mockBefore.uri).after).toBe(mockAfter.uri);
    expect(newList.get(mockAfter.uri).before).toBe(mockBefore.uri);
  });

  test('song already exists and no before or after provided', () => {
    const testAction = {
      type: ADD,
      songToAdd: mockSong,
    };

    const existingList = new Map();
    const linkedMockSong = { ...mockSong };
    const linkedBeforeSong = { ...mockBefore };
    linkedMockSong.before = mockBefore.uri;
    linkedBeforeSong.after = mockSong.uri;
    existingList.set(linkedMockSong.uri, linkedMockSong);
    existingList.set(linkedBeforeSong.uri, linkedBeforeSong);

    const newList = linkedSongReducer(existingList, testAction);

    expect(newList.get(linkedMockSong.uri).before).toBe(linkedBeforeSong.uri);
    expect(newList.get(linkedBeforeSong.uri).after).toBe(linkedMockSong.uri);
  });

  test('song already exists as a position, take no action', () => {
    const linkedBeforeSong = { ...mockBefore };
    linkedBeforeSong.before = mockSong.uri;
    const linkedMockSong = { ...mockSong };
    linkedMockSong.after = linkedBeforeSong.uri;
    const existingList = new Map();
    existingList.set(linkedMockSong.uri, linkedMockSong);
    existingList.set(linkedBeforeSong.uri, linkedBeforeSong);

    const testAction = {
      type: ADD,
      songToAdd: mockSong,
      position: AFTER,
      existingSong: linkedBeforeSong,
    };

    console.log(existingList);

    const newSongList = linkedSongReducer(existingList, testAction);
    // const newSongList = existingList;
    console.log(newSongList);
    expect(newSongList.get(linkedMockSong.uri).after).toBe(
      linkedBeforeSong.uri,
    );
    expect(newSongList.get(linkedBeforeSong.uri).before).toBe(
      linkedMockSong.uri,
    );
  });

  test('Add a song in a position it already exists in does nothing', () => {
    const linkedAfter = { ...mockAfter };
    linkedAfter.before = mockBefore.uri;
    const linkedBefore = { ...mockBefore };
    linkedBefore.after = mockAfter.uri;
    const testAction = {
      type: ADD,
      songToAdd: mockBefore,
      position: BEFORE,
      existingSong: mockSong,
    };

    const existingList = new Map();
    existingList.set(linkedBefore.uri, linkedBefore);
    existingList.set(linkedAfter.uri, linkedAfter);
    existingList.set(mockSong.uri, mockSong);
    console.log(existingList);

    const newSongList = linkedSongReducer(existingList, testAction);

    expect(newSongList).toEqual(existingList);
    // expect(newSongList.get(mockBefore.uri).after).toBe(mockAfter.uri);
    // expect(newSongList.get(mockAfter.uri).before).toBe(mockBefore.uri);
  });

  test('Attempting to add a song to itself does nothing', () => {
    const testAction = {
      type: ADD,
      songToAdd: mockSong,
      position: BEFORE,
      existingSong: mockSong,
    };
    const existingList = new Map();
    existingList.set(mockSong.uri, mockSong);

    const newSongList = linkedSongReducer(existingList, testAction);
    expect(newSongList).toEqual(existingList);
  });
});

test('Unsupported action type throws error', () => {
  const testAction = {
    type: 'Unsupported',
  };
  const testList = listBuilder('a', 2, '6');

  expect(() => linkedSongReducer(null, testAction)).toThrowError();
});

const listBuilder = (...args) => {
  const newMap = new Map();
  for (const item of args) {
    if (item?.uri) {
      newMap.set(item.uri, item);
    }
  }
  console.log(args);
  return newMap;
};
