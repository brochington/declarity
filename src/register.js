/* @flow */
import EntityWrapper from './EntityWrapper';

export const register = (configObj: {entityClass: any, children: any, props: ?Object}): void => {
    const {entityClass, children} = configObj;
    const props = configObj.props || {};
    // console.log('yo', entityClass, props, children);
    const newProps: Object = {key: 'parent', ...props};

    const wrappedEntity: EntityWrapper = new EntityWrapper(entityClass, newProps, children);

    wrappedEntity.mount(newProps, children);
}
