#!/usr/bin/env node

import fsExtra from "fs-extra"
import nodeUrl from "node:url"
import nodePath from "node:path"

const args = process.argv.slice(2)
const targetDir = process.env.INIT_CWD || process.cwd()
const dir = nodePath.dirname(nodeUrl.fileURLToPath(import.meta.url))

// 处理 help 命令
if (args.includes("--help") || args.includes("-h") || args[0] === "help") {
    console.log(`
Usage: create-qingkuai [project-name] [options]

Arguments:
  project-name          Project directory name (use "." to create in current directory)

Options:
  -ts                   Use TypeScript template (default: JavaScript)
  --help, -h            Show this help message

Examples:
  create-qingkuai my-app
  create-qingkuai my-app -ts
  create-qingkuai .
  create-qingkuai . -ts
    `)
    process.exit(0)
}

let projectName = args[0]
let isCurrentDir = false

// 处理 . 表示在当前目录生成
if (projectName === ".") {
    isCurrentDir = true
    projectName = nodePath.basename(targetDir)
} else if (!projectName || /^-(?:ts)$/.test(projectName)) {
    projectName = "qingkuai-app"
}

const targetPath = isCurrentDir ? targetDir : nodePath.resolve(targetDir, projectName)
if (!isCurrentDir && fsExtra.existsSync(targetPath)) {
    console.error(`Error: directory "${projectName}" already exists in current location.`)
    process.exit(1)
}

const useTS = args.includes("-ts")
fsExtra.copySync(nodePath.resolve(dir, `./templates/${useTS ? "ts" : "js"}`), targetPath, {
    overwrite: isCurrentDir ? true : false
})

const targetPkgPath = nodePath.resolve(targetPath, "package.json")
const targetPkg = fsExtra.readJsonSync(targetPkgPath)
targetPkg.name = projectName
fsExtra.writeJsonSync(targetPkgPath, targetPkg, { spaces: 4 })

fsExtra.renameSync(nodePath.resolve(targetPath, "_gitignore"), nodePath.resolve(targetPath, ".gitignore"))
fsExtra.renameSync(nodePath.resolve(targetPath, "_qingkuairc"), nodePath.resolve(targetPath, ".qingkuairc"))

console.log(`✨ Project initialized successfully!`)
if (!isCurrentDir) {
    console.log(`📂 cd ${projectName}`)
}
