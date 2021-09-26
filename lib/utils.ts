import path from 'path'
import fs from 'fs'
import os from 'os'
import dirname from 'es-dirname'
import('console.mute')

export const __dirname = path.join(dirname(), '..', '..')
export const installPath = __dirname
export const configPath = path.join(os.homedir(), '.scripta')

export const scriptsPath = path.join(__dirname, 'scripts')

export const muteConsole = () => (console as any).mute({ keepNewLines: true })
export const unmuteConsole = (logHistory) => { 
  const history = (console as any).resume()
  if (logHistory) {
    history.stdout.forEach((l: any) => console.log(l))
  }
}

export const getFilesRecursively = (basePath: string, relativePath?: string) => {
  relativePath = relativePath || ''
  const files = []
  const fullPath = path.join(basePath, relativePath)
  const filesInDirectory = fs.readdirSync(fullPath)
  for (const file of filesInDirectory) {
    const relative = path.join(relativePath, file)
    const absolute = path.join(basePath, relative)
    if (fs.statSync(absolute).isDirectory()) {
      files.push(...getFilesRecursively(basePath, relative))
    } else {
      files.push(relative)
    }
  }
  return files
}

export const nameifyScript = (filename) => {
  const absolutePath = path.resolve(filename)
  const relativeToScriptsFolder = path.join(path.relative(scriptsPath, absolutePath))
  const withoutExtension = relativeToScriptsFolder.replace(/\.\w+$/, '')
  return withoutExtension
}