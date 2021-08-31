import inquirer from "inquirer";
import { Store } from "./store";

interface ScriptDefinition {
    options?: OptionDefinition[] | OptionDefinitionGenerator;
    store?: object;
    run?(options: OptionDefinition[], context: Context): void;
}

interface OptionDefinition extends inquirer.Question {
    storeDefault: boolean;
    setupOnce: boolean;
}

interface Context {
    store?: object;
}

type OptionDefinitionGenerator = (store: object, parsedOptions?: object) => [OptionDefinition];


export class Script {
    context: Context;
    options?: OptionDefinition[] | OptionDefinitionGenerator;
    optionsArray: OptionDefinition[];
    storeInstance: Store;
    run: (options: OptionDefinition[], context: Context) => void;
    store: object

    constructor(scriptDefinition: ScriptDefinition = {}, context = {}) {
        this.context = context
        this.optionsArray = []
        this.storeInstance = null
        this.options = scriptDefinition?.options
        this.run = scriptDefinition?.run
        this.store = scriptDefinition?.store
    }
}