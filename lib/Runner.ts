import('zx')
import path from 'path'
import fs from 'fs'
import { Script } from './Script.js'
import { getFilesRecursively, __dirname, installPath, configPath, nameifyScript, muteConsole, unmuteConsole } from './utils.js'
import { ArgumentParser } from './ArgumentParser.js'
import { Form } from './Form.js'
import { Store } from './Store.js'
import { pathToFileURL } from 'url'
import { Command } from 'commander'

interface ScriptPath {
  absolute: string
  base: string
  relative: string
  name: string
}

export class Runner {
  availableScripts: object
  argumentParser: ArgumentParser
  scriptsPath: string

  constructor() {
    this.availableScripts = {}
    this.argumentParser = new ArgumentParser()
    this.scriptsPath = path.join(configPath, 'scripts')
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
        process.exit(err.exitCode)
      }
    }
  }

  private getFileList() {
    const files: ScriptPath[] = []
    if (process.argv[2] && fs.existsSync(process.argv[2]) && fs.statSync(process.argv[2])?.isFile()) {
      const absolute = path.resolve(process.argv[2])
      const relative = path.relative(this.scriptsPath, absolute)
      files.push({
        absolute,
        base: this.scriptsPath,
        relative,
        name: nameifyScript(relative)
      })
      process.argv[2] = nameifyScript(relative)
    }
    else {
      files.push(...this.getScriptFilesInFolder(path.join(installPath, 'scripts')))
      files.push(...this.getScriptFilesInFolder(path.join(configPath, 'scripts')))
    }
    return files
  }

  private getScriptFilesInFolder(base: string): ScriptPath[] {
    return getFilesRecursively(base).map(relative => ({
      absolute: path.join(base, relative),
      base,
      relative,
      name: nameifyScript(relative)
    }))
  }

  private async setupScripts(files: ScriptPath[]) {
    for (const file of files) {
      try {
        const url = pathToFileURL(file.absolute)
        const importedScript = await import(url.href)
        const script: Script = importedScript.default === undefined
          ? new Script({ name: file.name, ...importedScript })
          : importedScript.default as Script
        script.setContext({ 
          __dirname,
          installPath,
          configPath,
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
    const { script } = await (new Form(availableScriptsOptions, {})).run()
    return script
  }
}