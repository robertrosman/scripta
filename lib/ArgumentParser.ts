import { paramCase } from 'change-case'
import { Command, Option } from 'commander'
import { Script } from './Script'

export class ArgumentParser {
    program: Command

    constructor() {
        this.program = new Command()
        this.program.exitOverride()
    }

    registerScript(script: Script, callback?) {
        const command = this.program.command(script.name)
        command.exitOverride()
        const options = script.optionsArray
        this.addOptions(options, command)
        if (callback) command.action(callback)
    }

    addOptions(options, command?) {
        command = command ?? this.program
        options.forEach(o => command.addOption(this.generateCommanderOption(o)))
    }

    parse(argv) {
        try {
            this.program.parse(argv)
            return this.program.opts()
        } catch (err) {
            if (err.code === 'commander.helpDisplayed') process.exit()
            throw err
        }
    }

    generateCommanderOption(option) {
        let optionString = ''
        if (option.shorthand) optionString += `-${option.shorthand}, `
        optionString += `--${paramCase(option.name)}`
        if (this.wantValue(option)) optionString += ` <${option.value ?? 'value'}>`
        const newOption = new Option(optionString, option.message)
        if (option.choices) newOption.choices(option.choices)
        return newOption
    }

    generateCommandCall(options, parsedOptions) {
        const args = []
        options?.forEach(o => {
            if (o.type === 'confirm' && parsedOptions[o.name] === true) {
                args.push(`--${paramCase(o.name)}`)
            } else if (this.wantValue(o) && parsedOptions[o.name] !== undefined) {
                const value = JSON.stringify(parsedOptions[o.name])
                args.push(`--${paramCase(o.name)} ${value}`)
            }
        })
        return args.join(' ')
    }

    wantValue(option) {
        return ['input', 'list', 'rawList', 'password', 'autocomplete'].includes(option.type)
    }
}