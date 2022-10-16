import { generateRandomString } from '../sapControl/helpers/helpers';
const randomCheck = {};

export const getId = () => {
  let id = generateRandomString(8);
  while (randomCheck[id]) {
    id = generateRandomString(8);
  }
  randomCheck[id] = id;
  return id;
};
