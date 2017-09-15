import Declarity from '../index';
import { getRegisteredEntities } from '../registration';

describe('Declarity', function() {
  it('exists', () => {
    expect(Declarity).to.exist;
    expect(Declarity).to.have.property('register');
    expect(Declarity).to.have.property('createEntity');
  });

  describe('createEntity() -> ', () => {
    it('creates new entity class without children', () => {
      class TestEntity {}

      const testProps = {
        key: 'testEntity',
      };

      const result = Declarity.createEntity(TestEntity, testProps);

      expect(result).to.exist;
      expect(result).to.be.instanceof(Object);
      expect(result.children).to.have.length(0);
      expect(result.entityClassName).to.equal('TestEntity');
      expect(result.props).to.eql(testProps);
      expect(result.key).to.equal(testProps.key);
      expect(result).to.have.property('entityClass');
      expect(new result.entityClass()).to.be.instanceof(TestEntity);
    });

    it('creates new entity class of type "entity"', () => {
      const testProps = {
        key: 'testEntity',
      };

      const result = Declarity.createEntity('entity', testProps);
      expect(result).to.exist;
      expect(result).to.be.instanceof(Object);
      expect(result.children).to.have.length(0);
      expect(result.entityClassName).to.equal('Entity');
      expect(result.props).to.eql(testProps);
      expect(result.key).to.equal(testProps.key);
      expect(result).to.have.property('entityClass');
    });

    it('creates entity with children', () => {
      const testEntitySpy = sinon.spy();

      class TestEntity1 {
        create = () => {
          testEntitySpy();
        };

        render = ({ children }) => {
          return children;
        };
      }

      class TestEntity2 {
        create = () => {
          testEntitySpy();
        };
      }

      const childEntity = Declarity.createEntity(TestEntity2, {
        key: 'testEntity2',
      });

      const testEntity = Declarity.createEntity(
        TestEntity1,
        { key: 'testEntity1' },
        childEntity
      );

      Declarity.register(testEntity);

      Declarity.deregister(testEntity);

      expect(testEntitySpy.calledTwice).to.equal(true);
    });
  });

  describe('register() -> ', () => {
    it('registered entity is added to entities map', () => {
      const spy = sinon.spy();

      class TestEntity {
        create = () => {};
        willUnmount = spy;
        didUnmount = spy;
      }

      const entityKey = 'testEntity10';

      const testEntity = Declarity.createEntity(TestEntity, {
        key: entityKey,
      });

      Declarity.register(testEntity);

      const entityMap = getRegisteredEntities();
      expect(entityMap).to.be.instanceof(Map);

      for (let key of entityMap.keys()) {
        expect(key).to.equal(entityKey);
      }

      Declarity.deregister(testEntity);

      const deregisteredEntityMap = getRegisteredEntities();

      expect(entityMap).to.be.instanceof(Map);

      expect(deregisteredEntityMap.has(entityKey)).to.equal(false);

      expect(spy.calledTwice).to.equal(true);
    });

    it('registering entity calls create()', () => {
      const testEntitySpy = sinon.spy();

      class TestEntity {
        create = () => testEntitySpy();
      }

      const testEntity = Declarity.createEntity(TestEntity, {
        key: 'testEntity11',
      });

      Declarity.register(testEntity);

      Declarity.deregister(testEntity);

      expect(testEntitySpy.calledOnce).to.equal(true);
    });

    it('registering the same entity multiple times updates tree', () => {
      const createSpy = sinon.spy();
      const updateSpy = sinon.spy();

      class TestEntity1 {
        create = () => createSpy();
        update = () => updateSpy();
        render = ({ children }) => children;
      }

      class TestEntity2 {
        create = () => createSpy();
        update = () => updateSpy();
      }

      const childEntity = Declarity.createEntity(TestEntity2, {
        key: 'testEntity2',
      });

      const testEntity = Declarity.createEntity(
        TestEntity1,
        { key: 'testEntity1' },
        childEntity
      );

      Declarity.register(testEntity);
      Declarity.register(testEntity);

      Declarity.deregister(testEntity);

      expect(createSpy.calledTwice).to.equal(true);
      expect(updateSpy.calledTwice).to.equal(true);
    });
  });
});
