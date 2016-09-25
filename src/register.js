import EntityWrapper from './EntityWrapper';

export const register = ({entityClass, props = {}, children}) => {
    console.log('register');
    const newProps = {key: 'parent', ...props};
    console.log('newProps', newProps);
    const wrappedEntity = new EntityWrapper(entityClass, newProps, children, {}, true);

    wrappedEntity.mount(newProps, children);
}
