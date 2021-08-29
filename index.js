#!/usr/bin/env node
import { Command } from 'commander'
import * as zx from 'zx'
import path from 'path'
import { addOptions, generateCommandArguments, interactiveFallback } from '../zop-options-parser/lib/resolve-options.js'
import { createStore } from './lib/store.js'
import { __dirname, getFilesRecursively } from './lib/utils.js'

(async () => {
  const program = new Command()
  const availableScripts = {}

  try {
    const scriptsPath = path.join(__dirname, 'scripts')
    const files = getFilesRecursively(scriptsPath)
    for (const file of files) {
      const name = file.replace(/\.\w+$/, '')
      const command = program.command(name)
      const importedScript = await import(path.join(scriptsPath, file))
      const script = await setupScript(name, importedScript)
      addOptions(script.optionsArray ?? [], command)
      availableScripts[name] = createScriptCallback(name, script)
      command.action(availableScripts[name])
    }
    program.exitOverride()
    program.parse()
  } catch (err) {
    if (err.code === 'commander.helpDisplayed') {
      process.exit(0)
    } else if (err.code === 'commander.help') {
      const script = await resolveScript(availableScripts)
      availableScripts[script]({})
    } else {
      console.error(err)
    }
  }
})()

const setupScript = async (name, importedScript) => {
  const script = {
    context: {},
    ...importedScript
  }
  await setupStore(name, script)
  script.optionsArray = (typeof script.options === 'function')
    ? script.options(script.context.store)
    : script.options ?? []
  return script
}

const setupStore = async (name, script) => {
  script.storeInstance = createStore(name, script.store ?? {})
  script.context.store = await script.storeInstance.get()
}

const createScriptCallback = (name, script) =>
  async (parsedOptions) => {
    parsedOptions = await resolveOptions(script, parsedOptions)
    const commandArguments = generateCommandArguments(script.optionsArray, parsedOptions)
    console.log(`zse ${name} ${commandArguments}\n`)
    await script.run(parsedOptions, script.context)
    await script.storeInstance.set(script.context.store)
  }

const resolveOptions = async (script, parsedOptions) => {
  const store = script.context.store
  if (typeof script.options === 'function') { script.optionsArray = script.options(store, parsedOptions) }
  let options = script.optionsArray

  const setupOnceOptions = options?.filter(o => o.setupOnce === true)
  setupOnceOptions?.filter(soo => store[soo.name] !== undefined).forEach(soo => {
    parsedOptions[soo.name] = store[soo.name]
    options = options?.filter(o => o.name !== soo.name)
  })

  const storeDefaultOptions = options?.filter(o => o.storeDefault === true)
  storeDefaultOptions?.filter(soo => store[soo.name] !== undefined).forEach(soo => {
    options.find(o => o.name === soo.name).default = store[soo.name]
  })

  parsedOptions = await interactiveFallback(options ?? [], parsedOptions)
  setupOnceOptions?.forEach(o => store[o.name] = parsedOptions[o.name])
  storeDefaultOptions?.forEach(o => store[o.name] = parsedOptions[o.name])
  return parsedOptions
}

const resolveScript = async (availableScripts) => {
  const availableScriptsOptions = [
    {
      type: 'autocomplete',
      name: 'script',
      message: 'Please choose a script to run',
      choices: Object.keys(availableScripts)
    }
  ]
  const { script } = await interactiveFallback(availableScriptsOptions, {})
  return script
}
