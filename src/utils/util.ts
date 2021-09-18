import { randomBytes } from 'crypto';

/**
 * @method isEmpty
 * @param {String | Number | Object} value
 * @returns {Boolean} true & false
 * @description this value is Empty Check
 */
export const isEmpty = (value: string | number | object): boolean => {
  if (value === null) {
    return true;
  } else if (typeof value !== 'number' && value === '') {
    return true;
  } else if (typeof value === 'undefined' || value === undefined) {
    return true;
  } else if (value !== null && typeof value === 'object' && !Object.keys(value).length) {
    return true;
  } else {
    return false;
  }
};

export function randomString(length) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const randomBytesArr = randomBytes(length);
  const result = new Array(length);

  let cursor = 0;
  for (let i = 0; i < length; i++) {
    cursor += randomBytesArr[i];
    result[i] = chars[cursor % chars.length];
  }

  return result.join('');
}
