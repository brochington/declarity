import Declarity from '../src'

describe('Declarity', () => {
    it('exists', () => {
        expect(Declarity).to.exist
        expect(Declarity).to.have.property('register')
        expect(Declarity).to.have.property('createEntity')
    })
    describe('createEntity() -> ', () => {
        it('creates new entity class without children', () => {
            class TestEntity {

            }

            const testProps = {
                key: 'testEntity'
            }

            const result = Declarity.createEntity(TestEntity, testProps);

            expect(result).to.exist;
            expect(result).to.be.instanceof(Object);
            expect(result.children).to.have.length(0);
            expect(result.entityClassName).to.equal('TestEntity');
            expect(result.props).to.eql(testProps);
            expect(result.key).to.equal(testProps.key);
            expect(result).to.have.property('entityClass');
            expect(new result.entityClass()).to.be.instanceof(TestEntity);
        })
        it('creates new entity class of type "entity"', () => {
            const testProps = {
                key: 'testEntity'
            }

            const result = Declarity.createEntity('entity', testProps)
            expect(result).to.exist;
            expect(result).to.be.instanceof(Object);
            expect(result.children).to.have.length(0);
            expect(result.entityClassName).to.equal('Entity');
            expect(result.props).to.eql(testProps);
            expect(result.key).to.equal(testProps.key);
            expect(result).to.have.property('entityClass');
        })

        it('creates entity with children', () => {
            class TestEntity1 {

            }

            class TestEntity2 {

            }
        })
    })
    describe('register() -> ', () => {
        it('registers entity', () => {
            // console.log(sinon)
            // const testEntitySpy = sinon.spy()
            // class TestEntity1 {
            //     create = () => {
            //         testEntitySpy()
            //     }
            // }
            //
            // class TestEntity2 {
            //     create = () => {
            //         testEntitySpy()
            //     }
            // }
            //
            // const configObj = {
            //     entityClass: TestEntity1,
            //     children: Declarity.createEntity(TestEntity2, {key: 'testEntity2'}),
            //     props: {
            //         key: 'testEntity1'
            //     }
            // }
            // Declarity.register(configObj)
            // console.log(testEntitySpy)
            // expect(testEntityCreateSpy.)
        })
    })

});
