import omelette from 'omelette'
import { parseArgsStringToArgv } from 'string-argv'
import { Argument, Command, Option, OptionValues } from "commander"
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
      const parsedOptions = this.parseProgramOptions(argumentParser, args, fragment, true)
      return (initiatedOption as any).argChoicesFunction(parsedOptions)
    }
    else if (initiatedOption && initiatedOption.argChoices !== undefined) {
      return initiatedOption.argChoices
    }
    else if (initiatedOption && initiatedOption.required) {
      return []
    }
    else if ((command as any)._args?.length > 0) {
      const parsedOptions = this.parseProgramOptions(argumentParser, args, fragment)
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

  static parseProgramOptions(argumentParser: ArgumentParser, args, fragment: number, excludeFragment = false): OptionValues {
      try {
        let parsedOptions: OptionValues
        this.muteCommand(argumentParser.program)
        argumentParser.program.commands.forEach(c => {
          c.action((...args) => parsedOptions = ArgumentParser.mergeArgumentsAndOptions(args))
          this.muteCommand(c)
        })
        argumentParser.parse(['dummy', ...args].filter((value, index) => !excludeFragment || index !== fragment ))
        return parsedOptions
      }
      catch (err) {
        if (err.code == 'commander.invalidArgument' || err.code == 'commander.unknownCommand') {
          if(!excludeFragment) {
            return this.parseProgramOptions(argumentParser, args, fragment, true) 
          }
        }
        else if (err.code !== 'commander.help') {
          console.error(err)
        }
        return {}
      }
  }

  static muteCommand(command: Command) {
    command
      .exitOverride()
      .configureOutput({
        // Mute output from commander itself
        writeOut: () => {},
        writeErr: () => {},
      })
  }
}