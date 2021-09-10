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

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

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
                options: (store, options) => [
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
            script.options = {}
            script.setupOptions()

            expect(script.options.testData).toBe("value in store")
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

            script.options = {}
            script.setupOptions()

            expect(script.definition.options[0].default).toBe(true)
            expect(script.definition.options[1].default).toBe(undefined)
            expect(script.definition.storeDefaultOptions.length).toBe(1)
        })

    })

    describe('run', () => {
        test('runs command with given options and form answers', async () => {
            const formSpy = jest.spyOn(Form, 'run').mockImplementation(async (_, options) => ({ formOption: "test2", ...options }))
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
            const command = jest.fn()
            const script = new Script({
                options: [
                    {
                        name: 'option',
                        type: 'input',
                        message: 'This is passed into function'
                    },
                    {
                        name: 'formOption',
                        type: 'input',
                        message: 'This is asked from user'
                    }
                ],
                command
            })

            await script.run({ option: "test" })

            expect(command).toHaveBeenCalled()
            expect(command.mock.calls[0][0].option).toBe("test")
            expect(command.mock.calls[0][0].formOption).toBe("test2")
            expect(command.mock.calls[0][1]).toBe(script.context)
        })
    })

    describe('runForm', () => {
        test('runs setupOptions again with options', async () => {
            const formSpy = jest.spyOn(Form, 'run').mockImplementation(async (_, options) => (options))
            const script = new Script({
                options: (store, options) => [
                    {
                        name: 'testData',
                        type: 'confirm',
                        message: 'Do you want to test this?',
                        default: options?.testData
                    }
                ]
            })

            script.options = { testData: "something else" }
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
            expect(script.options.first).toBe(true)
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

            script.options = {}
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

            script.options = {}
            await script.runForm()

            expect(script.definition.storeDefaultOptions.length).toBe(1)
            expect(script.store.saveThis).toBe(true)
            expect(script.store.doNotSave).toBe(undefined)
        })

    })

    describe('extendContext', () => {
        test('adds variables to context', async () => {
            const command = jest.fn()
            const script = new Script({ command })

            script.extendContext({ __dirname: "/my/path" })

            expect(script.context.__dirname).toBe("/my/path")
        })
    })
})