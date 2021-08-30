import { Command, Option } from 'commander';
import * as inquirer from 'inquirer';
import InquirerAutocompletePrompt from 'inquirer-autocomplete-prompt';
inquirer.registerPrompt('autocomplete', InquirerAutocompletePrompt);
import { paramCase } from 'change-case';
import * as fuzzy from 'fuzzy';
const resolveOptions = async (argv = [], options = null, sources = []) => {
    const program = new Command();
    options = typeof options === 'function' ? options(...sources) : options;
    options = options ?? [];
    program.exitOverride();
    addOptions(options, program);
    try {
        program.parse(argv);
        const parsedOptions = program.opts();
        const completeOptions = await interactiveFallback(options, parsedOptions);
        return completeOptions;
    }
    catch (err) {
        if (err.code === 'commander.helpDisplayed')
            process.exit();
        throw err;
    }
};
const addOptions = (options, program) => {
    options.forEach(o => program.addOption(generateOption(o)));
};
const generateOption = (option) => {
    let optionString = '';
    if (option.shorthand)
        optionString += `-${option.shorthand}, `;
    optionString += `--${paramCase(option.name)}`;
    if (wantValue(option))
        optionString += ` <${option.value ?? 'value'}>`;
    const newOption = new Option(optionString, option.message);
    if (option.choices)
        newOption.choices(option.choices);
    return newOption;
};
const interactiveFallback = async (options, parsedOptions) => {
    const questions = options.filter(o => parsedOptions[o.name] === undefined);
    questions.filter(o => o.type === 'autocomplete' && o.source === undefined).forEach(o => {
        o.source = async (_, input) => fuzzy.filter(input ?? '', o.choices).map((el) => el.original);
    });
    const answers = await inquirer.prompt(questions);
    return Object.assign({}, parsedOptions, answers);
};
const generateCommandArguments = (options, parsedOptions) => {
    const args = [];
    options?.forEach(o => {
        if (o.type === 'confirm' && parsedOptions[o.name] === true) {
            args.push(`--${paramCase(o.name)}`);
        }
        else if (wantValue(o) && parsedOptions[o.name] !== undefined) {
            const value = JSON.stringify(parsedOptions[o.name]);
            args.push(`--${paramCase(o.name)} ${value}`);
        }
    });
    return args.join(' ');
};
const wantValue = (option) => ['input', 'list', 'rawList', 'password', 'autocomplete'].includes(option.type);
export { resolveOptions, addOptions, interactiveFallback, generateCommandArguments };
