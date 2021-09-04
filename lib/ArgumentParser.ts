import { paramCase } from 'change-case'
import { Command, Option } from 'commander'
import { Script } from './Script'

export class ArgumentParser {
    command: Command

    constructor() {
    }

    registerScript(script: Script, parentCommand?: Command, callback?) {
        this.command = parentCommand?.command(script.name) ?? new Command()
        this.command.exitOverride()
        const options = script.optionsArray
        this.addOptions(options, this.command)
        if (callback) this.command.action(callback)
    }

    parse(argv) {
        try {
            this.command.parse(argv)
            return this.command.opts()
        } catch (err) {
            if (err.code === 'commander.helpDisplayed') process.exit()
            throw err
        }
    }

    addOptions(options, program) {
        options.forEach(o => program.addOption(this.generateCommanderOption(o)))
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