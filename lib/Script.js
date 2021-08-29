
export class Script {
    constructor(scriptDefinition) {
        this.context = {}
        this.options = scriptDefinition.options
        this.run = scriptDefinition.run
        this.store = scriptDefinition.store
    }
}