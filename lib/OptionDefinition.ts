import { Falsy, InitialReturnValue, PrevCaller, PromptObject, PromptType } from "prompts";

export interface  BasePrompt<T extends string = string>
    extends Pick<PromptObject<T>, 
        'message' 
        | 'initial' 
        | 'format'
        | 'onState'
        | 'stdin'
        | 'stdout'
    > {
        /** Give your option a good name to be referenced by later in your script */
        name: string;

        // inquirer compatibility
        /** Only prompt the user this option if the given function returns true. The first and only argument to the function is the already given options. This is much inspired by inquirer.js */
        when?: (answers: Record<string, any>) => boolean;

        ///////////////////
        // scripta specific
        ///////////////////

        /** Store the last used value and set as default the next time the script is executed */
        storeDefault?: boolean;

        /** Store the used value and use for all coming executions. Will not be prompted again, but the value can be overwritten by explicitly using the command line argument */
        setupOnce?: boolean;

        /** Only add this option as a command line argument, don't ask for input */
        argumentOnly?: boolean;
        
        /** Only ask this question, don't add it as a command line argument */
        formOnly?: boolean;

        /** Give the option a fixed position, and skip the double-dash-option before. See [add-script](https://github.com/robertrosman/scripta/blob/main/scripts/add-script.js) for example, no need to specify --name before the new script name. The position of the positional argument can be before or after other options, but every positional argument must be given in the same order they are declared as options. */
        positionalArgument?: boolean;

        /** Can be used to register a shorthand property for the command line argument. For example `-n` might be set as shorthand to the `--name` option */
        shorthand?: string;

        value?: string;
}

export interface GenericInputPrompt<T, T2 extends string = string> 
    extends BasePrompt<T2>,
    Pick<PromptObject<T2>, 
        'validate' 
        | 'style' 
    > {
        /** NOTE: type can't be a function, if you want to prompt this question conditionally, use `when` */
        type: T;
}

export interface TextPrompt<T extends string = string> extends GenericInputPrompt<'text' | 'input', T> {}
export interface PasswordPrompt<T extends string = string> extends GenericInputPrompt<'password', T> {}
export interface InvisiblePrompt<T extends string = string> extends GenericInputPrompt<'invisible', T> {}

export interface NumberPrompt<T extends string = string> 
    extends BasePrompt<T>,
    Pick<PromptObject<T>, 
        'validate' 
        | 'max' 
        | 'min' 
        | 'float' 
        | 'round' 
        | 'increment' 
        | 'style' 
    > {
        type: 'number';
}

export interface ConfirmPrompt<T extends string = string> 
    extends BasePrompt<T>,
    Pick<PromptObject<T>, 
        'format' 
    > {
        type: 'confirm';
}

export interface ListPrompt<T extends string = string> 
    extends BasePrompt<T>,
    Pick<PromptObject<T>, 
        'format' 
        | 'separator' 
    > {
        type: 'list';
}

export interface TogglePrompt<T extends string = string> 
    extends BasePrompt<T>,
    Pick<PromptObject<T>, 
        'format' 
        | 'active' 
        | 'inactive' 
    > {
        type: 'toggle';
}

export interface SelectPrompt<T extends string = string> 
    extends BasePrompt<T>,
    Pick<PromptObject<T>, 
        'format' 
        | 'hint' 
        | 'warn' 
    > {
        type: 'select';
        choices: string[] | PromptObject['choices']
}

export interface AutocompletePrompt<T extends string = string> 
    extends BasePrompt<T>,
    Pick<PromptObject<T>, 
        'format' 
        | 'suggest' 
        | 'limit' 
        | 'style' 
    > {
        type: 'autocomplete';
        choices: string[] | PromptObject['choices']
        /** Accept custom user input, other than what is listed in choices */
        suggestOnly?: boolean
}

export interface DatePrompt<T extends string = string> 
    extends BasePrompt<T>,
    Pick<PromptObject<T>, 
        'validate' 
        | 'mask' 
    > {
        type: 'date';
}

export type OptionDefinition = 
    TextPrompt
    | PasswordPrompt
    | InvisiblePrompt
    | NumberPrompt
    | ConfirmPrompt
    | ListPrompt
    | TogglePrompt
    | SelectPrompt
    | AutocompletePrompt
    | DatePrompt