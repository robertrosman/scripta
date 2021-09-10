import inquirer from "inquirer";
import { ArgumentParser } from "./ArgumentParser.js";
import { Form } from "./Form.js";
import { ScriptDefinition, SmartScriptDefinition, OptionDefinition } from "./ScriptDefinition.js";
import { Store } from "./Store.js";
import { unmuteConsole } from "./utils.js";

interface Context {
    store?: UnknownObjectStructure;
    __dirname?: string;
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

    async run(options: UnknownObjectStructure = {}) {
        unmuteConsole(false)
        this.options = Object.assign(this.options ?? {}, options)
        const argumentCount = Object.keys(this.options).length
        await this.runForm()
        if (Object.keys(this.options).length - this.definition.setupOnceOptions.length > argumentCount) {
            const optionsExceptSetupOnce = this.definition.options.filter(o => o.setupOnce !== true)
            const commandArguments = new ArgumentParser().generateCommandCall(optionsExceptSetupOnce, this.options)
            console.log(`Running the following script:\nscripta ${this.name} ${commandArguments}\n`)
        }
        const result = await this.definition.command(this.options, this.context)
        Store.write(this.name, this.store)
        return result
    }

    async runForm() {
        this.setupOptions()
        this.options = await Form.run(this.definition.options, this.options)
        this.definition.setupOnceOptions.forEach(o => this.store[o.name] = this.options[o.name])
        this.definition.storeDefaultOptions.forEach(o => this.store[o.name] = this.options[o.name])
    }

    setupOptions() {
        if (this.options) {
            this.definition.setupOnceOptions.filter(soo => this.options[soo.name] === undefined && this.store[soo.name] !== undefined).forEach(soo => {
                this.options[soo.name] = this.store[soo.name]
            })
        }

        this.definition.storeDefaultOptions.filter(soo => this.store[soo.name] !== undefined).forEach(soo => {
            this.definition.options.find(o => o.name === soo.name).default = this.store[soo.name]
        })
    }

    extendContext(additionalProperties: object) {
        Object.assign(this.context, additionalProperties)
    }
}