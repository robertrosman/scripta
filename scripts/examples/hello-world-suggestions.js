#!/usr/bin/env scripta
import { Script } from 'scripta'

export default new Script({
  name: 'examples/hello-world-suggestions',

  options: (store, options) => [
    {
      name: 'suggestions',
      type: 'confirm',
      message: 'Set this flag if you like to get name suggestions',
      argumentOnly: true
    },

    {
      name: 'name',
      type: 'input',
      message: 'Who do you want to greet?',
      when: () => options.suggestions !== true
    },
    {
      name: 'name',
      type: 'autocomplete',
      message: 'Who do you want to greet?',
      choices: store.history,
      suggestOnly: true,
      validate: (val) => val && val.length > 0,
      formOnly: true,
      when: () => options.suggestions === true
    }
  ],

  store: {
    history: []
  },

  command: async ({ name, suggestions }, { store }) => {
    if (suggestions && !store.history.includes(name)) store.history.push(name)
    console.log(`Hello ${name}!`)
  }

})