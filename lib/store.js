import fs from 'fs/promises'
import path from 'path'
import _ from 'lodash'
import { __dirname } from './utils.js'

const storeFilename = "store.json"
const filename = path.join(__dirname, storeFilename)

const readStore = async () => {
    try {
        const json = await fs.readFile(filename, { encoding: 'utf8'})
        return JSON.parse(json)
    }
    catch(err) {
        if (err.code === 'ENOENT') {
            await saveStore({})
            return await readStore()
        }
        else {
            throw err
        }
    }
}

const saveStore = async (data) => {
    const json = JSON.stringify(data)
    await fs.writeFile(filename, json, { encoding: 'utf8'})
}

export const createStore = (name, defaults) => ({
    get: async () => {
        const data = await readStore()
        return _.merge(defaults, data[name])
    },
    set: async (inputData) => {
        const data = await readStore()
        data[name] = inputData
        await saveStore(data)
    }
})