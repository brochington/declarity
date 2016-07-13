import EntityWrapper from './EntityWrapper';

export const createEntity = (entityClass, props, ...children) => {
    return new EntityWrapper(entityClass, props, children);
}
