import inquirer, { Answers } from 'inquirer'
import InquirerAutocompletePrompt from 'inquirer-autocomplete-prompt'
inquirer.registerPrompt('autocomplete', InquirerAutocompletePrompt)
import fuzzy from 'fuzzy'
import { OptionDefinition, Form as IForm } from 'scripta'

export class Form implements IForm {
  async run(questions: OptionDefinition[], answers = {}): Promise<Answers> {
    const formQuestions = questions.filter(q => !q.argumentOnly)
    this.generateAutocompleteSource(formQuestions)
    return await inquirer.prompt(formQuestions, answers)
  }

  generateAutocompleteSource(questions) {
    questions.filter(o => o.type === 'autocomplete' && o.source === undefined).forEach(o => {
      o.source = async (_, input) => fuzzy.filter(input ?? '', o.choices).map((el) => el.original)
    })
  }
}