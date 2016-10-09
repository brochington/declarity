import {
    pipe,
    filter,
    isNil,
    not,
    reject,
    reduce
} from 'ramda';

export const rejectNil = reject(isNil);

const _contentByKey = (acc, v) => {
    acc[v.key] = v;
    return acc;
}

// Takes an array and creates a map indexed with the key property value in each entry in array.
// [{key: a}] -> {a: {key: a}}
export const contentByKey = (content) => reduce(_contentByKey, {}, content);
