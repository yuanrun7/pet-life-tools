import { fileURLToPath, URL } from 'node:url'

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const root = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        home: `${root}index.html`,
        schedule: `${root}schedule/index.html`,
        cost: `${root}cost/index.html`,
        lostPet: `${root}lost-pet/index.html`,
        records: `${root}records/index.html`,
        guide: `${root}guide/index.html`,
      },
    },
  },
})
