import { Form } from '../lib/Form'
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

            expect(script.store.testData).toBe(true)
        })

        test('calls options generator if function', () => {
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

            expect(script.definition.options[0].default).toBe(true)
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

            expect(script.definition.options[0].name).toBe('testData')
        })
    })

    describe('setupOptions', () => {
        test('fetches value from store if setupOnce is set', async () => {
            const script = new Script({
                options: [
                    {
                        name: 'testData',
                        type: 'confirm',
                        message: 'Do you want to test this?',
                        setupOnce: true
                    },
                    {
                        name: 'nextValue',
                        type: 'confirm',
                        message: 'Not set up yet huh?',
                        setupOnce: true
                    }
                ]
            })

            script.store = { testData: "value in store" }
            script.parsedOptions = {}
            script.setupOptions()

            expect(script.parsedOptions.testData).toBe("value in store")
            expect(script.definition.options.length).toBe(1)
        })

        test('set default value from store if storeDefault is true', async () => {
            const script = new Script({
                options: [
                    {
                        name: 'testData',
                        type: 'confirm',
                        message: 'Do you want to test this?',
                        storeDefault: true
                    },
                    {
                        name: 'nextValue',
                        type: 'confirm',
                        message: 'Not set up yet huh?'
                    }
                ]
            })

            script.parsedOptions = {}
            script.setupOptions()

            expect(script.definition.options[0].default).toBe(true)
            expect(script.definition.options[1].default).toBe(undefined)
            expect(script.definition.storeDefaultOptions.length).toBe(1)
        })

    })

    describe('runForm', () => {
        test('runs setupOptions again with parsedOptions', async () => {
            const script = new Script({
                options: (store, parsedOptions) => [
                    {
                        name: 'testData',
                        type: 'confirm',
                        message: 'Do you want to test this?',
                        default: parsedOptions?.testData
                    }
                ]
            })

            script.parsedOptions = { testData: "something else" }
            await script.runForm()

            expect(script.definition.options[0].default).toBe("something else")
        })

        test('runs Form with questions', async () => {
            const formSpy = jest.spyOn(Form, 'run').mockImplementation(async () => ({ first: true }))
            const options = [
                {
                    name: 'first',
                    type: 'confirm',
                    message: 'Do you want to test this?'
                }
            ]
            const script = new Script({ options })

            await script.runForm()

            expect(formSpy).toHaveBeenCalledTimes(1)
            expect(script.parsedOptions.first).toBe(true)
        })

        test('saves value to store if setupOnce is set', async () => {
            const formSpy = jest.spyOn(Form, 'run').mockImplementation(async () => ({ saveThis: true, doNotSave: true }))
            const script = new Script({
                options: [
                    {
                        name: 'saveThis',
                        type: 'confirm',
                        message: 'Do you want to test this?',
                        setupOnce: true
                    },
                    {
                        name: 'doNotSave',
                        type: 'confirm',
                        message: 'Some other value?'
                    }
                ]
            })

            script.parsedOptions = {}
            await script.runForm()

            expect(script.definition.setupOnceOptions.length).toBe(1)
            expect(script.store.saveThis).toBe(true)
            expect(script.store.doNotSave).toBe(undefined)
        })

        test('saves value to store if storeDefault is set', async () => {
            const formSpy = jest.spyOn(Form, 'run').mockImplementation(async () => ({ saveThis: true, doNotSave: true }))
            const script = new Script({
                options: [
                    {
                        name: 'saveThis',
                        type: 'confirm',
                        message: 'Do you want to test this?',
                        storeDefault: true
                    },
                    {
                        name: 'doNotSave',
                        type: 'confirm',
                        message: 'Some other value?'
                    }
                ]
            })

            script.parsedOptions = {}
            await script.runForm()

            expect(script.definition.storeDefaultOptions.length).toBe(1)
            expect(script.store.saveThis).toBe(true)
            expect(script.store.doNotSave).toBe(undefined)
        })

    })
})