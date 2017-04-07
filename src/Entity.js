//TODO: figure out a way to make systems lifecycle methods work if original entity doesn't have method.
class Entity {
    willMount = () => {}
    create = () => {}
    didCreate = () => {}
    didMount = () => {}
    willUpdate = () => {}
    update = () => {}
    didUpdate = () => {}
}

export default Entity;
