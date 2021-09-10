import { Form } from '../lib/Form'
import mockInquirer from 'mock-inquirer'

describe('Form', () => {
  test('asks user for answer if not provided by argv', async () => {
    mockInquirer([{
      second: 'mock answer'
    }])

    const answers: any = await Form.run([
      {
        name: 'first',
        type: 'input',
        message: 'First answer is already given'
      },
      {
        name: 'second',
        type: 'input',
        message: 'Second answer is mocked'
      },
    ], {
      first: "parsed already"
    })

    expect(answers.first).toBe('parsed already')
    expect(answers.second).toBe('mock answer')
  })

  test('register options from arguments as answers', async () => {
    const argumentOptions = {
      first: "parsed already"
    }
    mockInquirer([{
      second: 'mock answer'
    }])

    const answers: any = await Form.run([
      {
        name: 'first',
        type: 'input',
        message: 'First answer is already given'
      },
      {
        name: 'second',
        type: 'input',
        message: 'Second answer is mocked',
        when: (answers) => answers.first === "parsed already"
      },
    ], argumentOptions)

    expect(answers.first).toBe('parsed already')
    expect(answers.second).toBe('mock answer')
  })

  test('skip questions if argumentOnly is true', async () => {
    mockInquirer([{
      verbose: false,  // will not be set
      second: 'mock answer'
    }])

    const answers: any = await Form.run([
      {
        name: 'verbose',
        type: 'confirm',
        message: 'Turn on extra verbose logging',
        argumentOnly: true
      },
      {
        name: 'second',
        type: 'input',
        message: 'First and only answer'
      },
    ])

    expect(answers.verbose).toBe(undefined)
    expect(answers.second).toBe("mock answer")
  })

  test('generates source if choices is given', async () => {
    const questions: any = [
      {
        name: 'first',
        type: 'autocomplete',
        message: 'First has some choices',
        choices: ["dummy", "match one", "match two", "three"]
      },
      {
        name: 'second',
        type: 'autocomplete',
        message: 'Second has already source',
        source: async () => ["test"]
      },
    ]
    Form.generateAutocompleteSource(questions)

    const matchedChoices1 = await questions[0].source({}, "match")
    expect(matchedChoices1.length).toBe(2)

    const matchedChoices2 = await questions[1].source({}, "input is not considered")
    expect(matchedChoices2.length).toBe(1)
  })
})

