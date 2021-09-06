import inquirer from "inquirer";
import { Script } from "./Script";

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

type OptionDefinitionGenerator = (store: UnknownObjectStructure, options?: UnknownObjectStructure) => OptionDefinition[];

export interface ScriptDefinition {
    name?: string;
    options?: OptionDefinition[] | OptionDefinitionGenerator
    store?: UnknownObjectStructure;
    command?(options: OptionDefinition[], context: Context): void;
}

export class SmartScriptDefinition implements ScriptDefinition {
    name?: string;
    store?: UnknownObjectStructure;
    command?(options: OptionDefinition[], context: Context): void;
    script: Script
    removedOptions: string[];

    private optionsSource?: OptionDefinition[] | OptionDefinitionGenerator

    constructor(definition: ScriptDefinition, script: Script) {
        this.script = script
        this.name = definition.name
        this.optionsSource = definition.options
        this.store = definition.store
        this.command = definition.command
        this.removedOptions = []
    }

    get options(): OptionDefinition[] {
        return ((typeof this.optionsSource === 'function')
            ? this.optionsSource(this.script.store, this.script.options)
            : this.optionsSource ?? []
        ).filter(o => !this.removedOptions.includes(o.name))
    }

    get setupOnceOptions(): OptionDefinition[] {
        return this.options?.filter(o => o.setupOnce === true)
    }

    get storeDefaultOptions(): OptionDefinition[] {
        return this.options?.filter(o => o.storeDefault === true)
    }

    removeOption(name: string) {
        this.removedOptions.push(name)
    }

}