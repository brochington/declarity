/* @flow */
import EntityWrapper from './EntityWrapper';

export const register = (configObj: Object) => {
    const {entityClass, children} = configObj;
    const props = configObj || {};
    // console.log('yo', entityClass, props, children);
    const newProps = {key: 'parent', ...props};

    const wrappedEntity = new EntityWrapper(entityClass, newProps, children, {}, true);

    wrappedEntity.mount(newProps, children);
}
