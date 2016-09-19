import EntityWrapper from './EntityWrapper';

export const register = ({entityClass, props, children}) => {

    const wrappedEntity = new EntityWrapper(entityClass, props, children, {}, true);

    wrappedEntity.mount(props, children);

    // for testing updating of components.
    // window.setInterval(() => {
    //     wrappedEntity.update();
    // }, 2000);
}
