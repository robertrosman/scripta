import stringArgv from 'string-argv'
import { TabCompleter } from '../lib/TabCompleter'
import { ArgumentParser } from '../lib/ArgumentParser'
import { Script } from '../lib/Script'
import { Command } from 'commander'

const mockArgv = (args) => stringArgv(args, 'node', 'resolve-options.test.js')

const parseOptions = (argv, options) => {
  const parser = new ArgumentParser()
  parser.addOptions(options)
  return parser.parse(argv)
}

describe('ArgumentParser', () => {
  test('returns object', async () => {
    const argumentParser = new ArgumentParser()
    expect(typeof argumentParser).toBe('object')
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
  test('run TabCompleter.registerCompletions with this', async () => {
    const spy = jest.spyOn(TabCompleter, 'registerCompletions').mockImplementation()
    const parser = new ArgumentParser()
    parser.setupTabCompleter()

    expect(spy).toHaveBeenCalledTimes(1)
    expect(spy.mock.calls[0][0]).toBe(parser)
  })
})

describe('mergeArgumentsAndOptions', () => {
  test('should take arguments and turn into options', async () => {
    const program = new Command()
        .argument('[firstname]')
        .argument('[lastname]')

    const options = ArgumentParser.mergeArgumentsAndOptions(['Robert', 'Rosman', program])

    expect(options.firstname).toBe('Robert')
    expect(options.lastname).toBe('Rosman')
  })

  test('should take arguments and merge with given options', async () => {
    const program = new Command()
        .argument('[firstname]')
        .argument('[lastname]')

    const options = ArgumentParser.mergeArgumentsAndOptions([
        'Robert', 
        'Rosman', 
        { parsedOptions: 'already fixed'}, 
        program
    ])
      
    expect(options.firstname).toBe('Robert')
    expect(options.lastname).toBe('Rosman')
    expect(options.parsedOptions).toBe('already fixed')
  })

  test('should not add empty arguments to options', async () => {
    const program = new Command()
        .argument('[firstname]')
        .argument('[lastname]')

    const options = ArgumentParser.mergeArgumentsAndOptions([
        'Robert', 
        { parsedOptions: 'already fixed'}, 
        program
    ])
      
    expect(options.firstname).toBe('Robert')
    expect(options.parsedOptions).toBe('already fixed')
    expect(Object.keys(options).length).toBe(2)
  })

  test('return options if no Command is given (like when resolving script manually)', async () => {
    const options = ArgumentParser.mergeArgumentsAndOptions([
        { parsedOptions: 'already fixed'}
    ])
      
    expect(options).toEqual({ parsedOptions: 'already fixed' })
  })
})

