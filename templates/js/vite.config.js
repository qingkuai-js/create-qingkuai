import { defineConfig } from "vite"
import qingkuai from "vite-plugin-qingkuai"

// https://vite.dev/config/
export default defineConfig({
    css: {
        devSourcemap: true
    },
    plugins: [qingkuai()]
})
