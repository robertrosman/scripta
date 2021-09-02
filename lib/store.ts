import fs from 'fs'
import path from 'path'
import _ from 'lodash'
import { __dirname } from './utils.js'

const storeFilename = 'store.json'
const filename = path.join(__dirname, storeFilename)

const readStore = () => {
  try {
    const json = fs.readFileSync(filename, { encoding: 'utf8' })
    return JSON.parse(json)
  } catch (err) {
    if (err.code === 'ENOENT') {
      saveStore({})
      return readStore()
    } else {
      throw err
    }
  }
}

const saveStore = (data) => {
  const json = JSON.stringify(data)
  fs.writeFileSync(filename, json, { encoding: 'utf8' })
}

export class Store {
  private static _cache: object

  static get cache() {
    if (!this._cache) {
      this._cache = readStore()
    }
    return this._cache
  }

  static set cache(value) {
    this._cache = value
    if (!!value) {
      saveStore(this._cache)
    }
  }

  static read(name: string, defaults: object = {}) {
    const data = Object.assign({}, this.cache)
    return _.merge(defaults, data[name])
  }

  static write(name: string, data: object) {
    const storeData = readStore()
    storeData[name] = data
    this.cache = storeData
  }

}