import inquirer from "inquirer";
import { Form } from "./Form.js";
import { Store } from "./Store.js";

interface ScriptDefinition {
    name?: string;
    options?: OptionDefinition[] | OptionDefinitionGenerator;
    store?: UnknownObjectStructure;
    command?(options: OptionDefinition[], context: Context): void;
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
    parsedOptions?: UnknownObjectStructure;
    setupOnceOptions?: OptionDefinition[];
    storeDefaultOptions?: OptionDefinition[];
    command: (options: OptionDefinition[], context: Context) => void;
    store: UnknownObjectStructure;

    constructor(scriptDefinition: ScriptDefinition = {}, context = {}) {
        this.context = context
        this.options = scriptDefinition?.options
        this.command = scriptDefinition?.command
        this.store = scriptDefinition?.store
        this.name = scriptDefinition.name ?? 'test'  // TODO: dynamically fetch script name from caller 
        this.context.store = Store.read(this.name, this.store)

        this.setupOptions()
    }

    setupOptions() {
        this.optionsArray = (typeof this.options === 'function')
            ? this.options(this.context.store, this.parsedOptions)
            : this.options ?? []

        if (this.parsedOptions) {
            this.setupOnceOptions = this.optionsArray?.filter(o => o.setupOnce === true)
            this.setupOnceOptions?.filter(soo => this.context.store[soo.name] !== undefined).forEach(soo => {
                this.parsedOptions[soo.name] = this.context.store[soo.name]
                this.optionsArray = this.optionsArray?.filter(o => o.name !== soo.name)
            })
        }

        this.storeDefaultOptions = this.optionsArray?.filter(o => o.storeDefault === true)
        this.storeDefaultOptions?.filter(soo => this.context.store[soo.name] !== undefined).forEach(soo => {
            this.optionsArray.find(o => o.name === soo.name).default = this.context.store[soo.name]
        })


    }

    async runForm() {
        this.setupOptions()
        this.parsedOptions = await Form.run(this.optionsArray, this.parsedOptions)
        this.setupOnceOptions?.forEach(o => this.context.store[o.name] = this.parsedOptions[o.name])
        this.storeDefaultOptions?.forEach(o => this.context.store[o.name] = this.parsedOptions[o.name])
    }
}