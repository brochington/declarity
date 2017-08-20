import EntityWrapper from '../EntityWrapper';
import Declarity from '../index';

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

    it('Calls systems if present', () => {
      const spy = sinon.spy();

      const testSystem = {
        create: () => {
          spy();
        },
      };
      class TestEntity {
        render = () => {
          return Declarity.createEntity('entity', {
            key: 'childEntity',
            systems: [testSystem],
          });
        };
      }

      const testEntity = Declarity.createEntity(TestEntity, {
        key: 'parentEntity',
      });

      Declarity.register(testEntity);

      Declarity.deregister(testEntity);

      expect(spy.calledOnce).to.equal(true);
    });
  });

  context('shouldUpdate()', () => {
    it('Updates when shouldUpdate returns true', () => {
      const spy = sinon.spy();

      class Entity {
        shouldUpdate = () => {
          spy();
          return true;
        };
        willUpdate = spy;
        update = spy;
        didUpdate = spy;
      }

      const entityWrapper = new EntityWrapper(Entity);
      entityWrapper.mount({});
      entityWrapper.update();

      expect(spy.callCount).to.equal(4);
    });

    it('Does not update when shouldUpdate returns false', () => {
      const spy = sinon.spy();

      class Entity {
        shouldUpdate = () => {
          return false;
        };
        willUpdate = spy;
        update = spy;
        didUpdate = spy;
      }

      const entityWrapper = new EntityWrapper(Entity);
      entityWrapper.mount({});
      entityWrapper.update();

      expect(spy.callCount).to.equal(0);
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

    it('Calls systems if present', () => {
      const spy = sinon.spy();

      const testSystem = {
        update: () => {
          spy();
        },
      };
      class TestEntity {
        render = () => {
          return Declarity.createEntity('entity', {
            key: 'childEntity',
            systems: [testSystem],
          });
        };
      }

      const testEntity = Declarity.createEntity(TestEntity, {
        key: 'parentEntity',
      });

      Declarity.register(testEntity);
      Declarity.register(testEntity);

      Declarity.deregister(testEntity);

      expect(spy.calledOnce).to.equal(true);
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
