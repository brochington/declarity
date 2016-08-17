import {sampleSize} from 'lodash';

const chars = "abcdefghijklmnopqrstufwxyzABCDEFGHIJKLMNOPQRSTUFWXYZ1234567890".split('');

export function createRandomString(length = 12) {
    return sampleSize(chars, length).join("");
}
