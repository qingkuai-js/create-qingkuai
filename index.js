#!/usr/bin/env node

// 薄壳转发：模板单源已迁入 @qingkuai/cli（templates/），
// 此包仅保留 npm create qingkuai 生态入口，行为等价于 qingkuai init。
import nodeChildProcess from "node:child_process"

const args = process.argv.slice(2)
const child = nodeChildProcess.spawn(
    "npx",
    ["-y", "@qingkuai/cli", "init", ...args],
    { stdio: "inherit", shell: process.platform === "win32" }
)

child.on("error", error => {
    console.error(`Failed to invoke @qingkuai/cli: ${error.message}`)
    process.exit(1)
})
child.on("exit", code => process.exit(code ?? 1))
