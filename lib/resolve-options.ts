import inquirer from 'inquirer'
import InquirerAutocompletePrompt from 'inquirer-autocomplete-prompt'
inquirer.registerPrompt('autocomplete', InquirerAutocompletePrompt)
import fuzzy from 'fuzzy'
import { ArgumentParser } from './ArgumentParser.js'
import { Script } from './Script.js'

const resolveOptions = async (argv = [], options = null) => {
  const parser = new ArgumentParser()
  parser.addOptions(options)
  try {
    const parsedOptions = parser.parse(argv)
    const completeOptions = await interactiveFallback(options, parsedOptions)
    return completeOptions
  } catch (err) {
    if (err.code === 'commander.helpDisplayed') process.exit()
    throw err
  }
}

const interactiveFallback = async (options, parsedOptions) => {
  const questions = options.filter(o => parsedOptions[o.name] === undefined)
  questions.filter(o => o.type === 'autocomplete' && o.source === undefined).forEach(o => {
    o.source = async (_, input) => fuzzy.filter(input ?? '', o.choices).map((el) => el.original)
  })
  const answers = await inquirer.prompt(questions)
  return Object.assign({}, parsedOptions, answers)
}

export {
  resolveOptions,
  interactiveFallback
}
