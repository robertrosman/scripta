import { stringArgv } from 'string-argv'
import { resolveOptions, generateCommandArguments } from '../lib/resolve-options'
import mockInquirer from 'mock-inquirer'

const mockArgv = (args) => stringArgv(args, 'node', 'resolve-options.test.js')

describe('resolveOptions', () => {
  test('returns object', async () => {
    const options = await resolveOptions()
    expect(typeof options).toBe('object')
  })

  test('returns true test option property if found in argv', async () => {
    const argv = mockArgv('--test')

    const options = await resolveOptions(argv, [{
      name: 'test',
      message: 'some basic bool flag'
    }])

    expect(options.test).toBe(true)
  })

  test('takes shorthand property', async () => {
    const argv = mockArgv('-t')

    const options = await resolveOptions(argv, [{
      name: 'test',
      shorthand: 't',
      message: 'some basic bool flag'
    }])

    expect(options.test).toBe(true)
  })

  test('converts wrong case', async () => {
    const argv = mockArgv('--test-case')

    const options = await resolveOptions(argv, [{
      name: 'testCase'
    }])

    expect(options.testCase).toBe(true)
  })

  test('make it a string input if option.type is input', async () => {
    const argv = mockArgv('--hello=world')

    const options = await resolveOptions(argv, [{
      name: 'hello',
      type: 'input'
    }])

    expect(options.hello).toBe('world')
  })

  test('asks user for answer if not provided by argv', async () => {
    const argv = mockArgv('')
    mockInquirer([{
      test: 'answer'
    }])
    const options = await resolveOptions(argv, [{
      name: 'test',
      type: 'input',
      message: 'Please answer the question'
    }])

    expect(options.test).toBe('answer')
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

    const options = await resolveOptions(argv, optionsCallback, [store])

    expect(options.hello).toBe('world')
  })

})

describe('generateCommandArguments', () => {
  test('returns string with given argument bool value', async () => {
    const questions = [{
      name: 'testFlag',
      type: 'confirm'
    }]
    const answers = { testFlag: true }

    const commandArguments = generateCommandArguments(questions, answers)

    expect(commandArguments).toBe('--test-flag')
  })

  test('skips false bool arguments', async () => {
    const questions = [{
      name: 'test',
      type: 'confirm'
    }]
    const answers = { test: false }

    const commandArguments = generateCommandArguments(questions, answers)

    expect(commandArguments).toBe('')
  })

  test('returns string with given argument string value', async () => {
    const questions = [{
      name: 'test',
      type: 'input'
    }]
    const answers = { test: '"that\'s" right' }

    const commandArguments = generateCommandArguments(questions, answers)

    // Hmm, some strange behaviour with jest and escaped quotes, but it does work indeed
    // console.log(commandArguments)  // Try this to see for yourself
    expect(commandArguments).toBe(`--test "\\"that's\\" right"`)
  })
})
