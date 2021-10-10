import chalk from "chalk";
import { ScriptDefinition, SmartScriptDefinition } from "./ScriptDefinition.js";
import { Context } from "./Context.js";
import { Form } from "./Form.js";

interface UnknownObjectStructure {
    [key: string]: any;
}

export class Script {
    name: string;
    definition: SmartScriptDefinition;
    context: Context;
    options?: UnknownObjectStructure;
    store: UnknownObjectStructure;

    constructor(scriptDefinition: ScriptDefinition, context?: Context) {
        this.definition = new SmartScriptDefinition(scriptDefinition, this)
        this.name = scriptDefinition.name ?? 'test'  // TODO: dynamically fetch script name from caller 
        if (context) {
            this.setContext(context)
        }
    }

    async run(options: UnknownObjectStructure = {}) {
        this.options = Object.assign(this.options ?? {}, options)
        const argumentCount = Object.keys(this.options).length
        await this.runForm()
        if (Object.keys(this.options).length - this.definition.setupOnceOptions.length > argumentCount) {
            const optionsExceptSetupOnce = this.definition.options.filter(o => o.setupOnce !== true)
            const commandArguments = this.context.argumentParser.generateCommandCall(optionsExceptSetupOnce, this.options)
            console.log(chalk.gray(`Running the following script:\nscripta ${this.name} ${commandArguments}\n`))
        }
        const result = await this.definition.command(this.options, this.context)
        this.context.storeManager.write(this.name, this.store)
        return result
    }

    async runForm() {
        this.setupOptions()
        const form = new Form(this.definition.options, this.options)
        this.options = await form.run()
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
            this.definition.options.find(o => o.name === soo.name).initial = this.store[soo.name]
        })
    }

    setContext(context: Context) {
        this.context = context
        this.store = this.context.storeManager.read(this.name, this.definition.store)
        this.context.store = this.store
    }
}