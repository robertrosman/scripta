import inquirer from "inquirer";

export interface OptionDefinition extends inquirer.Question {
    storeDefault?: boolean;
    setupOnce?: boolean;
}

interface Context {
    store?: UnknownObjectStructure;
}

interface UnknownObjectStructure {
    [key: string]: any;
}

type OptionDefinitionGenerator = (store: UnknownObjectStructure, parsedOptions?: UnknownObjectStructure) => [OptionDefinition];

export class ScriptDefinition {
    name?: string;
    options?: OptionDefinition[] | OptionDefinitionGenerator;
    store?: UnknownObjectStructure;
    command?(options: OptionDefinition[], context: Context): void;
}