import Declarity from '../src'

describe('Declarity', () => {
    it('exists', () => {
        expect(Declarity).to.exist
        expect(Declarity).to.have.property('register')
        expect(Declarity).to.have.property('createEntity')
    })
    describe('createEntity() -> ', () => {
        it('create entity without children', () => {
            class TestEntity {

            }

            const testProps = {
                key: 'testEntity'
            }

            const result = Declarity.createEntity(TestEntity, testProps);

            console.log(result)
            expect(result).to.exist;
            expect(result).to.be.instanceof(Object);
            expect(result.children).to.have.length(0);
            expect(result.entityClassName).to.equal('TestEntity');
            expect(result.props).to.eql(testProps);
            expect(result.key).to.equal(testProps.key);
            expect(result).to.have.property('entityClass');
            expect(new result.entityClass()).to.be.instanceof(TestEntity);
        })
    })
    describe('register() -> ', () => {
        it('')
    })

});
