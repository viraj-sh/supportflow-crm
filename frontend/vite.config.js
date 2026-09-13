import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import fs from 'fs'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const baseUrl = env.BASE_URL || 'http://localhost:8000'
  const outDir = env.VITE_OUT_DIR || path.resolve(import.meta.dirname, '../backend/app/static')
  const assetBase = env.VITE_BASE_PATH || '/static/'

  // Ensure output directory exists
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true })
  }

  console.log(`[Vite Build Config] Output Directory: ${outDir}`)
  console.log(`[Vite Build Config] Base Path: ${assetBase}`)

  return {
    appType: 'spa',
    base: assetBase,
    build: {
      outDir: outDir,
      emptyOutDir: true,
    },
    define: {
      __ENV_BASE_URL__: JSON.stringify(baseUrl),
    },
    server: {
      port: 5173,
      host: true,
    }
  }
})
