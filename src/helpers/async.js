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


export async function sync(value: Object) {
    console.log('yo');
    if (typeof value.then === 'function') {
        console.log('a');
        const newValue = await value;

        return sync(newValue);
    }

    // Detect if newState is actually a generator function.
    else if (typeof value.next === 'function') {
        console.log('b');
        const newValue = await generatorHandler(value);
        return newValue;
    }

    else {
        console.log('c');
        return value;
    }
};
