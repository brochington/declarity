import EntityWrapper from '../EntityWrapper';

const noop = () => {};

describe('EntityWrapper', function() {
  context('Contruction', () => {
    it('Can create EntityWrapper instance', () => {
      class Entity {
        willMount = noop;
        create = noop;
        didCreate = noop;
        didMount = noop;
        willUpdate = noop;
        update = noop;
        didUpdate = noop;
      }

      const entityWrapper = new EntityWrapper(Entity);

      expect(new entityWrapper.entityClass()).to.be.instanceof(Entity);
      expect(entityWrapper).to.be.instanceof(EntityWrapper);
    });
  });

  context('mount()', () => {
    it('Calls lifecycle methods', () => {
      const spy = sinon.spy();

      class Entity {
        willMount = spy;
        create = spy;
        didCreate = spy;
        didMount = spy;
        willUpdate = noop;
        update = noop;
        didUpdate = noop;
        render = spy;
      }

      const entityWrapper = new EntityWrapper(Entity);

      entityWrapper.mount({});

      expect(spy.callCount).to.equal(5);
    });
  });

  context('update()', () => {
    it('Calls lifecycle methods', () => {
      const spy = sinon.spy();

      class Entity {
        willMount = noop;
        create = noop;
        didCreate = noop;
        didMount = noop;
        willUpdate = spy;
        update = spy;
        didUpdate = spy;
      }

      const entityWrapper = new EntityWrapper(Entity);
      entityWrapper.mount({});
      entityWrapper.update();

      expect(spy.callCount).to.equal(3);
    });
  });

  context('remove()', () => {
    it('Calls lifecycle methods', () => {
      const spy = sinon.spy();

      class Entity {
        willMount = noop;
        create = noop;
        didCreate = noop;
        didMount = noop;
        willUpdate = noop;
        update = noop;
        didUpdate = noop;
        willUnmount = spy;
        didUnmount = spy;
      }

      const entityWrapper = new EntityWrapper(Entity);
      entityWrapper.mount({});
      entityWrapper.remove();

      expect(spy.callCount).to.equal(2);
    });
  });
});
