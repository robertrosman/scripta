import { Form } from '../lib/Form'
import { OptionDefinition } from '../lib/OptionDefinition'

const mockForm = (questions: OptionDefinition[], parsedAnswers, mockAnswers) => {
    const form = new Form(questions, parsedAnswers)
    form.inject(mockAnswers)
    return form
}

describe('Form', () => {
  test('asks user for answer if not provided by argv', async () => {
    const form = mockForm([
      {
        name: 'first',
        type: 'text',
        message: 'First answer is already given'
      },
      {
        name: 'second',
        type: 'text',
        message: 'Second answer is mocked'
      },
    ], {
      first: "parsed already"
    }, [
      "mock answer"
    ])
    const answers: any = await form.run()

    expect(answers.first).toBe('parsed already')
    expect(answers.second).toBe('mock answer')
  })

  test('support for when function', async () => {
    const argumentOptions = {
      first: "parsed already"
    }

    const form = mockForm([
      {
        name: 'first',
        type: 'text',
        message: 'First answer is already given'
      },
      {
        name: 'second',
        type: 'text',
        message: 'Second answer is mocked',
        when: (answers) => answers.first === "parsed already"
      },
      {
        name: 'third',
        type: 'text',
        message: 'Third answer is skipped',
        when: (answers) => answers.first === "something else that is definitely not set"
      },
    ],
    argumentOptions,
    [ 'mock answer' ])
    const answers = await form.run()

    expect(answers.first).toBe('parsed already')
    expect(answers.second).toBe('mock answer')
    expect(answers.third).toBe(undefined)
  })

  test('skip questions if argumentOnly is true', async () => {
    const form = mockForm([
      {
        name: 'verbose',
        type: 'confirm',
        message: 'Turn on extra verbose logging',
        argumentOnly: true
      },
      {
        name: 'second',
        type: 'text',
        message: 'First and only answer'
      },
    ], {}, [ 'mock answer' ])

    const answers: any = await form.run()

    expect(answers.verbose).toBe(undefined)
    expect(answers.second).toBe("mock answer")
  })
})

describe('autocomplete', () => {
  test('accept custom input if suggestOnly is true', async () => {
    const form = mockForm([
      {
        name: 'custom',
        type: 'autocomplete',
        message: 'Turn on extra verbose logging',
        choices: ['one', 'two'],
        suggestOnly: true
      }
    ], {}, [ 'three' ])

    const answers: any = await form.run()

    expect(answers.custom).toBe('three')
  })

  // test('generates source if choices is given', async () => {
  //   const questions: any = [
  //     {
  //       name: 'first',
  //       type: 'autocomplete',
  //       message: 'First has some choices',
  //       choices: ["dummy", "match one", "match two", "three"]
  //     },
  //     {
  //       name: 'second',
  //       type: 'autocomplete',
  //       message: 'Second has already source',
  //       source: async () => ["test"]
  //     },
  //   ]
  //   form.generateAutocompleteSource(questions)

  //   const matchedChoices1 = await questions[0].source({}, "match")
  //   expect(matchedChoices1.length).toBe(2)

  //   const matchedChoices2 = await questions[1].source({}, "input is not considered")
  //   expect(matchedChoices2.length).toBe(1)
  // })
})

