import { Context } from "./Context";
import { OptionDefinition } from "./OptionDefinition";
import { Script } from "./Script";

interface UnknownObjectStructure {
    [key: string]: any;
}

type OptionDefinitionGenerator = (store: UnknownObjectStructure, options?: UnknownObjectStructure) => OptionDefinition[];

export interface ScriptDefinition {
    name?: string;
    options?: OptionDefinition[] | OptionDefinitionGenerator
    store?: UnknownObjectStructure;
    command?(options: OptionDefinition[], context: Context): Promise<any>;
}

export class SmartScriptDefinition implements ScriptDefinition {
    name?: string;
    store?: UnknownObjectStructure;
    command?(options: UnknownObjectStructure, context: Context): Promise<any>;
    script: Script

    private optionsSource?: OptionDefinition[] | OptionDefinitionGenerator

    constructor(definition: ScriptDefinition, script: Script) {
        this.script = script
        this.name = definition.name
        this.optionsSource = definition.options
        this.store = definition.store
        this.command = definition.command
    }

    get options(): OptionDefinition[] {
        return ((typeof this.optionsSource === 'function')
            ? this.optionsSource(this.script.store, this.script.options)
            : this.optionsSource ?? []
        )
    }

    get setupOnceOptions(): OptionDefinition[] {
        return this.options?.filter(o => o.setupOnce === true)
    }

    get storeDefaultOptions(): OptionDefinition[] {
        return this.options?.filter(o => o.storeDefault === true)
    }
}