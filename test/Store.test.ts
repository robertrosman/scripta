import { Store } from '../lib/Store'

import fs from 'fs';
jest.mock('fs')
const mockFs = fs as jest.Mocked<typeof fs>;
let fsMockData: any = {}
let store: Store

describe('Store', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        jest.restoreAllMocks();
        fsMockData = {
            test: {
                testData: true
            }
        }
        store = new Store()
        Store.cache = Object.assign({}, fsMockData)
        mockFs.readFileSync.mockImplementation((filename) => JSON.stringify(fsMockData))
        mockFs.writeFileSync.mockImplementation((filename, data) => { fsMockData = JSON.parse(data.toString()); })
    });

    test('read returns correct data', async () => {
        const data = store.read('test')

        expect(data).toEqual(fsMockData.test)
    })

    test('write saves correct data', async () => {
        store.write('test', { newProp: true })

        expect(fsMockData.test.newProp).toEqual(true)
    })

    test('default values get merged', async () => {
        const defaults = {
            some: {
                valid: {
                    dataStructure: []
                }
            }
        }
        const data = store.read('test', defaults)

        expect(Array.isArray(data.some.valid.dataStructure)).toBe(true)
        expect(data.testData).toEqual(true)
    })

    test('cache store data to avoid multiple disk reads', async () => {
        Store.cache = undefined
        store.read('test')
        store.read('test')
        store.read('test')
        store.read('test')

        expect(mockFs.readFileSync).toHaveBeenCalledTimes(1)
    })
})