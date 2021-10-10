import { ArgumentParser } from "./ArgumentParser";
import { Form } from "./Form";
import { Store } from "./Store";

export interface Context {
    store?: Record<string, any>;
    __dirname?: string;
    installPath: string;
    configPath: string;
    argumentParser: ArgumentParser;
    storeManager: Store;
}