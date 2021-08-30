// Hack to include __dirname in modules
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

// export const __filename = fileURLToPath(import.meta.url)

// export const __dirname = path.resolve(path.dirname(__filename), '..')

export const getFilesRecursively = (basePath, relativePath) => {
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
