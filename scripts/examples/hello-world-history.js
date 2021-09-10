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
      suggestOnly: true,
      validate: (val) => val && val.length > 0
    },
    {
      name: 'confirm',
      type: 'confirm',
      message: 'No better imagination huh?',
      when: (answers) => answers.name === 'world'
    }
  ],

  store: {
    history: []
  },

  command: async ({ name }, { store }) => {
    if (!store.history.includes(name)) store.history.push(name)
    console.log(`Hello ${name}!`)
  }

})