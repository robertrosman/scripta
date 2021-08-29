import { Script } from '../lib/Script.js'

describe('Script.js', () => {
    test('constructor returns object', () => {
        const script = new Script()

        expect(typeof script).toBe('object')

    })

})