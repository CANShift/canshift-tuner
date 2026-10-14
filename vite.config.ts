import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const FIRMWARE_PKG_PATH = resolve(__dirname, '../canshift-firmware/package.json')
const firmwareMajor = existsSync(FIRMWARE_PKG_PATH)
  ? Number(
      (JSON.parse(readFileSync(FIRMWARE_PKG_PATH, 'utf8')) as { version: string }).version.split(
        '.'
      )[0] ?? 0
    )
  : Number(readFileSync(resolve(__dirname, 'firmware-major.txt'), 'utf8').trim())

const FLAT_HASHED_SCRIPT = '[hash:10].js'
const FLAT_HASHED_ASSET = '[hash:10][extname]'

const CORE_SRC_INDEX = resolve(__dirname, '../canshift-core/src/index.ts')
const CORE_SIBLING_READY =
  existsSync(CORE_SRC_INDEX) && existsSync(resolve(__dirname, '../canshift-core/node_modules'))

export default defineConfig(({ command }) => ({
  root: resolve(__dirname, '.'),
  define: {
    __EXPECTED_FIRMWARE_MAJOR__: JSON.stringify(firmwareMajor),
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@lib': resolve(__dirname, 'src/lib'),
      '@components': resolve(__dirname, 'src/components'),
      '@stores': resolve(__dirname, 'src/stores'),
      '@services': resolve(__dirname, 'src/transport'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      ...(command === 'serve' && CORE_SIBLING_READY ? { '@canshift/core': CORE_SRC_INDEX } : {}),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: '',
    target: 'es2022',
    sourcemap: false,
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        entryFileNames: FLAT_HASHED_SCRIPT,
        chunkFileNames: FLAT_HASHED_SCRIPT,
        assetFileNames: FLAT_HASHED_ASSET,
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react'
          }
          if (id.includes('node_modules/react-router')) {
            return 'vendor-router'
          }
          if (id.includes('node_modules/@radix-ui')) {
            return 'vendor-radix'
          }
          if (id.includes('node_modules/zustand') || id.includes('node_modules/immer')) {
            return 'vendor-state'
          }
          if (id.includes('node_modules/zod') || id.includes('src/lib/strict-csp')) {
            return 'vendor-zod'
          }
          return undefined
        },
      },
    },
  },
}))
