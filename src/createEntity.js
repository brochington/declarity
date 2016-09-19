export const createEntity = (entityClass, props, ...children) => {
    return {
        entityClass,
        entityClassName: entityClass.name,
        props,
        children
    };
}
