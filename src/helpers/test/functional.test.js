import {rejectNil, contentByKey} from '../functional.js'

describe("functional helpers -> ", function() {
    it('rejectNil', function() {
        const originalContent = ['a', 2, null, undefined, {}, null, undefined]
        const newContent = rejectNil(originalContent)

        expect(newContent).to.eql(['a', 2, {}])
    })

    it('contentByKey', function() {
        const originalContent = [{key: 'a'}, {key: 'b'}]
        const newContent = contentByKey(originalContent)

        expect(newContent).to.eql({
            a: {key: 'a'},
            b: {key: 'b'}
        })
    })
})
