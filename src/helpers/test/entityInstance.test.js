import * as entityInstanceHelpers from '../entityInstance'

describe('Entity Instance helpers ->', () => {
    describe('diffComponents() -> ', () => {
        it('has correct diff output', () => {
            const oldContent = [{key: '1'}, {key: '2'}, {key: '3'}, {key: '4'}]
            const newContent = [{key: '1'}, {key: '5'}]

            const diffContent = entityInstanceHelpers.diffComponents(oldContent, newContent)

            expect(diffContent.added).to.eql([{key: '5'}])
            expect(diffContent.removed).to.eql([{key: '2'}, {key: '3'}, {key: '4'}])
            expect(diffContent.updated).to.eql([[{key: '1'}, {key: '1'}]])
        })
    })

    describe('mountChild() ->', () => {
        it('calls entityInstance.mount()', () => {
            const callback = sinon.spy()
            const childEntity = {
                entityInstance: {
                    mount: callback
                }
            }

            entityInstanceHelpers.mountChild(childEntity)

            expect(callback.calledOnce).to.equal(true)
        })
    })

    describe('prepareChildContentForMounting() -> ', () => {
        it('returns correct content', () => {
            const props = {key: 'testKey'}
            const children = []
            const entityClass = class TestEntityClass {

            }
            const context = {}

            const childContent = {
                entityClass,
                props,
                children,
                context
            }

            const groomedContent = entityInstanceHelpers.prepareChildContentForMounting(childContent)

            expect(groomedContent.props).to.eql(props);
            expect(groomedContent.children).to.eql(children);
            expect(groomedContent.context).to.eql(context);
            expect(groomedContent.key).to.equal('testKey');
            expect(groomedContent.entityClassName).to.equal(entityClass.name)
            expect(groomedContent.entityInstance.entityClass.name).to.equal(entityClass.name)
        })
    })

    describe('mountChildren()', () => {
        it('calls mount on children', () => {
            const props = {key: 'testKey'}
            const children = []
            const entityClass = class TestEntityClass {

            }
            const context = {}

            const childContent = {
                entityClass,
                props,
                children,
                context
            }

            const childrenReadyForMounting = [childContent, null]
            const childEntities = entityInstanceHelpers.mountChildren(childrenReadyForMounting);

            expect(childEntities).to.have.length(1)
            //TODO: write a couple more assertions here to check child entity.

        })
    })

    describe('updateChild()', () => {
        it('calls updateChild, and returns oldChild', () => {
            const callback = sinon.spy()

            const oldChild = {
                entityInstance: {
                    update: callback
                }
            }

            const newChild = {
                props: {},
                children: [],
                context: {}
            }

            const result = entityInstanceHelpers.updateChild([oldChild, newChild])

            expect(callback.calledOnce).to.equal(true)
            expect(result).to.eql(oldChild)
        })
    })

    describe('removeChild()', () => {
        it('calls entityInstance.remove()', () => {
            const callback = sinon.spy()
            const childEntity = {
                entityInstance: {
                    remove: callback
                }
            }

            entityInstanceHelpers.removeChild(childEntity)

            expect(callback.calledOnce).to.equal(true)
        })
    })

    describe('removeChildren()', () => {
        it('No calls are made to entityInstance.remove() if childrenToRemove.length === 0', () => {
            const callback = sinon.spy();

            const childEntities = [];

            entityInstanceHelpers.removeChildren(childEntities)
            expect(callback.called).to.equal(false)
        })

        it('Calls entityInstance.remove() on all child entities', () => {
            const callback = sinon.spy();
            const childEntities = [{
                entityInstance: {
                    remove: callback
                }
            }, {
                entityInstance: {
                    remove: callback
                }
            }, {
                entityInstance: {
                    remove: callback
                }
            }];

            entityInstanceHelpers.removeChildren(childEntities)
            expect(callback.calledThrice).to.equal(true)
        })
    })

    describe('getRenderContent() ->', () => {
        it('handles entity with no render method', () => {
            const entity = {};
            const renderContent = entityInstanceHelpers.getRenderContent(entity, null);
            expect(renderContent).to.be.instanceof(Array);
            expect(renderContent).to.have.lengthOf(0)
        })

        it('returns no content from entity.render call ', () => {
            const returnVals = [null, undefined]
            const entities = returnVals.map(val => ({render: () => {return val}}))

            entities.forEach(entity => {
                const renderContent = entityInstanceHelpers.getRenderContent(entity, null);
                expect(renderContent).to.be.instanceof(Array);
                expect(renderContent).to.have.lengthOf(0)
            })
        })

        it('returns correct content ', () => {
            const args = [
                [[{}], null],
                [{key: 'test'}, null],
                [[{key: 'test'}, null], null]
            ]

            args.map(([returnVal, params]) => {
                const entity = {render: () => returnVal};
                const renderContent = entityInstanceHelpers.getRenderContent(entity, null);
                expect(renderContent).to.be.instanceof(Array)
                expect(renderContent).to.have.lengthOf(1)
            })
        })
    })
})
