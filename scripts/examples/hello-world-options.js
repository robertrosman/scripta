#!/usr/bin/env scripta
import { Script } from 'scripta'

export default new Script({
  name: "examples/hello-world-options",
  options: [
    {
      name: 'name',
      type: 'input',
      message: 'Who do you want to greet?'
    }
  ],

  command: async ({ name }) => {
    console.log(`Hello ${name}!`)
  }
})