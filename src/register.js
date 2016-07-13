export const register = (entityToRegister) => {
    console.log('register this junk!', entityToRegister);
    console.time('mount');
    entityToRegister.mount();
    console.timeEnd('mount');
}
