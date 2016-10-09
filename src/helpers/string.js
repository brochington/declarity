/* @flow */
import {sampleSize} from 'lodash';

const chars = "abcdefghijklmnopqrstufwxyzABCDEFGHIJKLMNOPQRSTUFWXYZ1234567890".split('');

export function createRandomString(length: number = 12): string {
    return "a" + sampleSize(chars, length).join("");
}
