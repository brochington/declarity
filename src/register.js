/* @flow */
import EntityWrapper from './EntityWrapper';

let entityKeys = new Map();

export const register = (configObj: {entityClass: any, children: any, props: ?Object}, context: ?Object): void => {
    const {entityClass, children} = configObj;
    const props = configObj.props || {};

    const newProps: Object = {key: 'parent', ...props};

    if (entityKeys.has(newProps.key)) {
        console.log('second');
        const wrappedEntity: EntityWrapper = entityKeys.get(newProps.key)
        wrappedEntity.updateParams(newProps, children, context);
        wrappedEntity.update();
    }

    else {
        console.log('first');
        const wrappedEntity: EntityWrapper = new EntityWrapper(entityClass, newProps, children);
        wrappedEntity.mount(newProps, children, context);

        entityKeys.set(newProps.key, wrappedEntity)
    }

    // might want to return something here so that the mounted component can be dismounted later.
}
