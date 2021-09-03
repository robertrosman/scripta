import { Script } from '../lib/Script'
import { Store } from '../lib/Store'

describe('Script.js', () => {
    beforeEach(() => {
        Store.cache = {
            test: {
                testData: true
            }
        }
    })

    describe('constructor', () => {

        test('returns object', () => {
            const script = new Script()

            expect(typeof script).toBe('object')
        })

        test('sets up store', () => {
            const script = new Script({ name: 'test' })

            expect(script.context.store.testData).toBe(true)
        })

        test('calls options callback if function', () => {
            const script = new Script({ 
                name: 'test',
                options: (store, parsedOptions) => [
                    {
                        name: 'testData',
                        type: 'confirm',
                        message: 'Do you want to test this?',
                        default: store.testData
                    }
                ]
            })

            expect(script.optionsArray[0].default).toBe(true)
        })

        test('uses options array if not a function', () => {
            const script = new Script({ 
                name: 'test',
                options: [
                    {
                        name: 'testData',
                        type: 'confirm',
                        message: 'Do you want to test this?'
                    }
                ]
            })

            expect(script.optionsArray[0].name).toBe('testData')
        })


    })

})