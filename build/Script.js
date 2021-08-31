export class Script {
    constructor(scriptDefinition, context) {
        this.context = context;
        this.optionsArray = [];
        this.storeInstance = null;
        this.options = scriptDefinition.options;
        this.run = scriptDefinition.run;
        this.store = scriptDefinition.store;
    }
}
