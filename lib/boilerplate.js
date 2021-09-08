#!/usr/bin/env scripta
// HINT: You can always sneak peak at the other scripts for some inspiration :)
import { Script } from 'scripta'

// Declare any options you like. Format as inquirer.js questions.
export default new Script({
  name: "__SCRIPT_NAME__",
  options: [
    // {
    //   name: 'optionName',
    //   type: 'input',
    //   message: 'Put your message/question here'
    // },
  ],

  // Declare the structure of the store (if any). Any changes to the context.store object will be persisted.
  store: {},

  // This is the actual script to be run.
  command: async (options, context) => {
    console.log("Magic happens here...")
  }
})