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

            expect(script.context.store.testData).toBe(true)
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

                expect(script.optionsArray[0].default).toBe("something else")
            })

            test('runs Form with questions', async () => {
                const formSpy = jest.spyOn(Form, 'run').mockImplementation(async () => {})
                const options = [
                    {
                        name: 'testData',
                        type: 'confirm',
                        message: 'Do you want to test this?'
                    }
                ]
                const script = new Script({ options })

                await script.runForm()

                expect(formSpy).toHaveBeenCalledTimes(1)
            })
        })

    })

})