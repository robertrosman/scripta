import inquirer from 'inquirer'
import InquirerAutocompletePrompt from 'inquirer-autocomplete-prompt'
inquirer.registerPrompt('autocomplete', InquirerAutocompletePrompt)
import { ArgumentParser } from './ArgumentParser.js'
import { Form } from './Form.js'

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

const interactiveFallback = async (options, parsedOptions): Promise<any> => {
  return await Form.run(options, parsedOptions)
}

export {
  resolveOptions,
  interactiveFallback
}
