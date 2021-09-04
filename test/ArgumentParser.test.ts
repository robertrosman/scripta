import stringArgv from 'string-argv'
import { ArgumentParser } from '../lib/ArgumentParser'
import { Script } from '../lib/Script'

const mockArgv = (args) => stringArgv(args, 'node', 'resolve-options.test.js')

const parseOptions = (argv, options, store?, callback?) => {
  const parser = new ArgumentParser()
  parser.registerScript(new Script({ options, store }), null, callback)
  return parser.parse(argv)
}

describe('ArgumentRegistrator', () => {
  test('returns object', async () => {
    const argumentRegistrator = new ArgumentParser()
    expect(typeof argumentRegistrator).toBe('object')
  })

  test('returns true test option property if found in argv', async () => {
    const argv = mockArgv('--test')

    const options = parseOptions(argv, [{
      name: 'test',
      message: 'some basic bool flag'
    }])

    expect(options.test).toBe(true)
  })

  test('takes shorthand property', async () => {
    const argv = mockArgv('-t')

    const options = parseOptions(argv, [{
      name: 'test',
      shorthand: 't',
      message: 'some basic bool flag'
    }])

    expect(options.test).toBe(true)
  })

  test('converts wrong case', async () => {
    const argv = mockArgv('--test-case')

    const options = parseOptions(argv, [{
      name: 'testCase'
    }])

    expect(options.testCase).toBe(true)
  })

  test('make it a string input if option.type is input', async () => {
    const argv = mockArgv('--hello=world')

    const options = parseOptions(argv, [{
      name: 'hello',
      type: 'input'
    }])

    expect(options.hello).toBe('world')
  })

  test('calls options callback if it is a function', async () => {
    const argv = mockArgv('--hello=world')
    const optionsCallback = (store, parsedOptions) => [
      {
        name: store.name,
        type: 'input'
      }
    ]
    const store = {
      name: 'hello'
    }

    const options = parseOptions(argv, optionsCallback, store)

    expect(options.hello).toBe('world')
  })

  test('parse runs callback if given', async () => {
    const argv = mockArgv('--test')
    const callback = jest.fn()

    const options = parseOptions(argv, [{
      name: 'test',
      message: 'some basic bool flag'
    }], null, callback)

    expect(callback).toHaveBeenCalledTimes(1)
  })
})

describe('generateCommandCall', () => {
  test('returns string with given argument bool value', async () => {
    const questions = [{
      name: 'testFlag',
      type: 'confirm'
    }]
    const answers = { testFlag: true }

    const commandArguments = new ArgumentParser().generateCommandCall(questions, answers)

    expect(commandArguments).toBe('--test-flag')
  })

  test('skips false bool arguments', async () => {
    const questions = [{
      name: 'test',
      type: 'confirm'
    }]
    const answers = { test: false }

    const commandArguments = new ArgumentParser().generateCommandCall(questions, answers)

    expect(commandArguments).toBe('')
  })

  test('returns string with given argument string value', async () => {
    const questions = [{
      name: 'test',
      type: 'input'
    }]
    const answers = { test: '"that\'s" right' }

    const commandArguments = new ArgumentParser().generateCommandCall(questions, answers)

    // Hmm, some strange behaviour with jest and escaped quotes, but it does work indeed
    // console.log(commandArguments)  // Try this to see for yourself
    expect(commandArguments).toBe(`--test "\\"that's\\" right"`)
  })

})
