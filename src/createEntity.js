import {has} from 'ramda';

export const createEntity = (entityClass, props, ...children) => {
    // console.log('createEntity');
    // console.log('props', props);
    // TODO: Do better error handling!
    // TODO: is there a way to not have keys on every entity, or to infer them?
    //
    // if (!props || !has('key', props)) {
    //     console.error('Entity does not has key prop: ', entityClass.name, props);
    // }

    return {
        entityClass,
        entityClassName: entityClass.name,
        props,
        key: props && props.key ? props.key : entityClass.name + '-no-key',
        children
    };
}
