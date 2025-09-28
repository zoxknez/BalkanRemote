import fs from 'node:fs'
import path from 'node:path'
import { config } from 'dotenv'

// Don't override already-set environment variables
const optionsBase = { override: false } as const

const cwd = process.cwd()
const localPath = path.resolve(cwd, '.env.local')
const defaultPath = path.resolve(cwd, '.env')

if (fs.existsSync(localPath)) {
  config({ path: localPath, ...optionsBase })
} else if (fs.existsSync(defaultPath)) {
  config({ path: defaultPath, ...optionsBase })
} else {
  // Fallback to default behavior (will do nothing if no .env present)
  config(optionsBase)
}
