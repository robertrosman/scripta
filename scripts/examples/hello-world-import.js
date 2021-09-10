#!/usr/bin/env scripta
import { Script } from 'scripta'
import helloWorld from './hello-world-options.js'

export default new Script({
  name: "examples/hello-world-import",
  command: async (options, context) => {
    options = { name: "importer" }
    const result = await helloWorld.run(options, context)
  }
})