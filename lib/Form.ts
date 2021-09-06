import inquirer from 'inquirer'
import InquirerAutocompletePrompt from 'inquirer-autocomplete-prompt'
inquirer.registerPrompt('autocomplete', InquirerAutocompletePrompt)
import fuzzy from 'fuzzy'

export class Form {
  static async run(questions, answers = {}): Promise<any> {
    const unansweredQuestions = questions.filter(o => answers[o.name] === undefined)
    this.generateAutocompleteSource(unansweredQuestions)
    const additionalAnswers = await inquirer.prompt(unansweredQuestions)
    return Object.assign({}, answers, additionalAnswers)
  }

  static generateAutocompleteSource(questions) {
    questions.filter(o => o.type === 'autocomplete' && o.source === undefined).forEach(o => {
      o.source = async (_, input) => fuzzy.filter(input ?? '', o.choices).map((el) => el.original)
    })
  }
}