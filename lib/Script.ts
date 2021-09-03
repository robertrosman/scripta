import inquirer from "inquirer";
import { Store } from "./Store.js";

interface ScriptDefinition {
    name?: string;
    options?: OptionDefinition[] | OptionDefinitionGenerator;
    store?: UnknownObjectStructure;
    run?(options: OptionDefinition[], context: Context): void;
}

interface OptionDefinition extends inquirer.Question {
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


export class Script {
    name: string;
    context: Context;
    options?: OptionDefinition[] | OptionDefinitionGenerator;
    optionsArray: OptionDefinition[];
    run: (options: OptionDefinition[], context: Context) => void;
    store: UnknownObjectStructure;

    constructor(scriptDefinition: ScriptDefinition = {}, context = {}) {
        this.context = context
        this.options = scriptDefinition?.options
        this.run = scriptDefinition?.run
        this.store = scriptDefinition?.store
        this.name = scriptDefinition.name ?? 'test'  // TODO: dynamically fetch script name from caller 
        this.context.store = Store.read(this.name, this.store)

        this.setupOptions()
    }

    setupOptions() {
        this.optionsArray = (typeof this.options === 'function')
            ? this.options(this.context.store)
            : this.options ?? []
    }
}