import omelette from 'omelette'
import { Command, Option } from "commander";

export class TabCompleter {
  static registerCompletions(program: Command): void {
    const completion = omelette('scriptacompletion')
    completion.on('complete', (_, { fragment, before, reply, line }) => {
      reply(this.getSuggestions(program, line.toString(), fragment))
    });

    completion.init()

    try {
      if (~process.argv.indexOf('--setup-shell-init-file')) {
        completion.cleanupShellInitFile()
        completion.setupShellInitFile()
        process.exit()
      }

      if (~process.argv.indexOf('--cleanup-shell-init-file')) {
        completion.cleanupShellInitFile()
        process.exit()
      }
    }
    catch (err) {
      console.log(err)
    }
  }

  static getSuggestions(program: Command, line: string, fragment?: number): string[] {
    if (fragment === 1) {
      return program.commands.map(c => c.name())
    }
    const args = line.split('\ ')   // TODO: way too naive
    const command = program.commands.find(c => c.name() === args[1])
    if (!command) {
      return []
    }
    const options: Option[] = (command as any).options
    const initiatedOption = options.find(o => o.long === args[fragment - 1])
    if (initiatedOption && initiatedOption.argChoices !== undefined) {
      return initiatedOption.argChoices
    }
    else {
      return options.filter(o => !args.includes(o.long) && !args.includes(o.short)).map(o => o.long)
    }
  }
}