import { Command, Option } from 'commander';
import { TabCompleter } from '../lib/TabCompleter'

describe('TabCompleter getReply', () => {
    test('return commands if first fragment', async () => {
        const program = new Command()
            .addCommand(new Command('no-options'))
            .addCommand(new Command('one-confirm').option("--confirm"))
            .addCommand(new Command('another-command'))

        const suggestions = TabCompleter.getSuggestions(program, 'scripta', 1)

        expect(suggestions).toEqual(['no-options', 'one-confirm', 'another-command'])
    })

    test('return options if scriptname is given', () => {
        const program = new Command()
            .addCommand(new Command('three-confirms')
                .option("-c1, --confirm1")
                .option("-c2, --confirm2")
                .option("-c3, --confirm3")
            )
        const suggestions = TabCompleter.getSuggestions(program, 'scripta\ three-confirms', 2)

        expect(suggestions).toEqual(["--confirm1", "--confirm2", "--confirm3"])
    })

    test('exclude already given options', () => {
        const program = new Command()
            .addCommand(new Command('three-confirms')
                .option("-c1, --confirm1")
                .option("-c2, --confirm2")
                .option("-c3, --confirm3")
            )
        const suggestions = TabCompleter.getSuggestions(program, 'scripta\ three-confirms\ --confirm2\ -c1', 4)

        expect(suggestions).toEqual(["--confirm3"])
    })

    test('return choices if an option with choices is preceding', () => {
        const choices = ['first', 'second', 'third']
        const program = new Command()
            .addCommand(new Command('one-list')
                .addOption(new Option('--list <value>').choices(choices))
            )
        const suggestions = TabCompleter.getSuggestions(program, 'scripta\ one-list\ --list', 3)

        expect(suggestions).toEqual(choices)
    })

    test('return empty list if invalid command is given', () => {
        const program = new Command()
            .addCommand(new Command('one-list'))
        const suggestions = TabCompleter.getSuggestions(program, 'scripta\ invalid-command', 2)

        expect(suggestions).toEqual([])
    })
})