import { Store } from '../lib/Store'

import { promises as fs } from 'fs';
let fsMockData: any = {}

let fsSpy = { readFile: null, writeFile: null};

describe('Store', () => {
    beforeEach(() => {
        jest.resetAllMocks();
        fsMockData = {
            test: {
                testData: true
            }
        }
        fsSpy.readFile = jest.spyOn(fs, 'readFile').mockImplementation(async () => JSON.stringify(fsMockData))
        fsSpy.writeFile = jest.spyOn(fs, 'writeFile').mockImplementation(async (filename, data) => { fsMockData = JSON.parse(data.toString()); })
    });

    test('get returns correct data', async () => {
        const data = await Store.read('test')

        expect(data).toEqual(fsMockData.test)
    })

    test('set saves correct data', async () => {
        await Store.write('test', { newProp: true })

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
        const data = await Store.read('test', defaults)

        expect(Array.isArray(data.some.valid.dataStructure)).toBe(true)
        expect(data.testData).toEqual(true)
    })
})