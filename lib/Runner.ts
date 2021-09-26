import('zx')
import path from 'path'
import fs from 'fs'
import { Script } from 'scripta'
import { getFilesRecursively, __dirname, installPath, configPath, nameifyScript, muteConsole, unmuteConsole } from './utils.js'
import { ArgumentParser } from './ArgumentParser.js'
import { Form } from './Form.js'
import { Store } from './Store.js'
import { pathToFileURL } from 'url'
import { Command } from 'commander'

export class Runner {
  availableScripts: object
  argumentParser: ArgumentParser
  scriptsPath: string

  constructor() {
    this.availableScripts = {}
    this.argumentParser = new ArgumentParser()
    this.scriptsPath = path.join(__dirname, 'scripts')
  }

  async run() {
    try {
      const files = this.getFileList()
      await this.setupScripts(files)
      this.argumentParser.setupTabCompleter()
      muteConsole()
      this.argumentParser.parse(process.argv)
      unmuteConsole(true)
    } catch (err) {
      if (err.code === 'commander.helpDisplayed') {
        unmuteConsole(true)
        process.exit(0)
      } else if (err.code === 'commander.help') {
        unmuteConsole(false)
        const script = await this.resolveScript(this.availableScripts)
        this.availableScripts[script]({})
      } else {
        unmuteConsole(true)
        console.error(err)
      }
    }
  }

  private getFileList() {
    const files = []
    if (process.argv[2] && fs.existsSync(process.argv[2]) && fs.statSync(process.argv[2])?.isFile()) {
      const absolutePath = path.resolve(process.argv[2])
      files.push(path.relative(this.scriptsPath, absolutePath))
      process.argv[2] = nameifyScript(absolutePath)
    }
    else {
      files.push(...getFilesRecursively(path.join(installPath, 'scripts')))
      files.push(...getFilesRecursively(path.join(configPath, 'scripts')))
    }
    return files
  }

  private async setupScripts(files: string[]) {
    for (const file of files) {
      try {
        const generatedName = nameifyScript(path.join(this.scriptsPath, file))
        const url = pathToFileURL(path.join(this.scriptsPath, file))
        const importedScript = await import(url.href)
        const script: Script = (importedScript.default instanceof Script)
          ? importedScript.default
          : new Script({ name: generatedName, ...importedScript })
        script.setContext({ 
          __dirname,
          form: new Form(),
          storeManager: new Store(),
          argumentParser: this.argumentParser
        })
        const givenName = script.name
        this.availableScripts[givenName] = (...args) => {
          unmuteConsole(true)
          const options = ArgumentParser.mergeArgumentsAndOptions(args)
          script.run(options)
        }
        this.argumentParser.registerScript(script, this.availableScripts[givenName])
      }
      catch (err) {
        console.log(err)
      }
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
    const { script } = await (new Form()).run(availableScriptsOptions, {})
    return script
  }
}