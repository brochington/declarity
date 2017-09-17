/* @flow */
import { sampleSize } from 'lodash';

const chars: Array<string> = 'abcdefghijklmnopqrstufwxyzABCDEFGHIJKLMNOPQRSTUFWXYZ1234567890'.split(
  ''
);

export function createRandomString(length: number = 12): string {
  return 'a' + sampleSize(chars, length - 1).join('');
}
