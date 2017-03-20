import * as entityInstanceHelpers from '../entityInstance'

describe('Entity Instance helpers ->', () => {
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
