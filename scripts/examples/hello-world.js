#!/usr/bin/env scripta
import { Script } from 'scripta-lite'

export default new Script({
  name: "examples/hello-world",
  options: [
    {
      name: 'name',
      type: 'input',
      message: 'Who do you want to greet?',
      positionalArgument: true
    }
  ],

  command: async ({ name }) => {
    console.log(`Hello ${name}!`)
  }
})