'use strict'

const fs = require('node:fs')
const path = require('node:path')
const dotenv = require('dotenv')

const optionsBase = { override: false }

const cwd = process.cwd()
const localPath = path.resolve(cwd, '.env.local')
const defaultPath = path.resolve(cwd, '.env')

if (fs.existsSync(localPath)) {
  dotenv.config({ path: localPath, ...optionsBase })
} else if (fs.existsSync(defaultPath)) {
  dotenv.config({ path: defaultPath, ...optionsBase })
} else {
  dotenv.config(optionsBase)
}
