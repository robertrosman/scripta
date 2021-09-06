import * as zx from 'zx'
import path from 'path'
import { Store } from './Store.js'
import { Script } from './Script.js'
import { getFilesRecursively, __dirname } from './utils.js'
import { ArgumentParser } from './ArgumentParser.js'
import { Form } from './Form.js'

export class Runner {
  availableScripts: object
  argumentParser: ArgumentParser

  constructor() {
    this.availableScripts = {}
    this.argumentParser = new ArgumentParser()
  }

  async run() {
    try {
      await this.setupScripts()
      this.argumentParser.parse(process.argv)
    } catch (err) {
      if (err.code === 'commander.helpDisplayed') {
        process.exit(0)
      } else if (err.code === 'commander.help') {
        const script = await this.resolveScript(this.availableScripts)
        this.availableScripts[script]({})
      } else {
        console.error(err)
      }
    }
  }

  private async setupScripts() {
    const scriptsPath = path.join(__dirname, 'scripts')
    const files = getFilesRecursively(scriptsPath)
    for (const file of files) {
      const name = file.replace(/\.\w+$/, '')
      const importedScript = await import(path.join(scriptsPath, file))
      const script = new Script({ name, ...importedScript }, { ...zx, __dirname })
      this.availableScripts[name] = this.createScriptCallback(script)
      this.argumentParser.registerScript(script, this.availableScripts[name])
    }
  }

  createScriptCallback(script) {
    return async (parsedOptions) => {
      script.parsedOptions = parsedOptions
      await script.runForm()
      const commandArguments = new ArgumentParser().generateCommandCall(script.optionsArray, script.parsedOptions)
      console.log(`zse ${script.name} ${commandArguments}\n`)
      await script.definition.command(script.parsedOptions, script.context)
      await Store.write(script.name, script.store)
    }
  }

  async resolveScript(availableScripts) {
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
}