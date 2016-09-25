import {
    pipe,
    filter,
    isNil,
    not,
    reject
} from 'ramda';

export const rejectNil = reject(isNil);
