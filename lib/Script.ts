import inquirer from "inquirer";
import { Form } from "./Form.js";
import { ScriptDefinition, OptionDefinition } from "./ScriptDefinition.js";
import { Store } from "./Store.js";

interface Context {
    store?: UnknownObjectStructure;
}

interface UnknownObjectStructure {
    [key: string]: any;
}

export class Script {
    name: string;
    definition: ScriptDefinition;
    context: Context;
    optionsArray: OptionDefinition[];
    parsedOptions?: UnknownObjectStructure;
    setupOnceOptions?: OptionDefinition[];
    storeDefaultOptions?: OptionDefinition[];
    store: UnknownObjectStructure;

    constructor(scriptDefinition: ScriptDefinition = {}, context = {}) {
        this.definition = scriptDefinition
        this.context = context
        this.name = scriptDefinition.name ?? 'test'  // TODO: dynamically fetch script name from caller 
        this.store = Store.read(this.name, this.definition.store)
        this.context.store = this.store

        this.setupOptions()
    }

    setupOptions() {
        this.optionsArray = (typeof this.definition.options === 'function')
            ? this.definition.options(this.store, this.parsedOptions)
            : this.definition.options ?? []

        if (this.parsedOptions) {
            this.setupOnceOptions = this.optionsArray?.filter(o => o.setupOnce === true)
            this.setupOnceOptions?.filter(soo => this.store[soo.name] !== undefined).forEach(soo => {
                this.parsedOptions[soo.name] = this.store[soo.name]
                this.optionsArray = this.optionsArray?.filter(o => o.name !== soo.name)
            })
        }

        this.storeDefaultOptions = this.optionsArray?.filter(o => o.storeDefault === true)
        this.storeDefaultOptions?.filter(soo => this.store[soo.name] !== undefined).forEach(soo => {
            this.optionsArray.find(o => o.name === soo.name).default = this.store[soo.name]
        })


    }

    async runForm() {
        this.setupOptions()
        this.parsedOptions = await Form.run(this.optionsArray, this.parsedOptions)
        this.setupOnceOptions?.forEach(o => this.store[o.name] = this.parsedOptions[o.name])
        this.storeDefaultOptions?.forEach(o => this.store[o.name] = this.parsedOptions[o.name])
    }
}