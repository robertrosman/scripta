import { paramCase } from 'change-case'
import { Argument, Command, Option } from 'commander'
import { Script } from './Script.js'
import { OptionDefinition } from './OptionDefinition.js'
import { TabCompleter } from './TabCompleter.js'

export class ArgumentParser {
    program: Command

    constructor() {
        this.program = new Command()
        this.program.exitOverride()
    }

    registerScript(script: Script, callback?) {
        const command = this.program.command(script.name)
        command.exitOverride()
        const options = script.definition.options
        this.addOptions(options, command)
        if (callback) command.action(callback)
    }

    addOptions(options: OptionDefinition[], command?: Command) {
        command = command ?? this.program
        options.filter(o => !o.formOnly && !o.positionalArgument).forEach(o => {
            command.addOption(this.generateCommanderOption(o))
        })
        options.filter(o => !o.formOnly && o.positionalArgument).forEach(o => {
            command.addArgument(this.generatePositionalArgument(o))
        })
    }

    parse(argv) {
        try {
            this.program.parse(argv)
            return this.program.opts()
        } catch (err) {
            throw err
        }
    }

    generateCommanderOption(option) {
        let optionString = ''
        if (option.shorthand) optionString += `-${option.shorthand}, `
        optionString += `--${paramCase(option.name)}`
        if (this.wantValue(option)) optionString += ` <${option.value ?? 'value'}>`
        const newOption = new Option(optionString, option.message)
        return this.addChoices(newOption, option)
    }

    generatePositionalArgument(option) {
        let argumentString = ''
        argumentString += `[${paramCase(option.name)}]`
        const newArgument = new Argument(argumentString, option.message)
        return this.addChoices(newArgument, option)
    }

    addChoices(newOption, optionDefinition) {
        if (Array.isArray(optionDefinition.choices)) {
            newOption.choices(optionDefinition.choices)
        }
        else if (typeof optionDefinition.choices === 'function') {
            newOption.argChoicesFunction = optionDefinition.choices
        }
        // TODO: Figure out a cleaner approach to handling invalidArgument differently on completion or actual execution!
        if (optionDefinition.suggestOnly && !~process.argv.indexOf('--compgen')) {
            newOption.parseArg = (arg, previous) => newOption.variadic ? newOption._concatValue(arg, previous) : arg
        }
        return newOption
    }

    generateCommandCall(optionDefinitions: OptionDefinition[], options) {
        const args = []
        optionDefinitions?.filter(o => !o.formOnly).forEach(o => {
            if (o.type === 'confirm' && options[o.name] === true) {
                args.push(`--${paramCase(o.name)}`)
            } else if (this.wantValue(o) && o.positionalArgument && options[o.name] !== undefined) {
                const value = JSON.stringify(options[o.name])
                args.push(`${value}`)
            } else if (this.wantValue(o) && options[o.name] !== undefined) {
                const value = JSON.stringify(options[o.name])
                args.push(`--${paramCase(o.name)} ${value}`)
            }
        })
        return args.join(' ')
    }

    setupTabCompleter() {
        TabCompleter.registerCompletions(this)
    }

    static mergeArgumentsAndOptions(args) {
        const positionalArguments = args.filter(a => typeof a !== 'object')
        const command = args.find(a => a instanceof Command)
        const options = args.find(a => typeof a === 'object' && !(a instanceof Command)) || {}
        if (!command) {
            return options
        }
        let i = 0;
        (command as any)._args.forEach(a => {
            if (positionalArguments[i] !== undefined) {
                options[a.name()] = positionalArguments[i++]
            }
        })
        return options
    }

    wantValue(option) {
        return ['input', 'text', 'list', 'rawList', 'password', 'autocomplete'].includes(option.type)
    }
}