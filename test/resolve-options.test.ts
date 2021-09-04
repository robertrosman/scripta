import stringArgv from 'string-argv'
import { resolveOptions } from '../lib/resolve-options'
import mockInquirer from 'mock-inquirer'

const mockArgv = (args) => stringArgv(args, 'node', 'resolve-options.test.js')

describe('resolveOptions', () => {
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
})

