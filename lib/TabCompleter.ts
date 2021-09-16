import omelette from 'omelette'
import { parseArgsStringToArgv } from 'string-argv'
import { Argument, Command, Option } from "commander"
import { ArgumentParser } from './ArgumentParser.js';

export class TabCompleter {
  static registerCompletions(argumentParser: ArgumentParser): void {
    const completion = omelette('scriptacompletion')
    completion.on('complete', (_, { fragment, before, reply, line }) => {
      reply(this.getSuggestions(argumentParser, line.toString(), fragment))
    });

    completion.init()

    try {
      if (~process.argv.indexOf('--setup-shell-init-file')) {
        completion.setupShellInitFile()
      }

      if (~process.argv.indexOf('--cleanup-shell-init-file')) {
        completion.cleanupShellInitFile()
      }
    }
    catch (err) {
      console.error(err)
    }
  }

  static getSuggestions(argumentParser: ArgumentParser, line: string, fragment?: number): string[] {
    if (fragment === 1) {
      return argumentParser.program.commands.map(c => c.name())
    }
    const args = parseArgsStringToArgv(line)
    const command = argumentParser.program.commands.find(c => c.name() === args[1])
    if (!command) {
      return []
    }
    const options: Option[] = (command as any).options
    const initiatedOption = options.find(o => o.long === args[fragment - 1])
    const remainingOptions = options.filter(o => !args.includes(o.long) && !args.includes(o.short)).map(o => o.long)

    if (initiatedOption && (initiatedOption as any).argChoicesFunction !== undefined) {
      let parsedOptions: object
      argumentParser.program.commands.forEach(c => c.action((options) => parsedOptions = options))
      argumentParser.parse([ 'dummy', ...args].filter((value, index) => index !== fragment ))
      return (initiatedOption as any).argChoicesFunction(parsedOptions)
    }
    else if (initiatedOption && initiatedOption.argChoices !== undefined) {
      return initiatedOption.argChoices
    }
    else if (initiatedOption && initiatedOption.required) {
      return []
    }
    else if ((command as any)._args?.length > 0) {
      let parsedOptions: object
      argumentParser.program.commands.forEach(c => c.action((...args) => parsedOptions = ArgumentParser.mergeArgumentsAndOptions(args)))
      argumentParser.parse(['dummy', ...args])
      const argument = (command as any)._args.find(a => parsedOptions[a.name()] === undefined)
      const argumentChoices = (argument?.argChoicesFunction === undefined) ? argument?.argChoices : argument?.argChoicesFunction(parsedOptions)
      if (!argumentChoices) {
        return remainingOptions
      }
      return [...argumentChoices, ...remainingOptions]
    }
    else {
      return remainingOptions
    }
  }
}