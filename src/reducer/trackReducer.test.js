import trackReducer from './trackReducer';

const mockTrack = { name: 'mockTrack' };
const mockNewTrack = { name: 'newTrack' };

describe('trackReducer add action tests:', () => {
  test('adds a track to the end of the list', () => {
    const mockTrackList = [mockTrack];
    const newTrackList = trackReducer(mockTrackList, {
      type: 'add',
      track: mockNewTrack,
    });
    expect(newTrackList.length).toBe(2);
    expect(newTrackList[1].name).toEqual(mockNewTrack.name);
  });

  test('adds to the list if it is empty', () => {
    const mockTrackList = [];
    const newTrackList = trackReducer(mockTrackList, {
      type: 'add',
      track: mockNewTrack,
    });
    expect(newTrackList.length).toBe(1);
    expect(newTrackList[0].name).toEqual(mockNewTrack.name);
  });

  test('gives newly added track a unique id', () => {
    const mockTrackList = [];
    const initialTrackList = trackReducer(mockTrackList, {
      type: 'add',
      track: mockTrack,
    });
    const newTrackList = trackReducer(initialTrackList, {
      type: 'add',
      track: mockNewTrack,
    });
    const lastTrackList = trackReducer(newTrackList, {
      type: 'add',
      track: mockNewTrack,
    });
    expect(lastTrackList.length).toBe(3);
    expect(lastTrackList[1].name).toBe(lastTrackList[2].name);
    expect(lastTrackList[1].id).not.toBe(lastTrackList[2].id);
    expect(lastTrackList[1].id).not.toBe(lastTrackList[0].id);
  });
});

describe('trackReducer edit action tests:', () => {
  test('replaces the correct track with new track', () => {
    const mockTrackList = [
      { ...mockTrack, id: 'abc' },
      { ...mockNewTrack, id: 'def' },
      { ...mockTrack, id: 'ghi' },
    ];
    const modifiedTrack = { name: 'modified', id: 'def' };
    const modifiedTrackList = trackReducer(mockTrackList, {
      type: 'edit',
      track: modifiedTrack,
    });

    expect(modifiedTrackList.length).toBe(3);
    expect(modifiedTrackList[0].name).toBe(mockTrackList[0].name);
    expect(modifiedTrackList[1].id).toBe(mockTrackList[1].id);
    expect(modifiedTrackList[1].name).toBe(modifiedTrack.name);
    expect(modifiedTrackList[2].name).toBe(mockTrackList[2].name);
  });
});

describe('trackReducer duplicate action tests', () => {
  test('duplicates given track', () => {
    const initialTrack = { ...mockTrack, id: 'abc' };
    const mockTrackList = [initialTrack];
    const newTrackList = trackReducer(mockTrackList, {
      type: 'duplicate',
      track: initialTrack,
    });

    expect(newTrackList.length).toBe(2);
    expect(newTrackList[0].name).toBe(newTrackList[1].name);
    expect(newTrackList[0].id).not.toBe(newTrackList[1].name);
  });

  test('puts duplicate just after track that is being duplicated', () => {
    const initialTrack = { name: 'duplicate', id: 'abc' };
    const mockTrackList = [
      { ...mockTrack, id: 'def' },
      { ...mockTrack, id: 'ghi' },
      initialTrack,
      { ...mockNewTrack, id: 'jkl' },
      { ...mockNewTrack, id: 'mno' },
    ];
    const newTrackList = trackReducer(mockTrackList, {
      type: 'duplicate',
      track: initialTrack,
    });

    expect(newTrackList.length).toBe(mockTrackList.length + 1);
    expect(newTrackList[3].name).toBe(initialTrack.name);
    expect(newTrackList[3].id).not.toBe(initialTrack.id);
    expect(newTrackList[5]).toEqual(mockTrackList[4]);
  });
});

describe('trackReducer initialize action tests:', () => {
  test('initializes trackList with new trackList', () => {
    const mockTrackList = [mockTrack, mockTrack, mockNewTrack, mockNewTrack];
    const newTrackList = trackReducer([], {
      type: 'initialize',
      tracks: mockTrackList,
    });
    expect(newTrackList.length).toBe(mockTrackList.length);
  });
});

describe('trackReducer error handling tests:', () => {
  test('Unhandled action throws and error', () => {
    const mockError = new Error('Unhandled action invalid');
    expect(() => trackReducer([], { type: 'invalid' })).toThrowError(mockError);
  });
});
