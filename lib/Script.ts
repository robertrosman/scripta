
export class Script {
    context
    options
    optionsArray
    storeInstance
    run: (options, context) => {}
    store: object

    constructor(scriptDefinition, context) {
        this.context = context
        this.optionsArray = []
        this.storeInstance = null
        this.options = scriptDefinition.options
        this.run = scriptDefinition.run
        this.store = scriptDefinition.store
    }
}