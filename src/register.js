import EntityWrapper from './EntityWrapper';

export const register = ({entityClass, props = {}, children}) => {
    const newProps = {key: 'parent', ...props};

    const wrappedEntity = new EntityWrapper(entityClass, newProps, children, {}, true);

    wrappedEntity.mount(newProps, children);
}
