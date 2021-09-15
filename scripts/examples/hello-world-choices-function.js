#!/usr/bin/env scripta
import { Script } from 'scripta'

export default new Script({
  name: 'examples/hello-world-choices-function',

  options: (store) => [
    {
      name: 'include',
      type: 'input',
      message: 'Who do you want to include in the suggestions?'
    },
    {
      name: 'name',
      type: 'list',
      message: 'Who do you want to greet?',
      choices: (options) => store.history.filter(n => !options.include || n.indexOf(options.include) > -1),
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