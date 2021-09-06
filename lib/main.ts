import * as zx from 'zx'
import path from 'path'
import { interactiveFallback } from './resolve-options.js'
import { Store } from './Store.js'
import { Script } from './Script.js'
import { getFilesRecursively, __dirname } from './utils.js'
import { ArgumentParser } from './ArgumentParser.js'
import { Form } from './Form.js'

(async () => {
  const availableScripts = {}

  try {
    const scriptsPath = path.join(__dirname, 'scripts')
    const files = getFilesRecursively(scriptsPath)
    const argumentParser = new ArgumentParser()
    for (const file of files) {
      const name = file.replace(/\.\w+$/, '')
      const importedScript = await import(path.join(scriptsPath, file))
      const script = await setupScript(name, importedScript)
      availableScripts[name] = createScriptCallback(script)
      argumentParser.registerScript(script, availableScripts[name])
    }
    argumentParser.parse(process.argv)
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
  return new Script({ name, ...importedScript }, { ...zx, __dirname })
}

const createScriptCallback = (script) =>
  async (parsedOptions) => {
    script.parsedOptions = parsedOptions
    await script.runForm()
    const commandArguments = new ArgumentParser().generateCommandCall(script.optionsArray, script.parsedOptions)
    console.log(`zse ${script.name} ${commandArguments}\n`)
    await script.run(script.parsedOptions, script.context)
    await Store.write(script.name, script.context.store)
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
  const { script } = await Form.run(availableScriptsOptions, {})
  return script
}
