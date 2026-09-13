import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const baseUrl = env.BASE_URL || 'http://localhost:8000'

  return {
    appType: 'spa',
    define: {
      __ENV_BASE_URL__: JSON.stringify(baseUrl),
    },
    server: {
      port: 5173,
      host: true,
    }
  }
})
