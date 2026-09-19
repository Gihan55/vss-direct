import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Dedicated port for this project (3000 = DPR, 3001 = HRIS API,
    // 5173 = HRIS frontend). strictPort prevents silent drifting
    // onto another project's port when this one is busy.
    port: 3002,
    strictPort: true,
    host: true,
    // Local pretty hostname served by the workspace reverse proxy (port 80).
    allowedHosts: ['local.vss.msd.com']
  }
})
