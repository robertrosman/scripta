#!/usr/bin/env scripta
import { Script } from 'scripta'

export default new Script({
  name: "examples/hello-world",
  options: [
    {
      name: 'name',
      type: 'text',
      message: 'Who do you want to greet?',
      positionalArgument: true
    }
  ],

  command: async ({ name }) => {
    console.log(`Hello ${name}!`)
  }
})