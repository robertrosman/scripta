import inquirer, { Answers } from 'inquirer'
import InquirerAutocompletePrompt from 'inquirer-autocomplete-prompt'
inquirer.registerPrompt('autocomplete', InquirerAutocompletePrompt)
import fuzzy from 'fuzzy'
import { OptionDefinition } from './ScriptDefinition'

export class Form {
  static async run(questions: OptionDefinition[], answers = {}): Promise<Answers> {
    this.generateAutocompleteSource(questions)
    return await inquirer.prompt(questions, answers)
  }

  static generateAutocompleteSource(questions) {
    questions.filter(o => o.type === 'autocomplete' && o.source === undefined).forEach(o => {
      o.source = async (_, input) => fuzzy.filter(input ?? '', o.choices).map((el) => el.original)
    })
  }
}