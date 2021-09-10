import * as zx from 'zx'
import path from 'path'
import { Store } from './Store.js'
import fs from 'fs'
import { Script } from './Script.js'
import { getFilesRecursively, __dirname, nameifyScript } from './utils.js'
import { ArgumentParser } from './ArgumentParser.js'
import { Form } from './Form.js'

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

  private getFileList() {
    const files = []
    if (process.argv[2] && fs.existsSync(process.argv[2]) && fs.statSync(process.argv[2])?.isFile()) {
      const absolutePath = path.resolve(process.argv[2])
      files.push(path.relative(this.scriptsPath, absolutePath))
      process.argv[2] = nameifyScript(absolutePath)
    }
    else {
      files.push(...getFilesRecursively(this.scriptsPath))
    }
    return files
  }

  private async setupScripts(files: string[]) {
    for (const file of files) {
      const generatedName = nameifyScript(path.join(this.scriptsPath, file))
      const importedScript = await import(path.join(this.scriptsPath, file))
      const script = (importedScript.default instanceof Script) 
        ? importedScript.default
        : new Script({ name: generatedName, ...importedScript })
      script.extendContext({ __dirname })
      const givenName = script.name
      this.availableScripts[givenName] = script.run.bind(script)
      this.argumentParser.registerScript(script, this.availableScripts[givenName])
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