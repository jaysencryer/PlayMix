import { generateRandomString } from '../sapControl/helpers/helpers';
import { getId } from './getId';

jest.mock('../sapControl/helpers/helpers');

test('getId generates random id', () => {
  generateRandomString
    .mockImplementationOnce(() => 'random')
    .mockImplementationOnce(() => 'newrandom');
  const idOne = getId();
  const idTwo = getId();

  expect(idOne).toBe('random');
  expect(idTwo).toBe('newrandom');
});

test('getId generates unique id', () => {
  generateRandomString
    .mockImplementationOnce(() => 'random')
    .mockImplementationOnce(() => 'random')
    .mockImplementationOnce(() => 'newrandom')
    .mockImplementationOnce(() => 'random')
    .mockImplementationOnce(() => 'newrandom')
    .mockImplementationOnce(() => 'finalrandom');

  const idOne = getId();
  const idTwo = getId();
  const idThree = getId();

  expect(idOne).toBe('random');
  expect(idTwo).toBe('newrandom');
  expect(idThree).toBe('finalrandom');
});
