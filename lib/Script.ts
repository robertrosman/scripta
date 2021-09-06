import inquirer from "inquirer";
import { Form } from "./Form.js";
import { ScriptDefinition, SmartScriptDefinition, OptionDefinition } from "./ScriptDefinition.js";
import { Store } from "./Store.js";

interface Context {
    store?: UnknownObjectStructure;
}

interface UnknownObjectStructure {
    [key: string]: any;
}

export class Script {
    name: string;
    definition: SmartScriptDefinition;
    context: Context;
    options?: UnknownObjectStructure;
    store: UnknownObjectStructure;

    constructor(scriptDefinition: ScriptDefinition = {}, context = {}) {
        this.definition = new SmartScriptDefinition(scriptDefinition, this)
        this.context = context
        this.name = scriptDefinition.name ?? 'test'  // TODO: dynamically fetch script name from caller 
        this.store = Store.read(this.name, this.definition.store)
        this.context.store = this.store
    }

    setupOptions() {
        if (this.options) {
            this.definition.setupOnceOptions.filter(soo => this.store[soo.name] !== undefined).forEach(soo => {
                this.options[soo.name] = this.store[soo.name]
                this.definition.removeOption(soo.name)
            })
        }

        this.definition.storeDefaultOptions.filter(soo => this.store[soo.name] !== undefined).forEach(soo => {
            this.definition.options.find(o => o.name === soo.name).default = this.store[soo.name]
        })
    }

    async runForm() {
        this.setupOptions()
        this.options = await Form.run(this.definition.options, this.options)
        this.definition.setupOnceOptions.forEach(o => this.store[o.name] = this.options[o.name])
        this.definition.storeDefaultOptions.forEach(o => this.store[o.name] = this.options[o.name])
    }
}