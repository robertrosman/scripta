import { Argument, Command, Option } from 'commander';
import { ArgumentParser } from '../lib/ArgumentParser';
import { TabCompleter } from '../lib/TabCompleter'

const getSuggestions = (program, argString) => {
    const parser = new ArgumentParser()
    parser.program = program
    const fragment = argString.split('\ ').length

    return TabCompleter.getSuggestions(parser, argString, fragment)
}

describe('TabCompleter getSuggestions', () => {
    test('return commands if first fragment', async () => {
        const program = new Command()
            .addCommand(new Command('no-options'))
            .addCommand(new Command('one-confirm').option("--confirm"))
            .addCommand(new Command('another-command'))

        const suggestions = getSuggestions(program, 'scripta')

        expect(suggestions).toEqual(['no-options', 'one-confirm', 'another-command'])
    })

    test('return options if scriptname is given', () => {
        const program = new Command()
            .addCommand(new Command('three-confirms')
                .option("-c1, --confirm1")
                .option("-c2, --confirm2")
                .option("-c3, --confirm3")
            )
        const suggestions = getSuggestions(program, 'scripta\ three-confirms')

        expect(suggestions).toEqual(["--confirm1", "--confirm2", "--confirm3"])
    })

    test('exclude already given options', () => {
        const program = new Command()
            .addCommand(new Command('three-confirms')
                .option("-c1, --confirm1")
                .option("-c2, --confirm2")
                .option("-c3, --confirm3")
            )
        const suggestions = getSuggestions(program, 'scripta\ three-confirms\ --confirm2\ -c1')

        expect(suggestions).toEqual(["--confirm3"])
    })

    test('return choices if an option with choices is preceding', () => {
        const choices = ['first', 'second', 'third']
        const program = new Command()
            .addCommand(new Command('one-list')
                .addOption(new Option('--list <value>').choices(choices))
            )
        const suggestions = getSuggestions(program, 'scripta\ one-list\ --list')

        expect(suggestions).toEqual(choices)
    })

    test('do not return choices if an option without choices is preceding', () => {
        const program = new Command()
            .addCommand(new Command('one-list').option('--list <value>'))
        const suggestions = getSuggestions(program, 'scripta\ one-list\ --list')

        expect(suggestions).toEqual([])
    })

    test('do not return choices if an option without choices is preceding (even if it has arguments)', () => {
        const program = new Command()
            .addCommand(new Command('one-list')
                .argument('[arg]')
                .option('--list <value>')
            )
        const suggestions = getSuggestions(program, 'scripta\ one-list\ argValue --list')

        expect(suggestions).toEqual([])
    })


    test('return choices if a positional argument has choices', () => {
        const choices = ['first', 'second', 'third']
        const program = new Command()
            .addCommand(new Command('one-list')
                .option("-c, --confirm")
                .addOption(new Option('--list <value>').choices(choices))
                .addArgument(new Argument('[myArgument]').choices(choices))
            )

        const suggestions = getSuggestions(program, 'scripta\ one-list\ --list\ first\ --confirm')

        expect(suggestions).toEqual(choices)
    })

    test('return choices and remaining options', () => {
        const choices = ['first', 'second', 'third']
        const program = new Command()
            .addCommand(new Command('one-list')
                .option("-c, --confirm")
                .addOption(new Option('--list <value>').choices(choices))
                .addArgument(new Argument('[myArgument]').choices(choices))
            )

        const suggestions = getSuggestions(program, 'scripta\ one-list')

        expect(suggestions).toEqual(expect.arrayContaining(['--list', '--confirm', ...choices]))
    })

    test('return only options after arguments are satisfied', () => {
        const choices = ['first', 'second', 'third']
        const program = new Command()
            .addCommand(new Command('one-list')
                .option("-c, --confirm")
                .addOption(new Option('--list <value>').choices(choices))
                .addArgument(new Argument('[myArgument]').choices(choices))
            )

        const suggestions = getSuggestions(program, 'scripta\ one-list\ first')

        expect(suggestions).toEqual(expect.arrayContaining(['--list', '--confirm']))
    })


    test('run choice function if a positional argument has one', () => {
        const choices = (answers) => ['first', 'second', 'third', 'forth'].filter(choice => choice !== answers.list)
        const argument = new Argument('[myArgument]');
        (argument as any).argChoicesFunction = choices
        const program = new Command()
            .addCommand(new Command('one-list')
                .option("-c, --confirm")
                .addOption(new Option('--list <value>').choices(['first']))
                .addArgument(argument)
            )

        const suggestions = getSuggestions(program, 'scripta\ one-list\ --list\ first\ --confirm')

        expect(suggestions).toEqual(['second', 'third', 'forth'])
    })


    test('return correct choices if several positional arguments has choices', () => {
        const choices1 = ['first', 'second', 'third']
        const choices2 = ['one', 'two', 'three']
        const program = new Command()
            .addCommand(new Command('one-list')
                .option("-c, --confirm")
                .addOption(new Option('--list <value>').choices(choices1))
                .addArgument(new Argument('[firstArgument]').choices(choices1))
                .addArgument(new Argument('[secondArgument]').choices(choices2))
            )

        const suggestions = getSuggestions(program, 'scripta\ one-list\ --list\ first\ --confirm\ first')

        expect(suggestions).toEqual(choices2)
    })


    test('return empty list if invalid command is given', () => {
        const program = new Command()
            .addCommand(new Command('one-list'))
        const suggestions = getSuggestions(program, 'scripta\ invalid-command')

        expect(suggestions).toEqual([])
    })

    test('run choice function if argChoicesFunction is given', () => {
        const option = new Option('--choice-function <value>');
        (option as any).argChoicesFunction = (previousOptions) => Object.keys(previousOptions).map(k => `${k}: ${previousOptions[k]}`)
        option.mandatory = false
        option.required = false
        const program = new Command()
            .addCommand(new Command('command-name')
                .addOption(new Option('--choice-array <value>').choices(['one', 'two words', 'three little birds']))
                .addOption(new Option('--confirm'))
                .addOption(option)
            )
        const suggestions = getSuggestions(program, 'scripta\ command-name\ --confirm\ --choice-array=one\ --choice-function')

        expect(suggestions).toEqual([
            "confirm: true",
            "choiceArray: one"
        ])
    })
})
