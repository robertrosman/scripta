import inquirer from "inquirer";
import { Store } from "./Store.js";

interface ScriptDefinition {
    options?: OptionDefinition[] | OptionDefinitionGenerator;
    store?: StoreDefinition;
    run?(options: OptionDefinition[], context: Context): void;
}

interface OptionDefinition extends inquirer.Question {
    storeDefault: boolean;
    setupOnce: boolean;
}

interface Context {
    store?: StoreDefinition;
}

type StoreDefinition = object;

type OptionDefinitionGenerator = (store: object, parsedOptions?: object) => [OptionDefinition];


export class Script {
    context: Context;
    options?: OptionDefinition[] | OptionDefinitionGenerator;
    optionsArray: OptionDefinition[];
    run: (options: OptionDefinition[], context: Context) => void;
    store: StoreDefinition;

    constructor(scriptDefinition: ScriptDefinition = {}, context = {}) {
        this.context = context
        this.optionsArray = []
        this.options = scriptDefinition?.options
        this.run = scriptDefinition?.run
        this.store = scriptDefinition?.store
    }
}