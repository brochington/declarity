// TODO: figure out a way to make systems lifecycle methods work if original entity doesn't have method.
const noop = () => {};

class Entity {
  willMount = noop;
  create = noop;
  didCreate = noop;
  didMount = noop;
  willUpdate = noop;
  update = noop;
  didUpdate = noop;
}

export default Entity;
