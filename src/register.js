/* @flow */
import EntityWrapper from './EntityWrapper';

export const register = (configObj: {entityClass: any, children: any, props: ?Object}): void => {
    const {entityClass, children} = configObj;
    const props = configObj.props || {};
    // console.log('yo', entityClass, props, children);
    const newProps: Object = {key: 'parent', ...props};

    const wrappedEntity: EntityWrapper = new EntityWrapper(entityClass, newProps, children);

    wrappedEntity.mount(newProps, children);

    // might want to return something here so that the mounted component can be dismounted later.
}
