import { Script } from 'scripta'
import fs from 'fs'
import { constants } from 'fs'
import path from 'path'
import { paramCase } from 'change-case'

const nameifyScript = (name) => name.split('/').map(s => paramCase(s)).join('/')

export default new Script({
  name: 'add-script',

  options: [
    {
      name: 'name',
      type: 'input',
      message: 'Please enter the name of the new script',
      positionalArgument: true
    },
    {
      name: 'editor',
      type: 'input',
      message: 'Please enter your favorite editor command',
      // storeDefault: true
      setupOnce: true
    }
  ],

  command: async ({ name, editor }, { __dirname }) => {
    const filename = `${nameifyScript(name)}.js`
    const source = path.join(__dirname, 'dist', 'build', 'boilerplate.js')
    const destination = path.join(__dirname, 'scripts', filename)
    if (fs.existsSync(destination)) {
      console.log('Script already exists, opening existing script')
    }
    else {
      const buffer = await fs.promises.readFile(source)
      const newBody = buffer.toString().replace('__SCRIPT_NAME__', nameifyScript(name))
      await fs.promises.writeFile(destination, newBody)
    }
    await $`chmod +x ${destination}`
    await $`${editor} ${destination}`
  }
})