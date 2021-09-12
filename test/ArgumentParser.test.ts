import stringArgv from 'string-argv'
import { TabCompleter } from '../lib/TabCompleter'
import { ArgumentParser } from '../lib/ArgumentParser'
import { Script } from '../lib/Script'

const mockArgv = (args) => stringArgv(args, 'node', 'resolve-options.test.js')

const parseOptions = (argv, options) => {
  const parser = new ArgumentParser()
  parser.addOptions(options)
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

  test('do not generate arguments if formOnly is true', async () => {
    const parser = new ArgumentParser()

    parser.addOptions([
      {
        name: 'hello',
        type: 'input'
      },
      {
        name: 'onlyInForm',
        type: 'confirm',
        formOnly: true
      }
    ])

    expect((parser.program as any).options.length).toBe(1)
    expect((parser.program as any).options[0].long).toBe('--hello')
  })

  test('parse runs callback if given', async () => {
    const argv = mockArgv('test --test')
    const callback = jest.fn()
    const parser = new ArgumentParser()
    parser.registerScript(new Script({
      options: [{
        name: 'test',
        message: 'some basic bool flag'
      }]
    }), callback)

    parser.parse(argv)

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

  test('skip arguments if formOnly is true', async () => {
    const questions = [{
      name: 'test',
      type: 'input',
      formOnly: true
    }]
    const answers = { test: '"that\'s" right' }

    const commandArguments = new ArgumentParser().generateCommandCall(questions, answers)

    // Hmm, some strange behaviour with jest and escaped quotes, but it does work indeed
    // console.log(commandArguments)  // Try this to see for yourself
    expect(commandArguments).toBe('')
  })
})

describe('setupTabCompleter', () => {
  test('run TabCompleter.registerCompletions with this.program', async () => {
    const spy = jest.spyOn(TabCompleter, 'registerCompletions').mockImplementation()
    const parser = new ArgumentParser()
    parser.setupTabCompleter()

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy.mock.calls[0][0]).toBe(parser.program)
  })
})

