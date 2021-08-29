import fs from 'fs/promises'
import { constants } from 'fs'
import path from 'path'
import { paramCase } from 'change-case'
import { __dirname } from '../lib/utils.js'

export const options = [
    {
        name: 'name',
        type: 'input',
        message: 'Please enter the name of the new script'
    },
    {
        name: 'editor',
        type: 'input',
        message: 'Please enter your favorite editor command',
        // storeDefault: true
        setupOnce: true
    }
]

export const run = async ({ name, editor }) => {
    const filename = `${paramCase(name)}.js`
    const source = path.join(__dirname, 'lib', 'boilerplate.js')
    const destination = path.join(__dirname, 'scripts', filename)
    await fs.copyFile(source, destination, constants.COPYFILE_EXCL)
        .catch(err => console.log(`Script already exists, opening existing script`))
    await $`${editor} ${destination}`
}