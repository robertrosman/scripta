#!/usr/bin/env scripta
import { Script } from 'scripta'

export default new Script({
  name: 'examples/hello-world-history',

  options: (store) => [
    {
      name: 'name',
      type: 'autocomplete',
      message: 'Who do you want to greet?',
      choices: store.history,
      suggestOnly: false,
      // validate: (val) => !!val && store.history.includes(val) ? true : 'Please choose one of the available choices',
      positionalArgument: true
    },
    {
      name: 'exaggerate',
      type: 'text',
      message: 'asafsd',
      validate: () => false
    },
    {
      name: 'exaggerate',
      type: 'confirm',
      message: 'Want me to be veeery friendly?',
      argumentOnly: true
    },
    {
      name: 'color',
      type: 'autocomplete',
      message: 'Choose a good looking color',
      choices: [ 'default', 'black', 'red', 'green', 'yellow', 'blue', 'magenta', 'cyan', 'white', 'grey', 'redBright', 'greenBright', 'yellowBright', 'blueBright', 'magentaBright', 'cyanBright', 'whiteBright' ],
      // when: () => chalk.supportsColor,
      default: 'default'
    }
  ],

  store: {
    history: []
  },

  command: async ({ name, exaggerate, color }, { store }) => {
    if (!!name && !store.history.includes(name)) store.history.push(name)
    const msg = exaggerate ? `Hello my best friend ${name}, missed you sooo much!!!` : `Hello ${name}!`
    if (!color || color === 'default') {
      console.log(msg)
    }
    else {
      console.log(chalk.keyword(color)(msg))
    }
  }

})