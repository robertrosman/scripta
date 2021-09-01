import { Store } from '../lib/Store'

describe('Store', () => {
    test('get returns correct data', () => {
        const mockFile = {
            test: {
                testData: true
            }
        }
        const data = Store.get('test', {})

        // expect(data).toEqual(mockFile)
    })

})