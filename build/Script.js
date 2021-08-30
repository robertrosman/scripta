export class Script {
    constructor(scriptDefinition) {
        this.context = {};
        this.optionsArray = [];
        this.storeInstance = null;
        this.options = scriptDefinition.options;
        this.run = scriptDefinition.run;
        this.store = scriptDefinition.store;
    }
}
