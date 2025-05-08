#!/usr/bin/env node

import fs from "fs-extra"
import path from "node:path"
import { fileURLToPath } from "node:url"

const args = process.argv.slice(2)
const targetDir = process.env.INIT_CWD || process.cwd()
const dir = path.dirname(fileURLToPath(import.meta.url))

let projectName = args[0]
if (!projectName || /^-(?:ts)$/.test(projectName)) {
    projectName = "qingkuai-app"
}

const targetPath = path.resolve(targetDir, projectName)
if (fs.existsSync(targetPath)) {
    console.error(`Error: directory "${projectName}" already exists in current location.`)
    process.exit(1)
}

const useTS = args.includes("-ts")
fs.copySync(path.resolve(dir, `./templates/${useTS ? "ts" : "js"}`), targetPath)
fs.renameSync(path.resolve(targetPath, "_gitignore"), path.resolve(targetPath, ".gitignore"))
