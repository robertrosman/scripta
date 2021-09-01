import path from 'path'
import fs from 'fs'
import dirname from 'es-dirname'

export const __dirname = path.join(dirname(), '..', '..')

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
