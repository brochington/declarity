/* A recursive function to handle the output of generator functions. */
export async function generatorHandler(genObject: Object) {
    const {value, done} = genObject.next();

    if (value) {
        if (typeof value.then === 'function') {
            await value;
        }
    }

    return done
            ? sync(value)
            : generatorHandler(genObject)

};

// Calls nested async types in a sync manner.
export async function sync(value: Object) {
    if (typeof value.then === 'function') {
        const newValue = await value;

        return sync(newValue);
    }

    // Detect if newState is actually a generator function.
    else if (typeof value.next === 'function') {
        const newValue = await generatorHandler(value);
        return newValue;
    }

    else {
        return value;
    }
};
