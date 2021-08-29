#!/usr/bin/env node
import { Command } from 'commander'; // (normal include)
import * as zx from 'zx'
import path from 'path'
import { addOptions, generateCommandArguments, interactiveFallback } from '../zop-options-parser/lib/resolve-options.js'
import { createStore } from './lib/store.js'
import { __dirname, getFilesRecursively } from './lib/utils.js'

(async () => {
    const program = new Command();
    const availableScripts = {};
    const context = {}

    try {
        const scriptsPath = path.join(__dirname, 'scripts')
        const files = getFilesRecursively(scriptsPath)
        for (const file of files) {
            const name = file.replace(/\.\w+$/, '')
            const command = program.command(name)
            const script = await import(path.join(scriptsPath, file))
            addOptions(script.options ?? [], command)
            availableScripts[name] = createScriptCallback(name, script, context)
            command.action(availableScripts[name]);
        }
        program.exitOverride();
        program.parse();

    } catch (err) {
        if(err.code === 'commander.helpDisplayed') {
            process.exit(0)
        }
        else if(err.code === 'commander.help') {
            const script = await resolveScript(availableScripts)
            availableScripts[script]({});
        }
        else {
            console.error(err)
        }
    }

})()

const createScriptCallback = (name, script, context) => 
    async (parsedOptions) => {
        // TODO: print command with arguments for automation
        const store = createStore(name, script.store ?? {})
        const storeData = await store.get()
        context.store = storeData
        parsedOptions = await resolveOptions(script, parsedOptions, storeData)
        const commandArguments = generateCommandArguments(script.options, parsedOptions)
        console.log(`zse ${name} ${commandArguments}\n`)
        await script.run(parsedOptions, context)
        await store.set(storeData)
    }

const resolveOptions = async (script, parsedOptions, store) => {
    let options = script.interactiveOptions !== undefined
        ? script.interactiveOptions(store, parsedOptions)
        : script.options 

    const setupOnceOptions = options?.filter(o => o.setupOnce === true)
    setupOnceOptions?.filter(soo => store[soo.name] !== undefined).forEach(soo => {
        parsedOptions[soo.name] = store[soo.name]
        options = options?.filter(o => o.name !== soo.name)
    })

    const storeDefaultOptions = options?.filter(o => o.storeDefault === true)
    storeDefaultOptions?.filter(soo => store[soo.name] !== undefined).forEach(soo => {
        options.find(o => o.name === soo.name).default = store[soo.name]
    })

    parsedOptions = await interactiveFallback(options ?? [], parsedOptions)
    setupOnceOptions?.forEach(o => store[o.name] = parsedOptions[o.name])
    storeDefaultOptions?.forEach(o => store[o.name] = parsedOptions[o.name])
    return parsedOptions
}

const resolveScript = async (availableScripts) => {
    const availableScriptsOptions = [
        {
            type: 'autocomplete',
            name: 'script',
            message: 'Please choose a script to run',
            choices: Object.keys(availableScripts)
        }
    ]
    const { script } = await interactiveFallback(availableScriptsOptions, {});
    return script
}