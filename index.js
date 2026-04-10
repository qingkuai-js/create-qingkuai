#!/usr/bin/env node

import fsExtra from "fs-extra"
import nodeUrl from "node:url"
import nodePath from "node:path"

const args = process.argv.slice(2)
const targetDir = process.env.INIT_CWD || process.cwd()
const dir = nodePath.dirname(nodeUrl.fileURLToPath(import.meta.url))

let projectName = args[0]
if (!projectName || /^-(?:ts)$/.test(projectName)) {
    projectName = "qingkuai-app"
}

const targetPath = nodePath.resolve(targetDir, projectName)
if (fsExtra.existsSync(targetPath)) {
    console.error(`Error: directory "${projectName}" already exists in current location.`)
    process.exit(1)
}

const useTS = args.includes("-ts")
fsExtra.copySync(nodePath.resolve(dir, `./templates/${useTS ? "ts" : "js"}`), targetPath)

const targetPkgPath = nodePath.resolve(targetPath, "package.json")
const targetPkg = fsExtra.readJsonSync(targetPkgPath)
targetPkg.name = projectName
fsExtra.writeJsonSync(targetPkgPath, targetPkg, { spaces: 4 })

fsExtra.renameSync(nodePath.resolve(targetPath, "_gitignore"), nodePath.resolve(targetPath, ".gitignore"))
fsExtra.renameSync(nodePath.resolve(targetPath, "_qingkuairc"), nodePath.resolve(targetPath, ".qingkuairc"))
