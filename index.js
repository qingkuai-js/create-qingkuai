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

// 主函数：异步执行初始化逻辑
async function main() {
    try {
        let targetPath
        let isCurrentDir = false
        let projectName = args[0]
        const useTS = args.includes("-ts")

        // 处理 . 表示在当前目录生成
        if (projectName === ".") {
            isCurrentDir = true
            targetPath = targetDir
            projectName = nodePath.basename(targetDir)
        } else {
            if (!projectName || /^-(?:ts)$/.test(projectName)) {
                projectName = "qingkuai-app"
            }
            targetPath = nodePath.resolve(targetDir, projectName)
        }

        if (!isCurrentDir && fsExtra.existsSync(targetPath)) {
            console.error(`Error: directory "${projectName}" already exists in current location.`)
            process.exit(1)
        }

        fsExtra.copySync(nodePath.resolve(dir, `./templates/${useTS ? "ts" : "js"}`), targetPath, {
            overwrite: isCurrentDir ? true : false
        })

        // 更新 index.html 中的 title
        const indexHtmlPath = nodePath.resolve(targetPath, "index.html")
        let indexHtmlContent = fsExtra.readFileSync(indexHtmlPath, "utf-8")
        indexHtmlContent = indexHtmlContent.replace(/<title>.*?<\/title>/, `<title>${projectName}</title>`)
        fsExtra.writeFileSync(indexHtmlPath, indexHtmlContent, "utf-8")

        const targetPkgPath = nodePath.resolve(targetPath, "package.json")
        const targetPkg = fsExtra.readJsonSync(targetPkgPath)
        const finalPkg = { name: projectName, ...targetPkg }

        // 获取最新版本并更新
        try {
            const qingkuaiVersion = await getLatestVersion("qingkuai")
            const vitePluginQingkuaiVersion = await getLatestVersion("vite-plugin-qingkuai")
            finalPkg.devDependencies["vite"] = "^8"
            finalPkg.dependencies["qingkuai"] = qingkuaiVersion
            finalPkg.devDependencies["vite-plugin-qingkuai"] = vitePluginQingkuaiVersion
        } catch (error) {
            console.warn(`⚠️  Warning: Could not fetch npm versions`)
            finalPkg.devDependencies["vite"] = "^8"
        }

        fsExtra.writeJsonSync(targetPkgPath, finalPkg, { spaces: 4 })

        fsExtra.renameSync(nodePath.resolve(targetPath, "_gitignore"), nodePath.resolve(targetPath, ".gitignore"))
        fsExtra.renameSync(nodePath.resolve(targetPath, "_qingkuairc"), nodePath.resolve(targetPath, ".qingkuairc"))

        // 清理无用文件和目录
        // 删除 .vscode 目录
        const vscodeDir = nodePath.resolve(targetPath, ".vscode")
        if (fsExtra.existsSync(vscodeDir)) {
            fsExtra.removeSync(vscodeDir)
        }

        // 删除 vite.svg
        const viteSvg = nodePath.resolve(targetPath, "public", "vite.svg")
        if (fsExtra.existsSync(viteSvg)) {
            fsExtra.removeSync(viteSvg)
        }

        // 保留 src/assets：模板中的样式与图标资源都在该目录下

        // 删除 .DS_Store 文件
        const dsStoreFiles = [
            nodePath.resolve(targetPath, ".DS_Store"),
            nodePath.resolve(targetPath, "src", ".DS_Store")
        ]
        dsStoreFiles.forEach(file => {
            if (fsExtra.existsSync(file)) {
                fsExtra.removeSync(file)
            }
        })

        console.log(`✨ Project initialized successfully!`)
        if (!isCurrentDir) {
            console.log(`📂 cd ${projectName}`)
        }
    } catch (error) {
        console.error("Error:", error.message)
        process.exit(1)
    }
}

// 从淘宝镜像获取包的最新版本
async function getLatestVersion(packageName) {
    try {
        const response = await fetch(`https://registry.npmmirror.com/${packageName}`)
        if (!response.ok) {
            throw new Error(`Failed to fetch ${packageName}`)
        }

        const data = await response.json()
        return data["dist-tags"].latest
    } catch (error) {
        console.warn(`⚠️  Warning: Could not fetch latest version for ${packageName}, using fallback`)
        return "latest"
    }
}

main()
